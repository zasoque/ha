import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch }) => {
	const users = await fetch('/api/v1/admin/users')
		.then((res) => res.json())
		.then((data) => data.users);

	return { users };
};
