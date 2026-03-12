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

	const { landId } = params;
	const { owner_id } = await request.json();

	if (!owner_id) {
		return json({ success: false, message: 'Missing required fields' }, { status: 400 });
	}

	const land = await query('SELECT * FROM lands WHERE id = ?', [landId]);

	if (land.length === 0) {
		return json({ success: false, message: 'Land not found' }, { status: 404 });
	}

	if (land[0].owner_id !== me.id) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	await query('UPDATE lands SET owner_id = ? WHERE id = ?', [owner_id, landId]);

	return json({ success: true });
};
