import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ cookies }) => {
	const token = cookies.get('token');

	let me;
	if (!(!token || token === 'undefined')) {
		me = await getMe(token);
	}

	return { me, isAdmin: await isAdmin(me?.id || '') };
};
