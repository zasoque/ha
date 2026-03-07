import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/corporations/{corporationId}/members:
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
 *         description: Bad request, missing corporation ID or user ID.
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
 *                   examples:
 *                     missingCorporationId:
 *                       value: "Corporation ID is required"
 *                     missingUserId:
 *                       value: "Missing user_id"
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
 *       404:
 *         description: User not found.
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
 *                   example: User not found
 */
export const POST: RequestHandler = async ({ params, cookies, request }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const corporationId = params.corporationId;

	if (!corporationId) {
		return json({ success: false, message: 'Corporation ID is required' }, { status: 400 });
	}

	const members = await query('SELECT * FROM corporation_members WHERE corporation_id = ?', [
		corporationId
	]);

	if (!members.some((m: any) => m.user_id === me.id) && !(await isAdmin(me.id))) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const { user_id } = await request.json();

	if (!user_id) {
		return json({ success: false, message: 'Missing user_id' }, { status: 400 });
	}

	const person = await query('SELECT * FROM people WHERE id = ?', [user_id]);
	if (person.length === 0) {
		return json({ success: false, message: 'User not found' }, { status: 404 });
	}

	await query('INSERT INTO corporation_members (corporation_id, user_id) VALUES (?, ?)', [
		corporationId,
		user_id
	]);

	return json({ success: true });
};