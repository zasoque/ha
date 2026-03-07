import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/accounts/corporations/{corporationId}:
 *   get:
 *     summary: Retrieve all accounts associated with a specific corporation for the authenticated user.
 *     tags:
 *       - Accounts
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: corporationId
 *         required: true
 *         description: The ID of the corporation to retrieve accounts for.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of accounts associated with the specified corporation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 accounts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique identifier of the account.
 *                       user_id:
 *                         type: string
 *                         description: The unique identifier of the user (Discord ID) who owns the account.
 *                       balance:
 *                         type: number
 *                         format: float
 *       400:
 *         description: Bad request, corporation ID is missing.
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
 *                   example: "Corporation ID is required"
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
 *                   examples:
 *                     noToken:
 *                       value: "No token found"
 *                     invalidToken:
 *                       value: "Invalid token"
 *       404:
 *         description: Corporation not found, does not belong to the user, or no accounts found for the corporation.
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
 *                   examples:
 *                     corporationNotFound:
 *                       value: "Corporation not found"
 *                     corporationNotBelongToUser:
 *                       value: "Corporation does not belong to the user"
 *                     noAccountsFound:
 *                       value: "No accounts found for this corporation"
 */
export const GET: RequestHandler = async ({ cookies, params }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'No token found' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Invalid token' }, { status: 401 });
	}

	const corporationId = params.corporationId;

	if (!corporationId) {
		return json({ success: false, message: 'Corporation ID is required' }, { status: 400 });
	}

	const corporation = await query('SELECT * FROM people WHERE id = ?', [corporationId]);

	if (corporation.length === 0) {
		return json({ success: false, message: 'Corporation not found' }, { status: 404 });
	}

	const members = await query('SELECT * FROM corporation_members WHERE corporation_id = ?', [
		corporation[0].id
	]);

	if (!members.some((member: any) => member.user_id === me.id)) {
		return json(
			{ success: false, message: 'Corporation does not belong to the user' },
			{ status: 404 }
		);
	}

	const accounts = await query('SELECT * FROM accounts WHERE user_id = ?', [corporation[0].id]);

	if (!accounts) {
		return json(
			{ success: false, message: 'No accounts found for this corporation' },
			{ status: 404 }
		);
	}

	return json({ success: true, accounts });
};
