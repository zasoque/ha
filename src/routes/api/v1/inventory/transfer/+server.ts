import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies, request }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const { to_user_id, item_id, quantity } = await request.json();

	if (!to_user_id || !item_id || !quantity) {
		return json(
			{ success: false, message: 'To user ID, item ID and quantity are required' },
			{ status: 400 }
		);
	}

	const item = await query('SELECT * FROM items WHERE id = ?', [item_id]);

	if (item.length === 0) {
		return json({ success: false, message: 'Item not found' }, { status: 404 });
	}

	const existingStock = await query('SELECT * FROM inventory WHERE item_id = ? AND user_id = ?', [
		item_id,
		me.id
	]);

	if (existingStock.length === 0 || existingStock[0].quantity < quantity) {
		return json({ success: false, message: 'Not enough stock' }, { status: 400 });
	}

	await query('UPDATE inventory SET quantity = quantity - ? WHERE item_id = ? AND user_id = ?', [
		quantity,
		item_id,
		me.id
	]);

	const recipientStock = await query('SELECT * FROM inventory WHERE item_id = ? AND user_id = ?', [
		item_id,
		to_user_id
	]);

	if (recipientStock.length === 0) {
		await query('INSERT INTO inventory (user_id, item_id, quantity) VALUES (?, ?, ?)', [
			to_user_id,
			item_id,
			quantity
		]);
	} else {
		await query('UPDATE inventory SET quantity = quantity + ? WHERE item_id = ? AND user_id = ?', [
			quantity,
			item_id,
			to_user_id
		]);
	}

	return json({ success: true, message: 'Item transferred' });
};
