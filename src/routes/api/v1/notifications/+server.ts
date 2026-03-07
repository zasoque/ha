import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Retrieve a list of notifications for the authenticated user.
 *     tags:
 *       - Notifications
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of notifications for the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       user_id:
 *                         type: string
 *                       message:
 *                         type: string
 *                       is_read:
 *                         type: boolean
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized, no token provided or invalid token.
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
 *                   examples:
 *                     noToken:
 *                       value: "No token provided"
 *                     invalidToken:
 *                       value: "Invalid token"
 */
export const GET: RequestHandler = async ({ cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, error: 'No token provided' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, error: 'Invalid token' }, { status: 401 });
	}

	const notifications = await query(
		'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
		[me.id]
	);

	return json({ success: true, notifications });
};