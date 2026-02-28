import { getMe } from '$lib/discord/users';
import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ cookies }) => {
	const token = cookies.get('token');
	let me;
	if (token !== 'undefined' && token !== 'null' && !token) {
		me = await getMe(token);
	}

	return { me };
};
