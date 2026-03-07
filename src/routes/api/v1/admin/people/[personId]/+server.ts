import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { sendNotification } from '$lib/server/notification';
import { TYPE_RESIDENTIAL } from '$lib/util/const';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, cookies }) => {
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

	const people = await query('SELECT * FROM people WHERE id = ?', [id]);

	if (people.length === 0) {
		return json({ success: false, error: 'User not found' }, { status: 404 });
	}

	return json({ success: true, person: people[0] });
};

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

	const building = await query('SELECT * FROM buildings WHERE id = ?', [residence]);

	if (building.length === 0) {
		return json({ success: false, error: 'Invalid residence' }, { status: 400 });
	}

	if (building[0].type !== TYPE_RESIDENTIAL) {
		return json(
			{ success: false, error: 'Residence must be a residential building' },
			{ status: 400 }
		);
	}

	const id = params.personId!;

	await query('UPDATE people SET residence = ?, name = ? WHERE id = ?', [residence, name, id]);
	await sendNotification(
		id,
		`관리자가 너를 ${residence}에 거주하는 ${name}으로 수정했어. 변경된 정보로 서비스를 이용할 수 있어.`
	);

	return json({ success: true });
};
