import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { ensureAccountExists } from '$lib/server/auth';
import { query } from '$lib/server/db';
import { sendNotification } from '$lib/server/notification';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!(await isAdmin(me.id))) {
		return json({ success: false, error: 'Forbidden' }, { status: 403 });
	}

	const page = url.searchParams.get('page') || '1';
	const limit = url.searchParams.get('limit') || '10';
	const offset = (Number(page) - 1) * Number(limit);
	const result = await query('SELECT * FROM visas ORDER BY date_issued DESC LIMIT ? OFFSET ?', [
		Number(limit),
		offset
	]);

	return json({ success: true, visas: result });
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

	const { user_id, type, date_issued, date_expiry } = await request.json();

	if (!user_id || !type || !date_issued || !date_expiry) {
		return json(
			{ success: false, error: 'User ID, type, and date issued are required' },
			{ status: 400 }
		);
	}

	await ensureAccountExists(user_id);
	await query('INSERT INTO visas (user_id, type, date_issued, date_expiry) VALUES (?, ?, ?, ?)', [
		user_id,
		type,
		date_issued,
		date_expiry
	]);
	await sendNotification(
		user_id,
		`관리자가 너에게 ${type} 비자를 발급했어. 발급 날짜는 ${date_issued}야.`
	);

	return json({ success: true });
};
