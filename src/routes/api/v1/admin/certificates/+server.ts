import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { CERTIFICATIONS } from '$lib/util/const';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/admin/certificates:
 *   get:
 *     summary: Get a list of all certificates
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: The number of certificates to retrieve per page (default is 50)
 *     responses:
 *       200:
 *         description: A list of certificates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 certificates:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       user_id:
 *                         type: integer
 *                         example: 123456789012345678
 *                       type:
 *                         type: string
 *                         example: 건축
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-01T00:00:00Z
 */
export const GET: RequestHandler = async ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '50');

	const offset = (page - 1) * limit;

	const certificates = await query(
		'SELECT * FROM certificates ORDER BY created_at DESC LIMIT ? OFFSET ?',
		[limit, offset]
	);

	return json({ success: true, certificates });
};

/**
 * @swagger
 * /api/v1/admin/certificates:
 *   post:
 *     summary: Add a certificate for a user
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: The Discord ID of the user to add the certificate for
 *               certification_type:
 *                 type: string
 *                 description: The type of certificate to add (건축, 토지, 측량)
 *     responses:
 *       200:
 *         description: Certificate added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request (missing parameters or invalid certification type)
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
 *                   example: Missing parameters
 *       401:
 *         description: Unauthorized (no token or invalid token)
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
 *                   example: Forbidden
 */
export const POST: RequestHandler = async ({ cookies, request }) => {
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

	const { user_id, type } = await request.json();

	if (!user_id || !type) {
		return json({ success: false, message: 'Missing parameters' }, { status: 400 });
	}

	if (CERTIFICATIONS.indexOf(type) === -1) {
		return json({ success: false, message: 'Invalid certification type' }, { status: 400 });
	}

	await query('INSERT INTO certificates (user_id, type) VALUES (?, ?)', [user_id, type]);

	return json({ success: true });
};
