import { getMe } from '$lib/discord/users';
import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ cookies }) => {
	const token = cookies.get('token');
	const me = await getMe(token);

	return { me };
};
