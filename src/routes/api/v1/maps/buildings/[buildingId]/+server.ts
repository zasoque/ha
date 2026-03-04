import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const { buildingId } = params;

	const building = await query('SELECT * FROM buildings WHERE id = ?', [buildingId]);

	if (building.length === 0) {
		return json({ success: false, message: 'Building not found' }, { status: 404 });
	}

	return json({ success: true, building: building[0] });
};

export const PUT: RequestHandler = async ({ params, request, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const { buildingId } = params;
	const { name } = await request.json();

	if (!name) {
		return json({ success: false, message: 'Missing required fields' }, { status: 400 });
	}

	const building = await query('SELECT * FROM buildings WHERE id = ?', [buildingId]);

	if (building.length === 0) {
		return json({ success: false, message: 'Building not found' }, { status: 404 });
	}

	if (building[0].owner_id !== me.id) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	await query('UPDATE buildings SET name = ? WHERE id = ?', [name, buildingId]);

	return json({ success: true });
};

export const DELETE: RequestHandler = async ({ params, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const buildingId = params.buildingId!;

	const building = await query('SELECT * FROM buildings WHERE id = ?', [buildingId]);

	if (building.length === 0) {
		return json({ success: false, message: 'Building not found' }, { status: 404 });
	}

	if (building[0].owner_id !== me.id && !(await isAdmin(me.id))) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const existingBuildings = await query('SELECT * FROM buildings WHERE land_id = ?', [
		building[0].land_id
	]);

	if (buildingId < existingBuildings[existingBuildings.length - 1].id) {
		return json(
			{ success: false, message: 'Cannot delete building with newer buildings' },
			{ status: 400 }
		);
	}

	await query('DELETE FROM buildings WHERE id = ?', [buildingId]);

	return json({ success: true });
};
