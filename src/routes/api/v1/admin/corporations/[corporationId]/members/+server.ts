import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/admin/corporations/{corporationId}/members:
 *   post:
 *     summary: Add a member to a corporation (Admin only).
 *     tags:
 *       - Admin - Corporations
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
 *         description: User added to corporation successfully.
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
 *                   example: User added to corporation
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
 *                       value: "User ID is required"
 *       401:
 *         description: Unauthorized, no token found, invalid token, or not an administrator.
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
 *                 message:
 *                   type: string
 *                   example: Forbidden
 */
export const POST: RequestHandler = async ({ cookies, request, params }) => {
	const corporationId = params.corporationId;

	if (!corporationId) {
		return json({ success: false, message: 'Corporation ID is required' }, { status: 400 });
	}

	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	if (!(await isAdmin(me.id))) {
		return json({ success: false, message: 'Forbidden' }, { status: 403 });
	}

	const { user_id } = await request.json();

	if (!user_id) {
		return json({ success: false, message: 'User ID is required' }, { status: 400 });
	}

	await query('INSERT INTO corporation_members (corporation_id, user_id) VALUES (?, ?)', [
		corporationId,
		user_id
	]);

	return json({ success: true, message: 'User added to corporation' });
};

/**
 * @swagger
 * /api/v1/admin/corporations/{corporationId}/members:
 *   delete:
 *     summary: Remove a member from a corporation (Admin only).
 *     tags:
 *       - Admin - Corporations
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
 *         description: User removed from corporation successfully.
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
 *                   example: User removed from corporation
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
 *                       value: "User ID is required"
 *       401:
 *         description: Unauthorized, no token found, invalid token, or not an administrator.
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
 *                 message:
 *                   type: string
 *                   example: Forbidden
 */
export const DELETE: RequestHandler = async ({ cookies, request, params }) => {
	const corporationId = params.corporationId;

	if (!corporationId) {
		return json({ success: false, message: 'Corporation ID is required' }, { status: 400 });
	}

	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	if (!(await isAdmin(me.id))) {
		return json({ success: false, message: 'Forbidden' }, { status: 403 });
	}

	const { user_id } = await request.json();

	if (!user_id) {
		return json({ success: false, message: 'User ID is required' }, { status: 400 });
	}

	await query('DELETE FROM corporation_members WHERE corporation_id = ? AND user_id = ?', [
		corporationId,
		user_id
	]);

	return json({ success: true, message: 'User removed from corporation' });
};