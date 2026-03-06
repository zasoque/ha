import { query } from '$lib/server/db';
import { getFee } from '$lib/server/maps';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const pathStr = params.path || '';
	const path = [];
	for (let pathPart of pathStr.split('_')) {
		const land = await query('SELECT * FROM lands WHERE id = ?', [pathPart]);
		if (land.length === 0) {
			return json(
				{ success: false, error: `Land with path ${pathPart} not found` },
				{ status: 404 }
			);
		}
		path.push(land[0]);
	}

	const fee = await getFee(path);

	if (fee instanceof Response) {
		return fee;
	}

	return json({ success: true, path, fee });
};
