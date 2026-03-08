import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/accounts/search:
 *   tags:
 *     - Accounts
 *   get:
 *     summary: Search for accounts by ID or name.
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: The search query (account ID or name).
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: The number of results per page.
 *     responses:
 *       200:
 *         description: A list of matching accounts.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the search was successful.
 *                 accounts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The account ID.
 *                       user_id:
 *                         type: string
 *                         description: The user ID associated with the account.
 */
export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q');
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '50');

	if (!q) {
		return json({ success: true, accounts: [] });
	}

	const accounts = await query(
		'SELECT a.id, a.user_id FROM accounts a JOIN people p ON a.user_id = p.id WHERE a.id = ? OR p.name LIKE ? LIMIT ? OFFSET ?',
		[q, `%${q}%`, limit, (page - 1) * limit]
	);

	return json({ success: true, accounts });
};
