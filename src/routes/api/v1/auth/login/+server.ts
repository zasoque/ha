import { getMe } from '$lib/discord/users';
import { ensureAccountExists } from '$lib/server/auth';
import { json, redirect, type RequestHandler } from '@sveltejs/kit';
import dotenv from 'dotenv';

dotenv.config();

/**
 * @swagger
 * /api/v1/auth/login:
 *   get:
 *     summary: Initiate Discord OAuth2 login flow.
 *     description: This endpoint is the callback URL for Discord OAuth2. It exchanges the authorization code for an access token, sets an authentication cookie, and redirects the user to the homepage.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: The authorization code received from Discord.
 *     responses:
 *       308:
 *         description: Redirects to the homepage upon successful authentication.
 *       500:
 *         description: Internal server error if token exchange fails.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to exchange code for token
 *                 details:
 *                   type: object
 */
export const GET: RequestHandler = async ({ cookies, fetch, request }) => {
	const query = new URL(request.url).searchParams;
	const code = query.get('code');

	const data = await fetch(`https://discord.com/api/v10/oauth2/token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code: code || '',
			redirect_uri: process.env.DISCORD_REDIRECT_URI || '',
			client_id: process.env.DISCORD_CLIENT_ID || '',
			client_secret: process.env.DISCORD_CLIENT_SECRET || ''
		})
	})
		.then((res) => res.json())
		.then((data) => {
			return data;
		})
		.catch((error) => {
			json({ error: 'Failed to exchange code for token', details: error }, { status: 500 });
		});

	cookies.set('token', data.access_token, {
		path: '/',
		maxAge: 60 * 60 * 24 * 7, // 1 week
		httpOnly: true,
		secure: request.url.startsWith('https://'),
		sameSite: 'lax'
	});

	const me = await getMe(data.access_token);
	await ensureAccountExists(me.id);

	return redirect(308, '/');
};
