import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/maps/rails/{railId}/owner:
 *   put:
 *     summary: Change the owner of a specific rail.
 *     tags:
 *       - Maps - Rails
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: railId
 *         required: true
 *         description: The ID of the rail to change ownership of.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               owner_id:
 *                 type: string
 *                 description: The Discord ID of the new owner.
 *     responses:
 *       200:
 *         description: Ownership changed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Missing required fields.
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
 *       401:
 *         description: Unauthorized (not logged in or insufficient permissions).
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
 *       404:
 *         description: Rail not found.
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
 */
export const PUT: RequestHandler = async ({ params, cookies, request }) => {
	const token = cookies.get('token');
	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);
	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const { railId } = params;
	const { owner_id } = await request.json();

	if (!owner_id) {
		return json({ success: false, message: 'Missing required fields' }, { status: 400 });
	}

	const rail = await query('SELECT * FROM rails WHERE id = ?', [railId]);
	if (rail.length === 0) {
		return json({ success: false, message: 'Rail not found' }, { status: 404 });
	}

	if (rail[0].owner_id !== me.id) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	await query('UPDATE rails SET owner_id = ? WHERE id = ?', [owner_id, railId]);

	return json({ success: true });
};
