import { getMe } from '$lib/discord/users';
import { getAccount } from '$lib/server/account';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import {
	TAINT_ITEM_ID,
	TYPE_FARM,
	TYPE_MARKET,
	TYPE_OFFICE,
	TYPE_RESIDENTIAL
} from '$lib/util/const';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/maps/lands/{landId}/buildings:
 *   get:
 *     summary: Retrieve a list of buildings on a specific land.
 *     tags:
 *       - Maps - Lands
 *     parameters:
 *       - in: path
 *         name: landId
 *         required: true
 *         description: The ID of the land (starts from 1) to retrieve buildings from.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of buildings on the specified land.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 land:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     x:
 *                       type: integer
 *                     y:
 *                       type: integer
 *                     owner_id:
 *                       type: string
 *                       description: The Discord ID of the land owner.
 *                     solidity:
 *                       type: number
 *                       format: float
 *                     fertility:
 *                       type: number
 *                       format: float
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
 *       404:
 *         description: Land not found.
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
 *                   example: Land not found
 */
export const GET: RequestHandler = async ({ params }) => {
	const { landId } = params;

	const land = await query('SELECT * FROM lands WHERE id = ?', [landId]);

	if (land.length === 0) {
		return json({ success: false, message: 'Land not found' }, { status: 404 });
	}

	const buildings = await query('SELECT * FROM buildings WHERE land_id = ?', [landId]);

	return json({ success: true, land: land[0], buildings });
};

function taintCost(type: string): number {
	if (type === TYPE_RESIDENTIAL) {
		return 8;
	} else if (type === TYPE_OFFICE) {
		return 20;
	} else if (type === TYPE_MARKET) {
		return 10;
	} else if (type === TYPE_FARM) {
		return 5;
	}
	return Infinity;
}

/**
 * @swagger
 * /api/v1/maps/lands/{landId}/buildings:
 *   post:
 *     summary: Construct a new building on a specific land.
 *     tags:
 *       - Maps - Lands
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: landId
 *         required: true
 *         description: The ID of the land (starts from 1) to construct the building on.
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
 *               - type
 *               - account_id
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the new building.
 *               type:
 *                 type: string
 *                 enum: [residential, office, market, farm]
 *                 description: The type of the new building.
 *               account_id:
 *                 type: integer
 *                 description: The account ID (starts from 1) from which construction costs will be deducted.
 *               free:
 *                 type: boolean
 *                 description: Optional. If true, construction is free (admin only).
 *     responses:
 *       200:
 *         description: Building created successfully.
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
 *                   example: Building created successfully
 *       400:
 *         description: Bad request, missing required fields, building type restrictions, or not enough balance/taint.
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
 *                     farmBuildingRestriction:
 *                       value: "Farm cannot be built on land with existing buildings"
 *                     marketBuildingRestriction:
 *                       value: "Market cannot be built on land with existing buildings"
 *                     officeBuildingRestriction:
 *                       value: "Office can only be built on office or market building"
 *                     residentialBuildingRestriction:
 *                       value: "Residential building can only be built on land with no existing buildings or with one existing residential building"
 *                     notEnoughBalance:
 *                       value: "Not enough balance to build residential building"
 *                     notEnoughBalanceGeneric:
 *                       value: "Not enough balance to build building"
 *                     notEnoughTaint:
 *                       value: "Not enough taint in inventory"
 *       401:
 *         description: Unauthorized, no token found, invalid token, or not authorized to use free construction.
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
 *         description: Land not found.
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
 *                   example: Land not found
 */
