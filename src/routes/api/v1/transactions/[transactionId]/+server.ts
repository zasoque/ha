import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/transactions/{transactionId}:
 *   get:
 *     summary: Retrieve a specific transaction by ID for the authenticated user.
 *     tags:
 *       - Transactions
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         description: The ID of the transaction (starts from 1) to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Details of the specified transaction.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 transaction:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     account_id:
 *                       type: integer
 *                     amount:
 *                       type: number
 *                       format: float
 *                     type:
 *                       type: string
 *                     description:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
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
 *                   example: Unauthorized
 *       404:
 *         description: Transaction not found or does not belong to the authenticated user.
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
 *                   example: Transaction not found
 */
export const GET: RequestHandler = async ({ cookies, params }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const { transactionId } = params;
	const me = await getMe(token);

	const transaction = await query(
		'SELECT * FROM transactions WHERE id = ? AND account_id = (SELECT account_id FROM accounts WHERE user_id = ?)',
		[transactionId, me.id]
	);

	if (!transaction) {
		return json({ success: false, message: 'Transaction not found' }, { status: 404 });
	}

	return json({ success: true, transaction });
};