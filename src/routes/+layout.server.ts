import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const token = cookies.get('token');

	let me;
	if (!(!token || token === 'undefined')) {
		me = await getMe(token);
	}

	return { me, isAdmin: await isAdmin(me?.id || '') };
};
