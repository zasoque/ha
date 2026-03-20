import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch, cookies }) => {
	const token = cookies.get('token');

	let me;
	if (token) {
		me = await getMe(token);
	}

	const { notifications } = await fetch('/api/v1/notifications').then((res) => res.json());

	const { certificates } = await fetch(`/api/v1/certificates/person/${me?.id}`).then((res) =>
		res.json()
	);

	const { unreadcount } = await fetch('/api/v1/mails/me/unreadcount')
		.then((res) => res.json())
		.then((data) => data);

	return { me, isAdmin: await isAdmin(me?.id || ''), notifications, certificates, unreadcount };
};
