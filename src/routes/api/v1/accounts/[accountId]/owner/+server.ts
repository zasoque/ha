import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/accounts/{accountId}/owner:
 *   get:
 *     summary: Get the owner of an account
 *     tags:
 *       - Accounts
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the account
 *     responses:
 *       200:
 *         description: The owner of the account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 owner:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       404:
 *         description: Account not found
 */
export const GET: RequestHandler = async ({ params }) => {
	const { accountId } = params;

	const [owner] = await query(
		'SELECT p.* FROM people p JOIN accounts a ON p.id = a.user_id WHERE a.id = ?',
		[accountId]
	);

	if (!owner) {
		return json({ success: false, error: 'Account not found' }, { status: 404 });
	}

	return json({ success: true, owner });
};
