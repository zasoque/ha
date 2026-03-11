import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/admin/laws/{lawId}:
 *   get:
 *     summary: Get a law by ID
 *     parameters:
 *       - in: path
 *         name: lawId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the law to retrieve
 *     responses:
 *       200:
 *         description: Law retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 law:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Law Name"
 *                     level:
 *                       type: integer
 *                       example: 1
 *                     contents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           law_id:
 *                             type: integer
 *                             example: 1
 *                           contents:
 *                             type: string
 *                             example: "Law content"
 *       404:
 *         description: Law not found
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
 *                   example: "Law not found"
 *
 */
export const GET: RequestHandler = async ({ params }) => {
	const { lawId } = params;

	const [law] = await query('SELECT * FROM laws WHERE id = ?', [lawId]);

	if (!law) {
		return json({ success: false, message: 'Law not found' }, { status: 404 });
	}

	const contents = await query('SELECT * FROM law_contents WHERE law_id = ?', [lawId]);

	law.contents = contents;

	return json({ success: true, law });
};

/**
 * @swagger
 * /api/v1/admin/laws/{lawId}:
 *   post:
 *     summary: Add content to a law
 *     parameters:
 *       - in: path
 *         name: lawId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the law to add content to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "New law content"
 *     responses:
 *       200:
 *         description: Content added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Content added"
 *       400:
 *         description: Bad request (e.g. missing content)
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
 *                   example: "Contents are required"
 *       401:
 *         description: Unauthorized (e.g. missing or invalid token)
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
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden (e.g. user is not an admin)
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
 *                   example: "Forbidden"
 *       404:
 *         description: Law not found
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
 *                   example: "Law not found"
 *
 */
export const POST: RequestHandler = async ({ params, cookies, request }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const user = await getMe(token);

	if (!user) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	if (!isAdmin(user.id)) {
		return json({ success: false, message: 'Forbidden' }, { status: 403 });
	}

	const { lawId } = params;

	const { content } = await request.json();

	if (!content) {
		return json({ success: false, message: 'Contents are required' }, { status: 400 });
	}

	const result = await query('INSERT INTO law_contents (law_id, content) VALUES (?, ?)', [
		lawId,
		content
	]);

	if (result.affectedRows === 0) {
		return json({ success: false, message: 'Law not found' }, { status: 404 });
	}

	return json({ success: true, message: 'Content added' });
};
