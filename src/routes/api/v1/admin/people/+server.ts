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

	if (isNaN(Number(page)) || isNaN(Number(limit)) || Number(page) < 1 || Number(limit) < 1) {
		return json(
			{ success: false, error: 'Page and limit must be positive integers' },
			{ status: 400 }
		);
	}

	const result = await query('SELECT * FROM people ORDER BY updated_at DESC LIMIT ? OFFSET ?', [
		Number(limit),
		Number(page) > 1 ? (Number(page) - 1) * Number(limit) : 0
	]);

	return json({ success: true, people: result });
};

function randomDigits(length: number): string {
	let result = '';
	for (let i = 0; i < length; i++) {
		result += Math.floor(Math.random() * 10).toString();
	}
	return result;
}

export const POST: RequestHandler = async ({ request, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!(await isAdmin(me.id))) {
		return json({ success: false, error: 'Forbidden' }, { status: 403 });
	}

	let { name, id, residence, type } = await request.json();

	if (!name || !type) {
		return json({ success: false, error: 'Name and type are required' }, { status: 400 });
	}

	if (!id) {
		id = randomDigits(17);
	}

	if (!residence) {
		residence = null;
	}

	await ensureAccountExists(id);
	await query('INSERT INTO people (name, id, residence, type) VALUES (?, ?, ?, ?)', [
		name,
		id,
		residence,
		type
	]);
	await sendNotification(id, `관리자가 너를 ${residence}에 거주하는 ${name}으로 등록했어.`);

	return json({ success: true });
};
