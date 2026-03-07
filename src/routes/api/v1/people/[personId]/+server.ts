import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/people/{personId}:
 *   get:
 *     summary: Retrieve a specific person by ID.
 *     tags:
 *       - People
 *     parameters:
 *       - in: path
 *         name: personId
 *         required: true
 *         description: The Discord ID of the person to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Details of the specified person.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 person:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The Discord ID of the person.
 *                     name:
 *                       type: string
 *       400:
 *         description: Bad request, person ID is required.
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
 *                   example: User ID is required
 *       404:
 *         description: Person not found.
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
 *                   example: User not found
 */
export const GET: RequestHandler = async ({ params, cookies }) => {
	const token = cookies.get('token');
	const me = token ? await getMe(token) : null;

	const id = params.personId;

	if (!id) {
		return json({ success: false, error: 'User ID is required' }, { status: 400 });
	}

	const person = await query('SELECT id, name, residence FROM people WHERE id = ?', [id]);

	if (person.length === 0) {
		return json({ success: false, error: 'User not found' }, { status: 404 });
	}

	if (!me) {
		person.residence = undefined;
	}

	return json({ success: true, person: person[0] });
};
