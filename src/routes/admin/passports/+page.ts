import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch }) => {
	const { passports } = await fetch('/api/v1/admin/passports').then((res) => res.json());

	return {
		passports
	};
};
