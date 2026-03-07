import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { sendNotification } from '$lib/server/notification';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/admin/economy/print:
 *   post:
 *     summary: Print (add) money to a specified account (Admin only).
 *     tags:
 *       - Admin - Economy
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - account
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: The amount of money to add. Must be a positive number.
 *               account:
 *                 type: integer
 *                 description: The ID of the account (starts from 1) to add money to.
 *     responses:
 *       200:
 *         description: Money added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request, missing parameters or invalid amount.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   examples:
 *                     missingParams:
 *                       value: "Amount and account are required"
 *                     invalidAmount:
 *                       value: "Amount must be a positive number"
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
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden, user is not an administrator.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Forbidden
 */
export const POST: RequestHandler = async ({ cookies, request }) => {
	const { amount, account } = await request.json();

	if (!amount || !account) {
		return json({ success: false, error: 'Amount and account are required' }, { status: 400 });
	}

	if (isNaN(Number(amount)) || Number(amount) <= 0) {
		return json({ success: false, error: 'Amount must be a positive number' }, { status: 400 });
	}

	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	if (!(await isAdmin(me.id))) {
		return json({ success: false, error: 'Forbidden' }, { status: 403 });
	}

	await query(
		"INSERT INTO transactions (account_id, amount, type, description) VALUES(?, ?, 'deposit', '발행')",
		[account, amount]
	);
	await query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, account]);

	const accountObj = await query('SELECT * FROM accounts WHERE id = ?', [account]);
	const userId = accountObj[0].user_id;
	const message = `관리자가 ${accountObj[0].id}번 계좌에 ${amount}원을 입금했어. 현재 잔액은 ${accountObj[0].balance}원이야.`;
	await sendNotification(userId, message);

	return json({ success: true });
};