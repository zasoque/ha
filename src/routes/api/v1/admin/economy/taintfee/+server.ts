import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/admin/economy/taintfee:
 *   post:
 *     summary: Update the taint fee
 *     description: Update the taint fee for the economy system.
 *     tags:
 *       - Admin
 *       - Economy
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fee:
 *                 type: number
 *                 description: The new taint fee (must be a non-negative number).
 *     responses:
 *       200:
 *         description: Taint fee updated successfully.
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
 *                   example: Taint fee updated
 *       400:
 *         description: Invalid request body.
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
 *                   example: Invalid fee
 *       401:
 *         description: Unauthorized (missing or invalid token).
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
 *         description: Forbidden (user is not an admin).
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

	const { fee } = await request.json();

	if (typeof fee !== 'number' || fee < 0) {
		return json({ success: false, message: 'Invalid fee' }, { status: 400 });
	}

	await query("UPDATE number_values SET value = ? WHERE `key` = 'taintfee'", [fee]);

	return json({ success: true, message: 'Taint fee updated' });
};

export const GET: RequestHandler = async ({ cookies }) => {
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

	const result = await query("SELECT value FROM number_values WHERE `key` = 'taintfee'");
	const fee = result[0]?.value ?? null;

	return json({ success: true, fee });
};
