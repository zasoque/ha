import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { ensureAccountExists } from '$lib/server/auth';
import { query } from '$lib/server/db';
import { sendNotification } from '$lib/server/notification';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!(await isAdmin(me.id))) {
		return json({ success: false, error: 'Forbidden' }, { status: 403 });
	}

	const result = await query('SELECT * FROM admin_users');

	return json({ success: true, users: result });
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!(await isAdmin(me.id))) {
		return json({ success: false, error: 'Forbidden' }, { status: 403 });
	}

	const { id } = await request.json();

	if (!id) {
		return json({ success: false, error: 'User ID is required' }, { status: 400 });
	}

	await ensureAccountExists(id);
	await query('INSERT INTO admin_users (id) VALUES (?)', [id]);
	await sendNotification(id, '관리자가 너를 관리자에 추가했어. 이제 관리자 권한을 사용할 수 있어.');

	return json({ success: true });
};
