import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/maps/buildings/{buildingId}:
 *   get:
 *     summary: Retrieve details of a specific building by ID.
 *     tags:
 *       - Maps - Buildings
 *     parameters:
 *       - in: path
 *         name: buildingId
 *         required: true
 *         description: The ID of the building (starts from 1) to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Details of the specified building.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 building:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     owner_id:
 *                       type: string
 *                       description: The Discord ID of the building owner.
 *                     land_id:
 *                       type: integer
 *                     type:
 *                       type: string
 *                       enum: [residential, office, market, farm]
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Building not found.
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
 *                   example: Building not found
 */
export const GET: RequestHandler = async ({ params }) => {
	const { buildingId } = params;

	const building = await query('SELECT * FROM buildings WHERE id = ?', [buildingId]);

	if (building.length === 0) {
		return json({ success: false, message: 'Building not found' }, { status: 404 });
	}

	return json({ success: true, building: building[0] });
};

/**
 * @swagger
 * /api/v1/maps/buildings/{buildingId}:
 *   put:
 *     summary: Update the name of a specific building (owner only).
 *     tags:
 *       - Maps - Buildings
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: buildingId
 *         required: true
 *         description: The ID of the building (starts from 1) to update.
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
 *                 description: The new name of the building.
 *     responses:
 *       200:
 *         description: Building name updated successfully.
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
 *         description: Unauthorized, no token found, invalid token, or not the owner of the building.
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
 *         description: Building not found.
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
 *                   example: Building not found
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

	const { buildingId } = params;
	const { name } = await request.json();

	if (!name) {
		return json({ success: false, message: 'Missing required fields' }, { status: 400 });
	}

	const building = await query('SELECT * FROM buildings WHERE id = ?', [buildingId]);

	if (building.length === 0) {
		return json({ success: false, message: 'Building not found' }, { status: 404 });
	}

	if (building[0].owner_id !== me.id) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	await query('UPDATE buildings SET name = ? WHERE id = ?', [name, buildingId]);

	return json({ success: true });
};

/**
 * @swagger
 * /api/v1/maps/buildings/{buildingId}:
 *   delete:
 *     summary: Delete a specific building (owner or admin only).
 *     tags:
 *       - Maps - Buildings
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: buildingId
 *         required: true
 *         description: The ID of the building (starts from 1) to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Building deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request, cannot delete building with newer buildings.
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
 *                   example: Cannot delete building with newer buildings
 *       401:
 *         description: Unauthorized, no token found, invalid token, or not the owner/admin of the building.
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
 *         description: Building not found.
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
 *                   example: Building not found
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

	const buildingId = params.buildingId!;

	const building = await query('SELECT * FROM buildings WHERE id = ?', [buildingId]);

	if (building.length === 0) {
		return json({ success: false, message: 'Building not found' }, { status: 404 });
	}

	if (building[0].owner_id !== me.id && !(await isAdmin(me.id))) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const existingBuildings = await query('SELECT * FROM buildings WHERE land_id = ?', [
		building[0].land_id
	]);

	if (buildingId < existingBuildings[existingBuildings.length - 1].id) {
		return json(
			{ success: false, message: 'Cannot delete building with newer buildings' },
			{ status: 400 }
		);
	}

	await query('DELETE FROM buildings WHERE id = ?', [buildingId]);

	return json({ success: true });
};