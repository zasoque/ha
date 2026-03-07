import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { sendNotification } from '$lib/server/notification';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/accounts/{accountId}:
 *   get:
 *     summary: Retrieve details of a specific account by ID for the authenticated user.
 *     tags:
 *       - Accounts
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         description: The ID of the account to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Details of the specified account.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 account:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The unique identifier of the account.
 *                     user_id:
 *                       type: string
 *                       description: The unique identifier of the user (Discord ID) who owns the account.
 *                     balance:
 *                       type: number
 *                       format: float
 *       401:
 *         description: Unauthorized, no token found or invalid token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   examples:
 *                     noToken:
 *                       value: "No token found"
 *                     invalidToken:
 *                       value: "Invalid token"
 *       404:
 *         description: Account not found or does not belong to the authenticated user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Account not found or does not belong to the user
 */
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

	const account = await query(
		'SELECT a.* FROM accounts a JOIN corporation_members cm ON a.user_id = cm.corporation_id WHERE a.id = ? AND (cm.user_id = ? OR a.user_id = ?)',
		[accountId, me.id, me.id]
	);

	if (account.length === 0) {
		return json(
			{ success: false, message: 'Account not found or does not belong to the user' },
			{ status: 404 }
		);
	}

	return json({ success: true, account: account[0] });
};

/**
 * @swagger
 * /api/v1/accounts/{accountId}:
 *   delete:
 *     summary: Delete a specific account by ID for the authenticated user.
 *     tags:
 *       - Accounts
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         description: The ID of the account to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Account deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Account deleted successfully
 *       401:
 *         description: Unauthorized, no token found or invalid token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   examples:
 *                     noToken:
 *                       value: "No token found"
 *                     invalidToken:
 *                       value: "Invalid token"
 *       404:
 *         description: Account not found or does not belong to the authenticated user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Account not found or does not belong to the user
 */
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
	await sendNotification(me.id, `계좌번호 ${accountId}번의 계좌가 삭제됐어.`);

	return json({ success: true, message: 'Account deleted successfully' });
};
