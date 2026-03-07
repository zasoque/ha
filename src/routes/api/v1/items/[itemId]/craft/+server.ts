import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { TAINT_ITEM_ID } from '$lib/util/const';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/items/{itemId}/craft:
 *   post:
 *     summary: Craft an item using taint.
 *     tags:
 *       - Items
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         description: The ID of the item (starts from 1) to craft.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: The quantity of the item to craft. This amount of 'taint' will be consumed.
 *     responses:
 *       200:
 *         description: Item crafted successfully.
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
 *                   example: Item purchased successfully
 *       400:
 *         description: Bad request, missing item ID or quantity, or not enough taint in stock.
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
 *                       value: "Missing itemId or quantity"
 *                     notEnoughTaint:
 *                       value: "Not enough taint in stock"
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
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden, user does not own this item.
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
 *                   example: You do not own this item
 *       404:
 *         description: Item not found.
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
 *                   example: Item not found
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

	const { itemId } = params;
	const { quantity } = await request.json();

	if (!itemId || !quantity) {
		return json({ success: false, message: 'Missing itemId or quantity' }, { status: 400 });
	}

	const taintStock = await query(
		'SELECT * FROM inventory WHERE item_id = ? AND user_id = ? AND quantity > 0',
		[TAINT_ITEM_ID, me.id]
	);

	if (taintStock.length === 0 || taintStock[0].quantity < quantity) {
		return json({ success: false, message: 'Not enough taint in stock' }, { status: 400 });
	}

	if (taintStock[0].quantity === quantity) {
		await query('DELETE FROM inventory WHERE id = ?', [taintStock[0].id]);
	} else {
		await query('UPDATE inventory SET quantity = quantity - ? WHERE id = ?', [
			quantity,
			taintStock[0].id
		]);
	}

	const item = await query('SELECT * FROM items WHERE id = ?', [itemId]);

	if (item.length === 0) {
		return json({ success: false, message: 'Item not found' }, { status: 404 });
	}

	if (item[0].maker !== me.id) {
		return json({ success: false, message: 'You do not own this item' }, { status: 403 });
	}

	await query(
		'INSERT INTO inventory (user_id, item_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
		[me.id, itemId, quantity, quantity]
	);

	return json({ success: true, message: 'Item purchased successfully' });
};