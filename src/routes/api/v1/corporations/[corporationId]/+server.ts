import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const corporationId = params.corporationId;

	const members = await query('SELECT * FROM corporation_members WHERE corporation_id = ?', [
		corporationId
	]);

	if (!members.some((m: any) => m.user_id === me.id) && !(await isAdmin(me.id))) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	return json({ success: true, members });
};

export const POST: RequestHandler = async ({ params, cookies, request }) => {
	const token = cookies.get('token');
	if (!token) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);
	if (!me) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const members = await query('SELECT * FROM corporation_members WHERE corporation_id = ?', [
		params.corporationId
	]);
	if (!members.some((m: any) => m.user_id === me.id) && !(await isAdmin(me.id))) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { user_id } = await request.json();
	if (!user_id) {
		return json({ error: 'Missing user_id' }, { status: 400 });
	}

	await query('INSERT INTO corporation_members (corporation_id, user_id) VALUES (?, ?)', [
		params.corporationId,
		user_id
	]);

	return json({ success: true });
};

export const DELETE: RequestHandler = async ({ params, cookies, request }) => {
	const token = cookies.get('token');
	if (!token) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);
	if (!me) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const members = await query('SELECT * FROM corporation_members WHERE corporation_id = ?', [
		params.corporationId
	]);
	if (!members.some((m: any) => m.user_id === me.id) && !(await isAdmin(me.id))) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { user_id } = await request.json();
	if (!user_id) {
		return json({ error: 'Missing user_id' }, { status: 400 });
	}

	await query('DELETE FROM corporation_members WHERE corporation_id = ? AND user_id = ?', [
		params.corporationId,
		user_id
	]);

	return json({ success: true });
};
