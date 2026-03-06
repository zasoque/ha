import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch, cookies }) => {
	const token = cookies.get('token');

	let me;
	if (!(!token || token === 'undefined')) {
		me = await getMe(token);
	}

	const notifications = await fetch('/api/v1/notifications').then((res) => res.json());

	return { me, isAdmin: await isAdmin(me?.id || ''), notifications: notifications.notifications };
};
