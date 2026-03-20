import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/mails:
 *   post:
 *     summary: Send a mail to another user
 *     tags:
 *       - Mails
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipient:
 *                 type: string
 *                 description: The ID of the recipient user
 *               subject:
 *                 type: string
 *                 description: The subject of the mail
 *               body:
 *                 type: string
 *                 description: The body of the mail
 *     responses:
 *       200:
 *         description: Mail sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request (missing fields)
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
 *                   example: "Missing required fields"
 *       401:
 *         description: Unauthorized (invalid or missing token)
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
 *                   example: "Unauthorized"
 */
export const POST: RequestHandler = async ({ cookies, request }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const { body, subject, recipient } = await request.json();

	if (!body || !recipient || !subject) {
		return json({ success: false, error: 'Missing required fields' }, { status: 400 });
	}

	await query('INSERT INTO mails (sender, recipient, subject, body) VALUES (?, ?, ?, ?)', [
		me.id,
		recipient,
		subject,
		body
	]);

	return json({ success: true });
};
