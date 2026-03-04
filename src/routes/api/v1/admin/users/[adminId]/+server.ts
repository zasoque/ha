import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { sendNotification } from '$lib/server/notification';
import { json, type RequestHandler } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ params, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!(await isAdmin(me.id))) {
		return json({ success: false, error: 'Forbidden' }, { status: 403 });
	}

	const { adminId } = params;

	if (!adminId) {
		return json({ success: false, error: 'User ID is required' }, { status: 400 });
	}

	await query('DELETE FROM admin_users WHERE id = ?', [adminId]);
	await sendNotification(
		adminId,
		'관리자가 너를 관리자에서 삭제했어. 더 이상 관리자 권한을 사용할 수 없어.'
	);

	return json({ success: true });
};

export const PUT: RequestHandler = async ({ params, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!(await isAdmin(me.id))) {
		return json({ success: false, error: 'Forbidden' }, { status: 403 });
	}

	const { adminId } = params;

	if (!adminId) {
		return json({ success: false, error: 'User ID is required' }, { status: 400 });
	}

	await query('INSERT INTO admin_users (id) VALUES (?)', [adminId]);
	await sendNotification(
		adminId,
		'관리자가 너를 관리자에 추가했어. 이제 관리자 권한을 사용할 수 있어.'
	);

	return json({ success: true });
};
