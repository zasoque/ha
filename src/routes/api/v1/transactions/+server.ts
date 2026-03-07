import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/transactions:
 *   get:
 *     summary: Retrieve a list of all transactions for the authenticated user.
 *     tags:
 *       - Transactions
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of transactions for the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       account_id:
 *                         type: integer
 *                       amount:
 *                         type: number
 *                         format: float
 *                       type:
 *                         type: string
 *                       description:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
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
 */
export const GET: RequestHandler = async ({ cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'No token found' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Invalid token' }, { status: 401 });
	}

	const transactions = await query('SELECT * FROM transactions WHERE user_id = ?', [me.id]);

	return json({ success: true, transactions });
};