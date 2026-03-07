import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/maps/lands/{landId}:
 *   get:
 *     summary: Retrieve details of a specific land by ID.
 *     tags:
 *       - Maps - Lands
 *     parameters:
 *       - in: path
 *         name: landId
 *         required: true
 *         description: The ID of the land (starts from 1) to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Details of the specified land.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 land:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     owner_id:
 *                       type: string
 *                       description: The Discord ID of the land owner.
 *                     position:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                           example: Point
 *                         coordinates:
 *                           type: array
 *                           items:
 *                             type: number
 *                           minItems: 2
 *                           maxItems: 2
 *                     color:
 *                       type: string
 *       404:
 *         description: Land not found.
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
 *                   example: Land not found
 */
export const GET: RequestHandler = async ({ params }) => {
	const landId = params.landId;

	const land = await query('SELECT * FROM lands WHERE id = ?', [landId]);

	land.fertility = undefined;
	land.solidity = undefined;

	if (land.length === 0) {
		return json({ success: false, message: 'Land not found' }, { status: 404 });
	}

	return json({ success: true, land: land[0] });
};

/**
 * @swagger
 * /api/v1/maps/lands/{landId}:
 *   put:
 *     summary: Update details of a specific land (owner only).
 *     tags:
 *       - Maps - Lands
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: landId
 *         required: true
 *         description: The ID of the land (starts from 1) to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - color
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name of the land.
 *               color:
 *                 type: string
 *                 description: The new color of the land (e.g., '#RRGGBB').
 *     responses:
 *       200:
 *         description: Land updated successfully.
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
 *                   example: Land updated successfully
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
 *                 message:
 *                   type: string
 *                   example: Missing required fields
 *       401:
 *         description: Unauthorized, no token found, invalid token, or not the owner of the land.
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
 *         description: Land not found.
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
 *                   example: Land not found
 */
export const PUT: RequestHandler = async ({ request, cookies, params }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const owner_id = me.id;
	const landId = params.landId;
	const { name, color } = await request.json();

	if (!name || !color) {
		return json({ success: false, message: 'Missing required fields' }, { status: 400 });
	}

	const land = await query('SELECT * FROM lands WHERE id = ?', [landId]);

	if (land.length === 0) {
		return json({ success: false, message: 'Land not found' }, { status: 404 });
	}

	if (land[0].owner_id !== owner_id) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	await query('UPDATE lands SET name = ?, color = ? WHERE id = ?', [name, color, landId]);

	return json({ success: true, message: 'Land updated successfully' });
};

/**
 * @swagger
 * /api/v1/maps/lands/{landId}:
 *   delete:
 *     summary: Delete a specific land (admin only).
 *     tags:
 *       - Maps - Lands
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: landId
 *         required: true
 *         description: The ID of the land (starts from 1) to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Land deleted successfully.
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
 *                   example: Land deleted successfully
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
export const DELETE: RequestHandler = async ({ cookies, params }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	if (!(await isAdmin(me.id))) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const landId = params.landId;

	await query('DELETE FROM lands WHERE id = ?', [landId]);

	return json({ success: true, message: 'Land deleted successfully' });
};