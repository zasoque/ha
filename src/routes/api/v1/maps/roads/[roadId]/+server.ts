import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/maps/roads/{roadId}:
 *   get:
 *     summary: Retrieve details of a specific road by ID.
 *     tags:
 *       - Maps - Roads
 *     parameters:
 *       - in: path
 *         name: roadId
 *         required: true
 *         description: The ID of the road (starts from 1) to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Details of the specified road.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 road:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     owner_id:
 *                       type: string
 *                       description: The Discord ID of the road owner.
 *                     land_a_id:
 *                       type: integer
 *                     land_b_id:
 *                       type: integer
 *                     line:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                           example: LineString
 *                         coordinates:
 *                           type: array
 *                           items:
 *                             type: array
 *                             items:
 *                               type: number
 *                             minItems: 2
 *                             maxItems: 2
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Road not found.
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
 *                   example: Road not found
 */
export const GET: RequestHandler = async ({ params }) => {
	const { roadId } = params;

	const road = await query('SELECT * FROM roads WHERE id = ?', [roadId]);

	if (road.length === 0) {
		return json({ success: false, message: 'Road not found' }, { status: 404 });
	}

	return json({ success: true, road: road[0] });
};

/**
 * @swagger
 * /api/v1/maps/roads/{roadId}:
 *   put:
 *     summary: Update the name of a specific road (owner or admin only).
 *     tags:
 *       - Maps - Roads
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: roadId
 *         required: true
 *         description: The ID of the road (starts from 1) to update.
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name of the road.
 *     responses:
 *       200:
 *         description: Road name updated successfully.
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
 *                 message:
 *                   type: string
 *                   example: Missing required fields
 *       401:
 *         description: Unauthorized, no token found, invalid token, or not the owner/admin of the road.
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
 *         description: Road not found.
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
 *                   example: Road not found
 */
export const PUT: RequestHandler = async ({ params, request, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const { roadId } = params;
	const { name } = await request.json();

	if (!name) {
		return json({ success: false, message: 'Missing required fields' }, { status: 400 });
	}

	const road = await query('SELECT * FROM roads WHERE id = ?', [roadId]);

	if (road.length === 0) {
		return json({ success: false, message: 'Road not found' }, { status: 404 });
	}

	if (road[0].owner_id !== me.id && !(await isAdmin(me.id))) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	await query('UPDATE roads SET name = ? WHERE id = ?', [name, roadId]);

	return json({ success: true });
};

/**
 * @swagger
 * /api/v1/maps/roads/{roadId}:
 *   delete:
 *     summary: Delete a specific road (owner or admin only).
 *     tags:
 *       - Maps - Roads
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: roadId
 *         required: true
 *         description: The ID of the road (starts from 1) to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Road deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized, no token found, invalid token, or not the owner/admin of the road.
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
 *         description: Road not found.
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
 *                   example: Road not found
 */
export const DELETE: RequestHandler = async ({ params, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const { roadId } = params;

	const road = await query('SELECT * FROM roads WHERE id = ?', [roadId]);

	if (road.length === 0) {
		return json({ success: false, message: 'Road not found' }, { status: 404 });
	}

	if (road[0].owner_id !== me.id && !(await isAdmin(me.id))) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	await query('DELETE FROM roads WHERE id = ?', [roadId]);

	return json({ success: true });
};