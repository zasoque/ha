import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/admin/corporations:
 *   get:
 *     summary: Retrieve a paginated list of all corporation members (Admin only).
 *     tags:
 *       - Admin - Corporations
 *     security:
 *       - cookieAuth: []
 *     parameters:
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
 *         description: The number of items per page.
 *     responses:
 *       200:
 *         description: A paginated list of corporation members.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 corporationmembers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       corporation_id:
 *                         type: integer
 *                       user_id:
 *                         type: string
 *                         description: The Discord ID of the member.
 */
export const GET: RequestHandler = async ({ url }) => {
	const page = url.searchParams.get('page') || '1';
	const limit = url.searchParams.get('limit') || '50';

	const corporationmembers = await query('SELECT * FROM corporation_members LIMIT ? OFFSET ?', [
		parseInt(limit),
		(parseInt(page) - 1) * parseInt(limit)
	]);

	return json({ success: true, corporationmembers });
};