export const POST: RequestHandler = async ({ params, request, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const { landId } = params;
	let owner_id = me.id;
	const { name, type, account_id, free } = await request.json();
	const land_id = landId;

	if (!name || !land_id || !type || !account_id) {
		return json({ success: false, message: 'Missing required fields' }, { status: 400 });
	}

	const account = await getAccount(account_id);

	if (!free && account.user_id !== owner_id) {
		// assert that the owner is a corporation
		const corporationMemberRelation = await query(
			'SELECT cm.* FROM corporation_members cm JOIN accounts a ON cm.corporation_id = a.user_id WHERE cm.user_id = ? AND a.id = ?',
			[owner_id, account_id]
		);

		if (corporationMemberRelation.length === 0) {
			return json({ success: false, message: 'Unauthorized' }, { status: 401 });
		}

		owner_id = corporationMemberRelation[0].corporation_id;
	}

	const alreadyBuildings = await query('SELECT * FROM buildings WHERE land_id = ?', [landId]);

	if (type === TYPE_FARM && alreadyBuildings.length > 0) {
		return json(
			{ success: false, message: 'Farm cannot be built on land with existing buildings' },
			{ status: 400 }
		);
	}

	if (type === TYPE_MARKET && alreadyBuildings.length > 0) {
		return json(
			{ success: false, message: 'Market cannot be built on land with existing buildings' },
			{ status: 400 }
		);
	}

	if (
		type === TYPE_OFFICE &&
		alreadyBuildings.length > 0 &&
		alreadyBuildings[alreadyBuildings.length - 1].type !== TYPE_OFFICE &&
		alreadyBuildings[alreadyBuildings.length - 1].type !== TYPE_MARKET
	) {
		return json(
			{
				success: false,
				message: 'Office can only be built on office or market building'
			},
			{ status: 400 }
		);
	}

	if (
		type === TYPE_RESIDENTIAL &&
		alreadyBuildings.length > 0 &&
		alreadyBuildings[alreadyBuildings.length - 1].type !== TYPE_RESIDENTIAL
	) {
		return json(
			{
				success: false,
				message:
					'Residential building can only be built on land with no existing buildings or with one existing residential building'
			},
			{ status: 400 }
		);
	}

	const land = await query('SELECT * FROM lands WHERE id = ?', [landId]);

	if (land.length === 0) {
		return json({ success: false, message: 'Land not found' }, { status: 404 });
	}

	if (type === TYPE_RESIDENTIAL) {
		if (free) {
			if (!(await isAdmin(owner_id))) {
				return json({ success: false, message: 'Unauthorized' }, { status: 401 });
			}
		} else {
			const residentialBuildingCost =
				(Math.pow(alreadyBuildings.length + 1, 2) * 0.3) / (2 * land[0].solidity);
			const account = await getAccount(account_id);
			if (account.balance < residentialBuildingCost) {
				return json(
					{ success: false, message: 'Not enough balance to build residential building' },
					{ status: 400 }
				);
			}

			await query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [
				residentialBuildingCost,
				account_id
			]);
			await query(
				"INSERT INTO transactions (account_id, amount, type, description) VALUES (?, ?, 'withdrawal', ?)",
				[
					account_id,
					residentialBuildingCost,
					`땅#${land_id} ${alreadyBuildings.length + 1}층 주거 증축세`
				]
			);
		}
	} else {
		const buildingCost = 0.25 / (land[0].solidity * Math.random());
		if (account.balance < buildingCost) {
			return json(
				{ success: false, message: 'Not enough balance to build building' },
				{ status: 400 }
			);
		}

		await query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [
			buildingCost,
			account_id
		]);
		await query(
			"INSERT INTO transactions (account_id, amount, type, description) VALUES (?, ?, 'withdrawal', ?)",
			[account_id, buildingCost, `땅#${land_id} ${type} 건축 비용`]
		);
	}

	if (free) {
		if (!(await isAdmin(owner_id))) {
			return json({ success: false, message: 'Unauthorized' }, { status: 401 });
		}
	} else {
		const stock = await query('SELECT * FROM inventory WHERE user_id = ? AND item_id = ?', [
			owner_id,
			TAINT_ITEM_ID
		]);

		if (stock.length === 0 || stock[0].quantity < taintCost(type)) {
			return json({ success: false, message: 'Not enough taint in inventory' }, { status: 400 });
		}

		await query('UPDATE inventory SET quantity = quantity - ? WHERE user_id = ? AND item_id = ?', [
			taintCost(type),
			owner_id,
			TAINT_ITEM_ID
		]);
	}

	await query('INSERT INTO buildings (name, owner_id, land_id, type) VALUES (?, ?, ?, ?)', [
		name,
		owner_id,
		land_id,
		type
	]);

	return json({ success: true, message: 'Building created successfully' });
};
