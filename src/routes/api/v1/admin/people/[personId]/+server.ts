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

	const id = params.personId;

	if (!id) {
		return json({ success: false, error: 'User ID is required' }, { status: 400 });
	}

	await query('DELETE FROM people WHERE id = ?', [id]);
	await sendNotification(id, `관리자가 너를 등록부에서 삭제했어. 더 이상 서비스를 이용할 수 없어.`);

	return json({ success: true });
};

export const PUT: RequestHandler = async ({ request, params, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!(await isAdmin(me.id))) {
		return json({ success: false, error: 'Forbidden' }, { status: 403 });
	}

	const { residence, name } = await request.json();

	if (!residence || !name) {
		return json({ success: false, error: 'Residence and name are required' }, { status: 400 });
	}

	const id = params.personId!;

	await query('UPDATE people SET residence = ?, name = ? WHERE id = ?', [residence, name, id]);
	await sendNotification(
		id,
		`관리자가 너를 ${residence}에 거주하는 ${name}으로 수정했어. 변경된 정보로 서비스를 이용할 수 있어.`
	);

	return json({ success: true });
};
