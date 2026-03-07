import { getFee } from '$lib/server/maps';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/maps/path/{path}:
 *   get:
 *     summary: Calculate the fee for a given path.
 *     tags:
 *       - Maps
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         description: The path, represented as land IDs (starts from 1) separated by underscores (e.g., '1_2_3').
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns the calculated fee for the path.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 fee:
 *                   type: number
 *                   format: float
 *                   description: The calculated fee for the path.
 *       400:
 *         description: Bad request, invalid path format.
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
 *                   example: Invalid path format
 *       404:
 *         description: Land in path not found.
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
 *                   example: Land not found in path: [land_id]
 */
export const GET: RequestHandler = async ({ params }) => {
	const pathStr = params.path || '';
	const fee = await getFee(pathStr);

	if (fee instanceof Response) {
		return fee;
	}

	return json({ success: true, fee });
};