import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/notifications/{notificationId}/read:
 *   post:
 *     summary: Mark a specific notification as read.
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         description: The ID of the notification (starts from 1) to mark as read.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification successfully marked as read.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 */
export const POST: RequestHandler = async ({ params }) => {
	const id = params.notificationId;

	await query('UPDATE notifications SET is_read = true WHERE id = ?', [id]);

	return json({ success: true });
};