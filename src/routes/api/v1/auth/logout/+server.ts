import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/auth/logout:
 *   get:
 *     summary: Log out the authenticated user.
 *     description: Clears the authentication token cookie, effectively logging out the user.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: User successfully logged out.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 */
export const GET: RequestHandler = async ({ cookies }) => {
	cookies.set('token', '', { path: '/', expires: new Date(0) });

	return json({ success: true });
};
