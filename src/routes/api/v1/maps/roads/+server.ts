import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { TAINT_ITEM_ID } from '$lib/util/const';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const roads = await query('SELECT * FROM roads');
	return json({ success: true, roads });
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const owner_id = me.id;
	const { name, land_a_id, land_b_id } = await request.json();

	if (!name || !owner_id || !land_a_id || !land_b_id) {
		return json({ success: false, message: 'Missing required fields' }, { status: 400 });
	}

	const landA = await query('SELECT * FROM lands WHERE id = ?', [land_a_id]);
	const landB = await query('SELECT * FROM lands WHERE id = ?', [land_b_id]);

	if (landA.length === 0 || landB.length === 0) {
		return json({ success: false, message: 'Land not found' }, { status: 404 });
	}

	const stock = await query('SELECT * FROM inventory WHERE user_id = ? AND item_id = ?', [
		owner_id,
		TAINT_ITEM_ID
	]);

	const distance = Math.sqrt(
		Math.pow(landA[0].position_x - landB[0].position_x, 2) +
			Math.pow(landA[0].position_y - landB[0].position_y, 2)
	);
	const taintCost = Math.ceil(distance);

	if (stock.length === 0 || stock[0].quantity < taintCost) {
		return json({ success: false, message: 'Insufficient taint' }, { status: 400 });
	}

	const duplicationCheck = await query(
		`SELECT id FROM roads WHERE ST_Crosses(line, ST_LineStringFromText(?)) OR ST_Overlaps(line, ST_LineStringFromText(?))`,
		[
			`LINESTRING(${landA[0].position_x} ${landA[0].position_y}, ${landB[0].position_x} ${landB[0].position_y})`,
			`LINESTRING(${landA[0].position_x} ${landA[0].position_y}, ${landB[0].position_x} ${landB[0].position_y})`
		]
	);

	if (duplicationCheck.length > 0) {
		return json({ success: false, message: 'Road intersects with existing road' }, { status: 400 });
	}

	await query('UPDATE inventory SET quantity = quantity - ? WHERE user_id = ? AND item_id = ?', [
		taintCost,
		owner_id,
		TAINT_ITEM_ID
	]);
	await query(
		'INSERT INTO roads (name, owner_id, land_a_id, land_b_id, line) VALUES (?, ?, ?, ?, ST_LineStringFromText(?))',
		[
			name,
			owner_id,
			land_a_id,
			land_b_id,
			`LINESTRING(${landA[0].position_x} ${landA[0].position_y}, ${landB[0].position_x} ${landB[0].position_y})`
		]
	);

	return json({ success: true });
};
