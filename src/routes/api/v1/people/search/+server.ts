import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/people/search:
 *   tags:
 *     - People
 *   get:
 *     summary: Search for people by ID or name.
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: The search query (person ID or name).
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
 *         description: A list of matching people.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the search was successful.
 *                 people:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The person ID.
 *                       name:
 *                         type: string
 *                         description: The person's name.
 */
export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q');
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '50');

	if (!q) {
		return json({ success: true, people: [] });
	}

	const people = await query(
		'SELECT id, name FROM people WHERE id = ? OR name LIKE ? LIMIT ? OFFSET ?',
		[q, `%${q}%`, limit, (page - 1) * limit]
	);

	return json({ success: true, people });
};
