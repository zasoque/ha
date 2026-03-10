import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch, params }) => {
	const { lawName } = params;

	const { law } = await fetch(`/api/v1/admin/laws/${lawName}`).then((res) => res.json());

	return {
		law
	};
};
