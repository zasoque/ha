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

	const { mailId } = params;

	const mail = await query('SELECT * FROM mails WHERE (sender = ? OR recipient = ?) AND id = ?', [
		me.id,
		me.id,
		mailId
	]);

	if (mail.length === 0) {
		return json({ success: false, message: 'Mail not found' }, { status: 404 });
	}

	const { is_read } = await request.json();

	if (typeof is_read !== 'boolean') {
		return json({ success: false, message: 'Invalid is_read value' }, { status: 400 });
	}

	await query('UPDATE mails SET is_read = ? WHERE id = ?', [is_read, mailId]);

	return json({ success: true, message: 'Mail updated successfully' });
};
