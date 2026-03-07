import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { getUserName } from '$lib/server/people';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, cookies }) => {
	const userId = params.userId;

	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	if (me.id !== userId && !(await isAdmin(me.id))) {
		return json({ success: false, message: 'Forbidden' }, { status: 403 });
	}

	const inventory = await query(
		'SELECT items.id, items.name, inventory.quantity FROM inventory JOIN items ON inventory.item_id = items.id WHERE inventory.user_id = ?',
		[userId]
	);

	for (const item of inventory) {
		item.item = (await query('SELECT * FROM items WHERE id = ?', [item.id]))[0];
		item.item.maker_name = await getUserName(item.item.maker);
	}

	return json({ success: true, inventory });
};

export const POST: RequestHandler = async ({ params, cookies, request }) => {
	const userId = params.userId;

	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	if (!(await isAdmin(me.id))) {
		return json({ success: false, message: 'Forbidden' }, { status: 403 });
	}

	const { item_id, quantity } = await request.json();

	if (!item_id || !quantity) {
		return json({ success: false, message: 'Item ID and quantity are required' }, { status: 400 });
	}

	const item = await query('SELECT * FROM items WHERE id = ?', [item_id]);

	if (item.length === 0) {
		return json({ success: false, message: 'Item not found' }, { status: 404 });
	}

	const existingStock = await query('SELECT * FROM inventory WHERE item_id = ? AND user_id = ?', [
		item_id,
		userId
	]);

	if (existingStock.length > 0) {
		await query('UPDATE inventory SET quantity = quantity + ? WHERE item_id = ? AND user_id = ?', [
			quantity,
			item_id,
			userId
		]);
	} else {
		await query('INSERT INTO inventory (user_id, item_id, quantity) VALUES (?, ?, ?)', [
			userId,
			item_id,
			quantity
		]);
	}

	return json({ success: true, message: 'Stock added' });
};

export const DELETE: RequestHandler = async ({ params, cookies, request }) => {
	const userId = params.userId;

	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	if (!(await isAdmin(me.id))) {
		return json({ success: false, message: 'Forbidden' }, { status: 403 });
	}

	const { item_id, quantity } = await request.json();

	if (!item_id || !quantity) {
		return json({ success: false, message: 'Item ID and quantity are required' }, { status: 400 });
	}

	const existingStock = await query('SELECT * FROM inventory WHERE item_id = ? AND user_id = ?', [
		item_id,
		userId
	]);

	if (existingStock.length === 0) {
		return json({ success: false, message: 'Stock not found' }, { status: 404 });
	}

	if (existingStock[0].quantity < quantity) {
		return json({ success: false, message: 'Not enough stock to remove' }, { status: 400 });
	}

	if (existingStock[0].quantity === quantity) {
		await query('DELETE FROM inventory WHERE item_id = ? AND user_id = ?', [item_id, userId]);
	} else {
		await query('UPDATE inventory SET quantity = quantity - ? WHERE item_id = ? AND user_id = ?', [
			quantity,
			item_id,
			userId
		]);
	}

	return json({ success: true, message: 'Stock removed' });
};
