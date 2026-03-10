import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { TAINT_ITEM_ID } from '$lib/util/const';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/maps/roads:
 *   get:
 *     summary: Retrieve a list of all roads.
 *     tags:
 *       - Maps - Roads
 *     responses:
 *       200:
 *         description: A list of roads.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 roads:
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
 *                         description: The Discord ID of the road owner.
 *                       land_a_id:
 *                         type: integer
 *                       land_b_id:
 *                         type: integer
 *                       line:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: LineString
 *                           coordinates:
 *                             type: array
 *                             items:
 *                               type: array
 *                               items:
 *                                 type: number
 *                               minItems: 2
 *                               maxItems: 2
 */
export const GET: RequestHandler = async () => {
	const roads = await query('SELECT * FROM roads');
	return json({ success: true, roads });
};

/**
 * @swagger
 * /api/v1/maps/roads:
 *   post:
 *     summary: Create a new road between two lands.
 *     tags:
 *       - Maps - Roads
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
 *               - land_a_id
 *               - land_b_id
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the road.
 *               land_a_id:
 *                 type: integer
 *                 description: The ID of the first land (starts from 1) connected by the road.
 *               land_b_id:
 *                 type: integer
 *                 description: The ID of the second land (starts from 1) connected by the road.
 *               free:
 *                 type: boolean
 *                 description: Optional. If true, road construction is free (admin only).
 *     responses:
 *       200:
 *         description: Road created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request, missing required fields, lands are the same, road intersects with existing road, or insufficient taint.
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
 *                     sameLand:
 *                       value: "Cannot build road on the same land"
 *                     intersects:
 *                       value: "Road intersects with existing road"
 *                     insufficientTaint:
 *                       value: "Insufficient taint"
 *       401:
 *         description: Unauthorized, no token found, invalid token, or not authorized for free construction.
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
export const POST: RequestHandler = async ({ request, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	let { owner_id, name, land_a_id, land_b_id, free } = await request.json();

	if (!name || !owner_id || !land_a_id || !land_b_id) {
		return json({ success: false, message: 'Missing required fields' }, { status: 400 });
	}

	if (land_a_id === land_b_id) {
		return json({ success: false, message: 'Cannot build road on the same land' }, { status: 400 });
	}

	const landA = await query('SELECT * FROM lands WHERE id = ?', [land_a_id]);
	const landB = await query('SELECT * FROM lands WHERE id = ?', [land_b_id]);

	if (landA.length === 0 || landB.length === 0) {
		return json({ success: false, message: 'Land not found' }, { status: 404 });
	}

	const duplicationCheck = await query(
		`SELECT id FROM roads WHERE ST_Crosses(line, ST_LineStringFromText(?)) OR ST_Overlaps(line, ST_LineStringFromText(?))`,
		[
			`LINESTRING(${landA[0].position_x} ${landA[0].position_y}, ${landB[0].position_x} ${landB[0].position_y})`,
			`LINESTRING(${landA[0].position_x} ${landA[0].position_y}, ${landB[0].position_x} ${landB[0].position_y})`
		]
	);

	if (duplicationCheck.length > 0) {
		return json({ success: false, message: 'Road intersects with existing road' }, { status: 400 });
	}

	if (free) {
		if (!(await isAdmin(owner_id))) {
			return json({ success: false, message: 'Unauthorized' }, { status: 401 });
		}
	} else {
		const distance = Math.hypot(
			landA[0].position.coordinates[0] - landB[0].position.coordinates[0],
			landA[0].position.coordinates[1] - landB[0].position.coordinates[1]
		);
		const taintCost = Math.ceil(distance);

		if (me.id !== owner_id) {
			// assert that the user is corporation
			const corporationMemberRelation = await query(
				'SELECT * FROM corporation_members WHERE user_id = ? AND corporation_id = ?',
				[me.id, owner_id]
			);

			if (corporationMemberRelation.length === 0) {
				return json({ success: false, message: 'Unauthorized' }, { status: 401 });
			}
		}

		const stock = await query('SELECT * FROM inventory WHERE user_id = ? AND item_id = ?', [
			owner_id,
			TAINT_ITEM_ID
		]);

		if (stock.length === 0 || stock[0].quantity < taintCost) {
			return json({ success: false, message: 'Insufficient taint' }, { status: 400 });
		}

		await query('UPDATE inventory SET quantity = quantity - ? WHERE user_id = ? AND item_id = ?', [
			taintCost,
			owner_id,
			TAINT_ITEM_ID
		]);
	}

	await query(
		'INSERT INTO roads (name, owner_id, land_a_id, land_b_id, line) VALUES (?, ?, ?, ?, ST_LineStringFromText(?))',
		[
			name,
			owner_id,
			land_a_id,
			land_b_id,
			`LINESTRING(${landA[0].position.coordinates[0]} ${landA[0].position.coordinates[1]}, ${landB[0].position.coordinates[0]} ${landB[0].position.coordinates[1]})`
		]
	);

	return json({ success: true });
};
