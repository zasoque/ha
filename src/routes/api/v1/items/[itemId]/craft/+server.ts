import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { TAINT_ITEM_ID } from '$lib/util/const';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ params, request, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const { itemId } = params;
	const { quantity } = await request.json();

	if (!itemId || !quantity) {
		return json({ success: false, message: 'Missing itemId or quantity' }, { status: 400 });
	}

	const taintStock = await query(
		'SELECT * FROM inventory WHERE item_id = ? AND user_id = ? AND quantity > 0',
		[TAINT_ITEM_ID, me.id]
	);

	if (taintStock.length === 0 || taintStock[0].quantity < quantity) {
		return json({ success: false, message: 'Not enough taint in stock' }, { status: 400 });
	}

	if (taintStock[0].quantity === quantity) {
		await query('DELETE FROM inventory WHERE id = ?', [taintStock[0].id]);
	} else {
		await query('UPDATE inventory SET quantity = quantity - ? WHERE id = ?', [
			quantity,
			taintStock[0].id
		]);
	}

	const item = await query('SELECT * FROM items WHERE id = ?', [itemId]);

	if (item.length === 0) {
		return json({ success: false, message: 'Item not found' }, { status: 404 });
	}

	if (item[0].maker !== me.id) {
		return json({ success: false, message: 'You do not own this item' }, { status: 403 });
	}

	await query(
		'INSERT INTO inventory (user_id, item_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
		[me.id, itemId, quantity, quantity]
	);

	return json({ success: true, message: 'Item purchased successfully' });
};
