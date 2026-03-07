import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { ensureAccountExists } from '$lib/server/auth';
import { query } from '$lib/server/db';
import { sendNotification } from '$lib/server/notification';
import { json, type RequestHandler } from '@sveltejs/kit';

function getDateExpiry(type: string, dateIssued: string): string {
	const issuedDate = new Date(dateIssued);
	let expiryDate: Date;

	switch (type) {
		case '단기':
			expiryDate = new Date(issuedDate);
			expiryDate.setMonth(expiryDate.getMonth() + 6);
			break;
		default:
			expiryDate = new Date(issuedDate);
			expiryDate.setMonth(expiryDate.getMonth() + 1);
			expiryDate.setDate(expiryDate.getDate() - 1);
			break;
	}

	return expiryDate.toISOString().split('T')[0];
}

/**
 * @swagger
 * /api/v1/admin/visas:
 *   get:
 *     summary: Retrieve a paginated list of all visas (Admin only).
 *     tags:
 *       - Admin - Visas
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
 *         description: A paginated list of visas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 visas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       user_id:
 *                         type: string
 *                         description: The Discord ID of the user associated with the visa.
 *                       type:
 *                         type: string
 *                       date_issued:
 *                         type: string
 *                         format: date
 *                       date_expiry:
 *                         type: string
 *                         format: date
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
	const offset = (Number(page) - 1) * Number(limit);
	const result = await query('SELECT * FROM visas ORDER BY date_issued DESC LIMIT ? OFFSET ?', [
		Number(limit),
		offset
	]);

	return json({ success: true, visas: result });
};

/**
 * @swagger
 * /api/v1/admin/visas:
 *   post:
 *     summary: Issue a new visa (Admin only).
 *     tags:
 *       - Admin - Visas
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - type
 *               - date_issued
 *               - date_expiry
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: The Discord ID of the user to issue the visa to.
 *               type:
 *                 type: string
 *                 description: The type of visa (e.g., 'temporary', 'permanent').
 *               date_issued:
 *                 type: string
 *                 format: date
 *                 description: The date the visa was issued.
 *               date_expiry:
 *                 type: string
 *                 format: date
 *                 description: The date the visa expires.
 *     responses:
 *       200:
 *         description: Visa issued successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request, missing required fields.
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
 *                   example: User ID, type, and date issued are required
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

	const { user_id, type, date_issued } = await request.json();

	if (!user_id || !type || !date_issued) {
		return json(
			{ success: false, error: 'User ID, type, and date issued are required' },
			{ status: 400 }
		);
	}

	let date_expiry = getDateExpiry(type, date_issued);

	await ensureAccountExists(user_id);
	await query('INSERT INTO visas (user_id, type, date_issued, date_expiry) VALUES (?, ?, ?, ?)', [
		user_id,
		type,
		date_issued,
		date_expiry
	]);
	await sendNotification(
		user_id,
		`관리자가 너에게 ${type} 비자를 발급했어. 발급 날짜는 ${date_issued}야.`
	);

	return json({ success: true });
};
