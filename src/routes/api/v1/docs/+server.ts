import { swaggerSpec } from '$lib/swagger';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	return json(swaggerSpec);
};
