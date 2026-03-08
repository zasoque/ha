import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/maps/lands/{landId]/name:
 *  put:
 *  summary: Update the name of a Land
 *  description: Update the name of a Land. Only the owner of the Land can update its name.
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
 *            name:
 *              type: string
 *              description: The new name for the Land
 *  responses:
 *    200:
 *      description: Land name updated successfully
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
 *      description: Missing landId or name
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
 */
export const PUT: RequestHandler = async ({ params, cookies, request }) => {
	const { landId } = params;
	const { name } = await request.json();

	if (!landId || !name) {
		return json({ success: false, message: 'Missing landId or name' }, { status: 400 });
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

	await query('UPDATE lands SET name = ? WHERE id = ?', [name, landId]);

	return json({ success: true, message: 'Land name updated successfully' });
};
