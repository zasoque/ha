import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies, params }) => {
	const token = cookies.get('token');
	const accountId = params.accountId;

	if (!token) {
		return new Response(JSON.stringify({ success: false, message: 'No token found' }), {
			status: 401
		});
	}

	const me = await getMe(token);

	if (!me) {
		return new Response(JSON.stringify({ success: false, message: 'Invalid token' }), {
			status: 401
		});
	}

	const account = await query('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [
		accountId,
		me.id
	]);

	if (account.length === 0) {
		return json(
			{ success: false, message: 'Account not found or does not belong to the user' },
			{ status: 404 }
		);
	}

	return json({ success: true, account: account[0] });
};

export const DELETE: RequestHandler = async ({ cookies, params }) => {
	const token = cookies.get('token');
	const accountId = params.accountId;

	if (!token) {
		return new Response(JSON.stringify({ success: false, message: 'No token found' }), {
			status: 401
		});
	}

	const me = await getMe(token);

	if (!me) {
		return new Response(JSON.stringify({ success: false, message: 'Invalid token' }), {
			status: 401
		});
	}

	const account = await query('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [
		accountId,
		me.id
	]);

	if (account.length === 0) {
		return json(
			{ success: false, message: 'Account not found or does not belong to the user' },
			{ status: 404 }
		);
	}

	await query('DELETE FROM accounts WHERE id = ?', [accountId]);

	return json({ success: true, message: 'Account deleted successfully' });
};
