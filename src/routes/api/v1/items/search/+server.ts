import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * api/v1/items/search:
 *   get:
 *     summary: Search for items by name
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: The search query for item names
 *     responses:
 *       200:
 *         description: A list of items matching the search query
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 */
export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q') || '';

	const items = await query('SELECT * FROM items WHERE name LIKE ? OR id = ?', [`%${q}%`, q]);

	return json({ success: true, items });
};
