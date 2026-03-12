import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const PUT: RequestHandler = async ({ params, cookies, request }) => {
	const token = cookies.get('token');
	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);
	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const { buildingId } = params;
	const { owner_id } = await request.json();

	if (!owner_id) {
		return json({ success: false, message: 'Missing required fields' }, { status: 400 });
	}

	const building = await query('SELECT * FROM buildings WHERE id = ?', [buildingId]);

	if (building.length === 0) {
		return json({ success: false, message: 'Building not found' }, { status: 404 });
	}

	if (building[0].owner_id !== me.id) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	await query('UPDATE buildings SET owner_id = ? WHERE id = ?', [owner_id, buildingId]);

	return json({ success: true });
};
