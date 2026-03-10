import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ cookies, params }) => {
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

	const { certificateId } = params;

	if (!certificateId) {
		return json({ success: false, message: 'Missing parameters' }, { status: 400 });
	}

	const certificate = await query('DELETE FROM certificates WHERE id = ?', [certificateId]);

	if (!certificate.affectedRows) {
		return json({ success: false, message: 'Certificate not found' }, { status: 404 });
	}

	return json({ success: true, message: 'Certificate deleted successfully' });
};
