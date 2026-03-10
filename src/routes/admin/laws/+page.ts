import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch }) => {
	const { laws } = await fetch('/api/v1/admin/laws').then((res) => res.json());

	return {
		laws
	};
};
