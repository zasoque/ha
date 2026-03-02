import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch }) => {
	const visas = await fetch(`/api/v1/admin/visas`)
		.then((res) => res.json())
		.then((data) => data.visas);

	return { visas };
};
