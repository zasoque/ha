import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/accounts:
 *   get:
 *     summary: Retrieve a list of accounts for the authenticated user.
 *     tags:
 *       - Accounts
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of accounts.
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
 *                         description: The unique identifier of the account (starts from 1).
 *                       user_id:
 *                         type: string
 *                         description: The unique identifier of the user (Discord ID) who owns the account.
 *                       balance:
 *                         type: number
 *                         format: float
 *                         description: The current balance of the account.
 *       401:
 *         description: Unauthorized, no token found.
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
 *                   example: No token found
 *       404:
 *         description: No accounts found for this user.
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
 *                   example: No accounts found for this user
 */
export const GET: RequestHandler = async ({ cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'No token found' });
	}

	const me = await getMe(token);
	const userId = me.id;

	const accounts = await query('SELECT * FROM accounts WHERE user_id = ?', [userId]);

	if (accounts.length === 0) {
		return json({ success: false, message: 'No accounts found for this user' });
	}

	return json({ success: true, accounts });
};

/**
 * @swagger
 * /api/v1/accounts:
 *   post:
 *     summary: Create a new account for a specified user.
 *     tags:
 *       - Accounts
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
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: The ID of the user (Discord ID) for whom to create the account. This can be a personal user ID or a corporation ID.
 *     responses:
 *       200:
 *         description: Account created successfully.
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
 *                   example: Account created successfully
 *       401:
 *         description: Unauthorized, no token found.
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
 *                   example: No token found
 *       403:
 *         description: Forbidden, user is not authorized to create an account for the specified ID.
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
 *                     userMismatch:
 *                       value: "User ID does not match token"
 *                     notMember:
 *                       value: "User is not a member of this corporation"
 *       404:
 *         description: User not found in the people table.
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
 *                   example: User not found in people table
 */
export const POST: RequestHandler = async ({ cookies, request }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'No token found' });
	}

	const me = await getMe(token);

	const { user_id } = await request.json();

	const person = await query('SELECT * FROM people WHERE id = ?', [user_id]);

	if (person.length === 0) {
		return json({ success: false, message: 'User not found in people table' });
	}

	if (person[0].type === 'corporation') {
		const members = await query('SELECT * FROM corporation_members WHERE corporation_id = ?', [
			user_id
		]);
		const memberIds = members.map((member: any) => member.user_id);
		if (!memberIds.includes(me.id)) {
			return json({ success: false, message: 'User is not a member of this corporation' });
		}
	} else {
		if (user_id !== me.id) {
			return json({ success: false, message: 'User ID does not match token' });
		}
	}

	await query('INSERT INTO accounts (user_id) VALUES (?)', [user_id]);

	return json({ success: true, message: 'Account created successfully' });
};