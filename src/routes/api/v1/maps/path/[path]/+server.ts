import { getFee } from '$lib/server/maps';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const pathStr = params.path || '';
	const fee = await getFee(pathStr);

	if (fee instanceof Response) {
		return fee;
	}

	return json({ success: true, fee });
};
