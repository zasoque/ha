import { getMe } from '$lib/discord/users';
import { getAccount } from '$lib/server/account';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/maps/lands/{landId}/fertility:
 *   get:
 *     summary: Determine the fertility range of a specific land (costs money).
 *     description: This endpoint allows an authenticated user to investigate the fertility of a land by performing a "fertility survey" at a given level. This action costs money, which is deducted from the specified account.
 *     tags:
 *       - Maps - Lands
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: landId
 *         required: true
 *         description: The ID of the land (starts from 1) to investigate.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: level
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The level of fertility investigation. Higher levels provide more precise ranges but cost more.
 *       - in: query
 *         name: account_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the account (starts from 1) from which the investigation cost will be deducted.
 *     responses:
 *       200:
 *         description: Returns the minimum and maximum possible fertility values for the land at the requested investigation level.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 min:
 *                   type: number
 *                   format: float
 *                   description: The minimum possible fertility value.
 *                 max:
 *                   type: number
 *                   format: float
 *                   description: The maximum possible fertility value.
 *       400:
 *         description: Bad request, missing required fields, invalid level/account_id, or insufficient funds.
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
 *                     missingFields:
 *                       value: "Missing required fields"
 *                     insufficientFunds:
 *                       value: "Insufficient funds"
 *       401:
 *         description: Unauthorized, no token found, invalid token, or account does not belong to the user.
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
 *         description: Land or account not found.
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
 *                     landNotFound:
 *                       value: "Land not found"
 *                     accountNotFound:
 *                       value: "Account not found"
 */
export const GET: RequestHandler = async ({ params, cookies, url }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const { landId } = params;

	const land = await query('SELECT * FROM lands WHERE id = ?', [landId]);

	if (land.length === 0) {
		return json({ success: false, message: 'Land not found' }, { status: 404 });
	}

	const level = Number(url.searchParams.get('level'));
	const account_id = Number(url.searchParams.get('account_id'));

	if (isNaN(level) || isNaN(account_id)) {
		return json({ success: false, message: 'Missing required fields' }, { status: 400 });
	}

	const account = await getAccount(account_id);

	if (!account) {
		return json({ success: false, message: 'Account not found' }, { status: 404 });
	}

	if (account.user_id !== me.id) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const cost = 0.75 * Math.pow(2, level - 1);

	if (account.balance < cost) {
		return json({ success: false, message: 'Insufficient funds' }, { status: 400 });
	}

	await query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [cost, account_id]);
	await query(
		'INSERT INTO transactions (account_id, amount, type, description) VALUES (?, ?, ?, ?)',
		[account_id, -cost, 'withdrawal', `토지 #${landId} 비옥도 조사 ${level}단계 비용`]
	);

	const fertility = land[0].fertility;

	const max = Math.ceil(fertility * Math.pow(2, level)) / Math.pow(2, level);
	const min = Math.floor(fertility * Math.pow(2, level)) / Math.pow(2, level);

	return json({ success: true, min, max });
};