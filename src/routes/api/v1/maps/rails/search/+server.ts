import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/maps/rails/search:
 *   get:
 *     summary: Search for rails by name or ID.
 *     tags:
 *       - Maps - Rails
 *     parameters:
 *       - in: query
 *         name: q
 *         required: false
 *         description: The search query to match against rail names or IDs.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of matching rails.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 rails:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       owner_id:
 *                         type: string
 *                         description: The Discord ID of the rail owner.
 *                       land_a_id:
 *                         type: integer
 *                       land_b_id:
 *                         type: integer
 *                       created_at:
 *                         type: string
 *                         format: date-time
 */
export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q') || '';

	const rails = await query('SELECT * FROM rails WHERE name LIKE ? OR id LIKE ?', [
		`%${q}%`,
		`%${q}%`
	]);

	return json({ success: true, rails });
};
