import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/maps/buildings:
 *   get:
 *     summary: Retrieve a list of all buildings.
 *     tags:
 *       - Maps - Buildings
 *     responses:
 *       200:
 *         description: A list of all buildings.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 buildings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       owner_id:
 *                         type: string
 *                         description: The Discord ID of the building owner.
 *                       land_id:
 *                         type: integer
 *                       type:
 *                         type: string
 *                         enum: [residential, office, market, farm]
 *                       created_at:
 *                         type: string
 *                         format: date-time
 */
export const GET: RequestHandler = async () => {
	const buildings = await query('SELECT * FROM buildings');
	return json({ success: true, buildings });
};