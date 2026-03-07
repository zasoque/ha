import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/corporations/{corporationId}:
 *   get:
 *     summary: Retrieve a list of members for a specific corporation.
 *     tags:
 *       - Corporations
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: corporationId
 *         required: true
 *         description: The ID of the corporation (starts from 1) to retrieve members from.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of corporation members.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       corporation_id:
 *                         type: integer
 *                       user_id:
 *                         type: string
 *                         description: The Discord ID of the member.
 *       401:
 *         description: Unauthorized, no token found, invalid token, or not a member/admin of the corporation.
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
 *                   example: Unauthorized
 */
export const GET: RequestHandler = async ({ params, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const corporationId = params.corporationId;

	const members = await query('SELECT * FROM corporation_members WHERE corporation_id = ?', [
		corporationId
	]);

	if (!members.some((m: any) => m.user_id === me.id) && !(await isAdmin(me.id))) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	return json({ success: true, members });
};

/**
 * @swagger
 * /api/v1/corporations/{corporationId}:
 *   post:
 *     summary: Add a member to a corporation.
 *     tags:
 *       - Corporations
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: corporationId
 *         required: true
 *         description: The ID of the corporation (starts from 1) to add a member to.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: The Discord ID of the user to add as a member.
 *     responses:
 *       200:
 *         description: Member added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request, missing user ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing user_id
 *       401:
 *         description: Unauthorized, no token found, invalid token, or not a member/admin of the corporation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 */
export const POST: RequestHandler = async ({ params, cookies, request }) => {
	const token = cookies.get('token');
	if (!token) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);
	if (!me) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const members = await query('SELECT * FROM corporation_members WHERE corporation_id = ?', [
		params.corporationId
	]);
	if (!members.some((m: any) => m.user_id === me.id) && !(await isAdmin(me.id))) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { user_id } = await request.json();
	if (!user_id) {
		return json({ error: 'Missing user_id' }, { status: 400 });
	}

	await query('INSERT INTO corporation_members (corporation_id, user_id) VALUES (?, ?)', [
		params.corporationId,
		user_id
	]);

	return json({ success: true });
};

/**
 * @swagger
 * /api/v1/corporations/{corporationId}:
 *   delete:
 *     summary: Remove a member from a corporation.
 *     tags:
 *       - Corporations
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: corporationId
 *         required: true
 *         description: The ID of the corporation (starts from 1) to remove a member from.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: The Discord ID of the user to remove from the corporation.
 *     responses:
 *       200:
 *         description: Member removed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request, missing user ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing user_id
 *       401:
 *         description: Unauthorized, no token found, invalid token, or not a member/admin of the corporation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 */
export const DELETE: RequestHandler = async ({ params, cookies, request }) => {
	const token = cookies.get('token');
	if (!token) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);
	if (!me) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const members = await query('SELECT * FROM corporation_members WHERE corporation_id = ?', [
		params.corporationId
	]);
	if (!members.some((m: any) => m.user_id === me.id) && !(await isAdmin(me.id))) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { user_id } = await request.json();
	if (!user_id) {
		return json({ error: 'Missing user_id' }, { status: 400 });
	}

	await query('DELETE FROM corporation_members WHERE corporation_id = ? AND user_id = ?', [
		params.corporationId,
		user_id
	]);

	return json({ success: true });
};