import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/items/{itemId}:
 *   get:
 *     summary: Retrieve details of a specific item by ID.
 *     tags:
 *       - Items
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         description: The ID of the item (starts from 1) to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Details of the specified item.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 item:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     maker:
 *                       type: string
 *                       description: The Discord ID of the user who created the item.
 *                     created_at:
 *                       type: string
 *                       format: date-time
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
export const GET: RequestHandler = async ({ params }) => {
	const itemId = params.itemId;

	const item = await query('SELECT * FROM items WHERE id = ?', [itemId]);

	if (item.length === 0) {
		return json({ success: false, message: 'Item not found' }, { status: 404 });
	}

	return json({ success: true, item: item[0] });
};

/**
 * @swagger
 * /api/v1/items/{itemId}:
 *   put:
 *     summary: Update details of a specific item (owner only).
 *     tags:
 *       - Items
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         description: The ID of the item (starts from 1) to update.
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
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name of the item.
 *               description:
 *                 type: string
 *                 description: The new description of the item.
 *     responses:
 *       200:
 *         description: Item updated successfully.
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
 *                   example: Item updated
 *       400:
 *         description: Bad request, name and description are required.
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
 *                   example: Name and description are required
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
 *                   example: Forbidden
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
export const PUT: RequestHandler = async ({ params, request, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const item = await query('SELECT * FROM items WHERE id = ?', [params.itemId]);

	if (item.length === 0) {
		return json({ success: false, message: 'Item not found' }, { status: 404 });
	}

	if (item[0].maker !== me.id) {
		return json({ success: false, message: 'Forbidden' }, { status: 403 });
	}

	const { name, description } = await request.json();

	if (!name || !description) {
		return json({ success: false, message: 'Name and description are required' }, { status: 400 });
	}

	await query('UPDATE items SET name = ?, description = ? WHERE id = ?', [
		name,
		description,
		params.itemId
	]);

	return json({ success: true, message: 'Item updated' });
};

/**
 * @swagger
 * /api/v1/items/{itemId}:
 *   delete:
 *     summary: Delete a specific item (owner only).
 *     tags:
 *       - Items
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         description: The ID of the item (starts from 1) to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item deleted successfully.
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
 *                   example: Item deleted
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
 *                   example: Forbidden
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
export const DELETE: RequestHandler = async ({ params, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const item = await query('SELECT * FROM items WHERE id = ?', [params.itemId]);

	if (item.length === 0) {
		return json({ success: false, message: 'Item not found' }, { status: 404 });
	}

	if (item[0].maker !== me.id) {
		return json({ success: false, message: 'Forbidden' }, { status: 403 });
	}

	await query('DELETE FROM items WHERE id = ?', [params.itemId]);

	return json({ success: true, message: 'Item deleted' });
};