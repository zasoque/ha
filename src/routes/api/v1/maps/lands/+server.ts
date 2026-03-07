import { getMe } from '$lib/discord/users';
import { getAccount } from '$lib/server/account';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/maps/lands:
 *   get:
 *     summary: Retrieve a list of all lands.
 *     tags:
 *       - Maps - Lands
 *     responses:
 *       200:
 *         description: A list of lands, with fertility and solidity information omitted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 lands:
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
 *                         description: The Discord ID of the land owner.
 *                       position:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: Point
 *                           coordinates:
 *                             type: array
 *                             items:
 *                               type: number
 *                             minItems: 2
 *                             maxItems: 2
 *                       color:
 *                         type: string
 */
export const GET: RequestHandler = async () => {
	const lands = await query('SELECT * FROM lands');

	lands.forEach((land: any) => {
		land.fertility = undefined;
		land.solidity = undefined;
	});

	return json({ success: true, lands });
};

/**
 * @swagger
 * /api/v1/maps/lands:
 *   post:
 *     summary: Create a new land.
 *     tags:
 *       - Maps - Lands
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - x
 *               - y
 *               - color
 *               - account_id
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the new land.
 *               x:
 *                 type: number
 *                 description: The X coordinate of the new land.
 *               y:
 *                 type: number
 *                 description: The Y coordinate of the new land.
 *               color:
 *                 type: string
 *                 description: The color of the new land (e.g., '#RRGGBB').
 *               account_id:
 *                 type: integer
 *                 description: The account ID (starts from 1) from which the land creation cost will be deducted.
 *               free:
 *                 type: boolean
 *                 description: Optional. If true, land creation is free (admin only).
 *     responses:
 *       200:
 *         description: Land created successfully.
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
 *                   example: Land created successfully
 *       400:
 *         description: Bad request, missing required fields, land too close to existing land, or insufficient funds.
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
 *                     tooClose:
 *                       value: "Land is too close to an existing land"
 *                     insufficientFunds:
 *                       value: "Insufficient funds"
 *       401:
 *         description: Unauthorized, no token found, invalid token, or not authorized for free creation.
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
 *       500:
 *         description: Failed to create land.
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
 *                   example: Failed to create land
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const owner_id = me.id;

	const { name, x, y, color, account_id, free } = await request.json();

	if (!name || !owner_id || x === undefined || y === undefined || !color) {
		return json({ success: false, message: 'Missing required fields' }, { status: 400 });
	}

	const closestLand = await query(
		'SELECT id, ST_Distance(position, POINT(?, ?)) AS distance FROM lands ORDER BY distance ASC LIMIT 1',
		[x, y]
	);

	if (closestLand.length > 0 && closestLand[0].distance < 1.0) {
		return json(
			{ success: false, message: 'Land is too close to an existing land' },
			{ status: 400 }
		);
	}

	if (free) {
		if (!(await isAdmin(owner_id))) {
			return json({ success: false, message: 'Unauthorized' }, { status: 401 });
		}
	} else {
		const account = await getAccount(account_id);

		if (account.user_id !== owner_id) {
			return json({ success: false, message: 'Unauthorized' }, { status: 401 });
		}

		if (account.balance < 2.0) {
			return json({ success: false, message: 'Insufficient funds' }, { status: 400 });
		}

		await query('UPDATE accounts SET balance = balance - 2.0 WHERE id = ?', [account_id]);
		await query(
			'INSERT INTO transactions (account_id, amount, type, description) VALUES (?, ?, ?, ?)',
			[account_id, -2.0, 'withdrawal', '토지 개발']
		);
	}

	const result = await query(
		'INSERT INTO lands (name, owner_id, position, color) VALUES (?, ?, POINT(?, ?), ?)',
		[name, owner_id, x, y, color]
	);

	if (result.affectedRows === 1) {
		return json({ success: true, message: 'Land created successfully' });
	} else {
		return json({ success: false, message: 'Failed to create land' }, { status: 500 });
	}
};