import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/maps/lands/{landId]/color:
 *  put:
 *  summary: Update the color of a Land
 *  description: Update the color of a Land. Only the owner of the Land can update its color.
 *  tags:
 *    - Lands
 *  parameters:
 *    - in: path
 *      name: landId
 *      required: true
 *      schema:
 *        type: integer
 *      description: The ID of the Land to update
 *  requestBody:
 *    required: true
 *    content:
 *      application/json:
 *        schema:
 *          type: object
 *          properties:
 *            color:
 *              type: string
 *              description: The new color for the Land (hex code)
 *  responses:
 *    200:
 *      description: Land color updated successfully
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              success:
 *                type: boolean
 *              message:
 *                type: string
 *    400:
 *      description: Missing landId or color
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              success:
 *                type: boolean
 *              message:
 *                type: string
 *    401:
 *      description: Unauthorized
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              success:
 *                type: boolean
 *              message:
 *                type: string
 *    403:
 *      description: Forbidden
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              success:
 *                type: boolean
 *              message:
 *                type: string
 *    404:
 *      description: Land not found
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              success:
 *                type: boolean
 *              message:
 *                type: string
 */
export const PUT: RequestHandler = async ({ params, cookies, request }) => {
	const { landId } = params;
	const { color } = await request.json();

	if (!landId || !color) {
		return json({ success: false, message: 'Missing landId or color' }, { status: 400 });
	}

	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const [land] = await query('SELECT * FROM lands WHERE id = ?', [landId]);

	if (!land) {
		return json({ success: false, message: 'Land not found' }, { status: 404 });
	}

	if (land.owner_id !== me.id) {
		return json({ success: false, message: 'Forbidden' }, { status: 403 });
	}

	await query('UPDATE lands SET color = ? WHERE id = ?', [color, landId]);

	return json({ success: true, message: 'Land color updated successfully' });
};
