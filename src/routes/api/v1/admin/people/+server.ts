import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { ensureAccountExists } from '$lib/server/auth';
import { query } from '$lib/server/db';
import { sendNotification } from '$lib/server/notification';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/admin/people:
 *   get:
 *     summary: Retrieve a paginated list of all people (Admin only).
 *     tags:
 *       - Admin - People
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
 *           default: 10
 *         description: The number of items per page.
 *     responses:
 *       200:
 *         description: A paginated list of people.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 people:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The Discord ID of the person.
 *                       name:
 *                         type: string
 *                       residence:
 *                         type: integer
 *                         nullable: true
 *                         description: The ID of the residential building (starts from 1) where the person resides.
 *                       type:
 *                         type: string
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Bad request, page and limit must be positive integers.
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
 *                   example: Page and limit must be positive integers
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
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden, user is not an administrator.
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
 *                   example: Forbidden
 */
export const GET: RequestHandler = async ({ cookies, url }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!(await isAdmin(me.id))) {
		return json({ success: false, error: 'Forbidden' }, { status: 403 });
	}

	const page = url.searchParams.get('page') || '1';
	const limit = url.searchParams.get('limit') || '10';

	if (isNaN(Number(page)) || isNaN(Number(limit)) || Number(page) < 1 || Number(limit) < 1) {
		return json(
			{ success: false, error: 'Page and limit must be positive integers' },
			{ status: 400 }
		);
	}

	const result = await query('SELECT * FROM people ORDER BY updated_at DESC LIMIT ? OFFSET ?', [
		Number(limit),
		Number(page) > 1 ? (Number(page) - 1) * Number(limit) : 0
	]);

	return json({ success: true, people: result });
};

function randomDigits(length: number): string {
	let result = '';
	for (let i = 0; i < length; i++) {
		result += Math.floor(Math.random() * 10).toString();
	}
	return result;
}

/**
 * @swagger
 * /api/v1/admin/people:
 *   post:
 *     summary: Create a new person (Admin only).
 *     tags:
 *       - Admin - People
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the new person.
 *               id:
 *                 type: string
 *                 description: Optional. The Discord ID of the new person. If not provided, a random ID will be generated.
 *               residence:
 *                 type: integer
 *                 nullable: true
 *                 description: Optional. The ID of the residential building (starts from 1) for the new person.
 *               type:
 *                 type: string
 *                 description: The type of the new person (e.g., 'user', 'corporation').
 *     responses:
 *       200:
 *         description: Person created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request, name and type are required.
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
 *                   example: Name and type are required
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
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden, user is not an administrator.
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
 *                   example: Forbidden
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!(await isAdmin(me.id))) {
		return json({ success: false, error: 'Forbidden' }, { status: 403 });
	}

	let { name, id, residence, type } = await request.json();

	if (!name || !type) {
		return json({ success: false, error: 'Name and type are required' }, { status: 400 });
	}

	if (!id) {
		id = randomDigits(17);
	}

	if (!residence) {
		residence = null;
	}

	await ensureAccountExists(id);
	await query('INSERT INTO people (name, id, residence, type) VALUES (?, ?, ?, ?)', [
		name,
		id,
		residence,
		type
	]);
	await sendNotification(id, `관리자가 너를 ${residence}에 거주하는 ${name}으로 등록했어.`);

	return json({ success: true });
};