import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/mails/me:
 *   get:
 *     summary: Get mails for the authenticated user
 *     tags:
 *       - Mails
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *         description: The number of mails to return per page (default is 50, max is 100)
 *     responses:
 *       200:
 *         description: A list of mails for the authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 mails:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The ID of the mail
 *                       sender:
 *                         type: string
 *                         description: The ID of the sender user
 *                       recipient:
 *                         type: string
 *                         description: The ID of the recipient user
 *                       subject:
 *                         type: string
 *                         description: The subject of the mail
 *                       body:
 *                         type: string
 *                         description: The body of the mail
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: The timestamp when the mail was created
 *       400:
 *         description: Bad request (invalid page or limit)
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
 *                   example: "Invalid page number"
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
 *                 message:
 *                   type: string
 *                   example: "No token provided"
 */
export const GET: RequestHandler = async ({ cookies, url }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'No token provided' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Invalid token' }, { status: 401 });
	}

	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '50');

	if (isNaN(page) || page < 1) {
		return json({ success: false, message: 'Invalid page number' }, { status: 400 });
	}

	if (isNaN(limit) || limit < 1 || limit > 100) {
		return json({ success: false, message: 'Invalid limit number' }, { status: 400 });
	}

	const mails = await query(
		'SELECT * FROM mails WHERE recipient = ? OR sender = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
		[me.id, me.id, limit, (page - 1) * limit]
	);

	return json({ success: true, mails });
};
