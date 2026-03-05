import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { TAINT_ITEM_ID } from '$lib/util/const';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ params, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const { buildingId } = params;

	const building = await query('SELECT * FROM buildings WHERE id = ?', [buildingId]);

	if (building.length === 0) {
		return json({ success: false, message: 'Building not found' }, { status: 404 });
	}

	if (building[0].owner_id !== me.id && !isAdmin(me.id)) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const land = await query('SELECT * FROM lands WHERE id = ?', [building[0].land_id]);

	if (land.length === 0) {
		return json({ success: false, message: 'Land not found' }, { status: 404 });
	}

	const lastHarvest = await query(
		'SELECT * FROM harvests WHERE building_id = ? ORDER BY created_at DESC LIMIT 1',
		[buildingId]
	);

	const now = new Date().getTime();
	const waitDuration = now - lastHarvest[0]?.created_at.getTime() || 0;

	const quantity = Math.round(
		((land.fertility * Math.random() * waitDuration) / (1000 * 60 * 60 * 24 * 7)) * 2 * 2
	);

	await query('INSERT INTO harvests (building_id, quantity) VALUES (?, ?)', [buildingId, quantity]);

	const stock = await query('SELECT * FROM inventory WHERE user_id = ? AND item_id = ?', [
		me.id,
		TAINT_ITEM_ID
	]);

	if (stock.length === 0) {
		await query('INSERT INTO inventory (user_id, item_id, quantity) VALUES (?, ?, ?)', [
			me.id,
			TAINT_ITEM_ID,
			quantity
		]);
	} else {
		await query('UPDATE inventory SET quantity = quantity + ? WHERE user_id = ? AND item_id = ?', [
			quantity,
			me.id,
			TAINT_ITEM_ID
		]);
	}

	return json({ success: true, quantity });
};
