import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies }) => {
	cookies.set('token', '', { path: '/', expires: new Date(0) });

	return json({ success: true });
};
