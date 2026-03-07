import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { sendNotification } from '$lib/server/notification';
import { TYPE_RESIDENTIAL } from '$lib/util/const';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/admin/people/{personId}:
 *   get:
 *     summary: Retrieve details of a specific person by ID (Admin only).
 *     tags:
 *       - Admin - People
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: personId
 *         required: true
 *         description: The Discord ID of the person to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Details of the specified person.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 person:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The Discord ID of the person.
 *                     name:
 *                       type: string
 *                     residence:
 *                       type: integer
 *                       description: The ID of the residential building (starts from 1) where the person resides.
 *       400:
 *         description: Bad request, person ID is required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: User ID is required
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
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden, user is not an administrator.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Forbidden
 *       404:
 *         description: Person not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: User not found
 */
export const GET: RequestHandler = async ({ params, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!(await isAdmin(me.id))) {
		return json({ success: false, error: 'Forbidden' }, { status: 403 });
	}

	const id = params.personId;

	if (!id) {
		return json({ success: false, error: 'User ID is required' }, { status: 400 });
	}

	const people = await query('SELECT * FROM people WHERE id = ?', [id]);

	if (people.length === 0) {
		return json({ success: false, error: 'User not found' }, { status: 404 });
	}

	return json({ success: true, person: people[0] });
};

/**
 * @swagger
 * /api/v1/admin/people/{personId}:
 *   delete:
 *     summary: Delete a specific person by ID (Admin only).
 *     tags:
 *       - Admin - People
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: personId
 *         required: true
 *         description: The Discord ID of the person to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Person deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request, person ID is required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: User ID is required
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
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden, user is not an administrator.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Forbidden
 */
export const DELETE: RequestHandler = async ({ params, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!(await isAdmin(me.id))) {
		return json({ success: false, error: 'Forbidden' }, { status: 403 });
	}

	const id = params.personId;

	if (!id) {
		return json({ success: false, error: 'User ID is required' }, { status: 400 });
	}

	await query('DELETE FROM people WHERE id = ?', [id]);
	await sendNotification(id, `관리자가 너를 등록부에서 삭제했어. 더 이상 서비스를 이용할 수 없어.`);

	return json({ success: true });
};

/**
 * @swagger
 * /api/v1/admin/people/{personId}:
 *   put:
 *     summary: Update details of a specific person by ID (Admin only).
 *     tags:
 *       - Admin - People
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: personId
 *         required: true
 *         description: The Discord ID of the person to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - residence
 *               - name
 *             properties:
 *               residence:
 *                 type: integer
 *                 description: The ID of the new residential building (starts from 1) for the person.
 *               name:
 *                 type: string
 *                 description: The new name of the person.
 *     responses:
 *       200:
 *         description: Person details updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request, missing residence/name, invalid residence, or residence is not residential.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   examples:
 *                     missingFields:
 *                       value: "Residence and name are required"
 *                     invalidResidence:
 *                       value: "Invalid residence"
 *                     notResidential:
 *                       value: "Residence must be a residential building"
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
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden, user is not an administrator.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Forbidden
 */
export const PUT: RequestHandler = async ({ request, params, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!(await isAdmin(me.id))) {
		return json({ success: false, error: 'Forbidden' }, { status: 403 });
	}

	const { residence, name } = await request.json();

	if (!residence || !name) {
		return json({ success: false, error: 'Residence and name are required' }, { status: 400 });
	}

	const building = await query('SELECT * FROM buildings WHERE id = ?', [residence]);

	if (building.length === 0) {
		return json({ success: false, error: 'Invalid residence' }, { status: 400 });
	}

	if (building[0].type !== TYPE_RESIDENTIAL) {
		return json(
			{ success: false, error: 'Residence must be a residential building' },
			{ status: 400 }
		);
	}

	const id = params.personId!;

	await query('UPDATE people SET residence = ?, name = ? WHERE id = ?', [residence, name, id]);
	await sendNotification(
		id,
		`관리자가 너를 ${residence}에 거주하는 ${name}으로 수정했어. 변경된 정보로 서비스를 이용할 수 있어.`
	);

	return json({ success: true });
};