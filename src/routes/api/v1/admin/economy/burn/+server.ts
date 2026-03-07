import { getMe } from '$lib/discord/users';
import { getAccount } from '$lib/server/account';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/admin/economy/burn:
 *   post:
 *     summary: Burn (reduce) money from a specified account (Admin only).
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
 *                 description: The amount of money to burn.
 *               account:
 *                 type: integer
 *                 description: The ID of the account (starts from 1) from which to burn money.
 *     responses:
 *       200:
 *         description: Money burned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request, missing parameters or insufficient funds.
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
 *                       value: "Missing parameters"
 *                     insufficientFunds:
 *                       value: "Insufficient funds"
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
 *       404:
 *         description: Account not found.
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
 *                   example: Account not found
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
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

	const { amount, account } = await request.json();

	if (!amount || !account) {
		return json({ success: false, error: 'Missing parameters' }, { status: 400 });
	}

	const accountObject = await getAccount(account);

	if (!accountObject) {
		return json({ success: false, error: 'Account not found' }, { status: 404 });
	}

	if (accountObject.balance < parseFloat(amount)) {
		return json({ success: false, error: 'Insufficient funds' }, { status: 400 });
	}

	await query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, accountObject.id]);
	await query(
		"INSERT INTO transactions (account_id, amount, type, description) VALUES (?, ?, 'withdrawal', '화폐 소각')",
		[accountObject.id, amount]
	);

	return json({ success: true });
};