import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/admin/laws/{lawName}:
 *   get:
 *     summary: Get a law by name
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: lawName
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the law to retrieve
 *     responses:
 *       200:
 *         description: Success
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
 *                       example: "Law of Gravity"
 *                     contents:
 *                       type: string
 *                       example: "Objects with mass attract each other."
 */
export const GET: RequestHandler = async ({ params }) => {
	const { lawName } = params;

	const [law] = await query('SELECT * FROM laws WHERE name = ?', [lawName]);

	if (!law) {
		return json({ success: false, message: 'Law not found' }, { status: 404 });
	}

	return json({ success: true, law });
};

/**
 * @swagger
 * /api/v1/admin/laws/{lawName}:
 *   put:
 *     summary: Update a law by name
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: lawName
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the law to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contents:
 *                 type: string
 *                 example: "Objects with mass attract each other."
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
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
 *       401:
 *         description: Unauthorized (missing or invalid token)
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
 *         description: Forbidden (user is not an admin)
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
 */
export const PUT: RequestHandler = async ({ params, cookies, request }) => {
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

	const { lawName } = params;

	const { contents, level } = await request.json();

	if (!contents || !level) {
		return json({ success: false, message: 'Contents and level are required' }, { status: 400 });
	}

	const result = await query('UPDATE laws SET contents = ?, level = ? WHERE name = ?', [
		contents,
		level,
		lawName
	]);

	if (result.affectedRows === 0) {
		return json({ success: false, message: 'Law not found' }, { status: 404 });
	}

	return json({ success: true, message: 'Law updated' });
};
