import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch, params }) => {
	const { lawId } = params;

	const { law } = await fetch(`/api/v1/admin/laws/${lawId}`).then((res) => res.json());

	return {
		law
	};
};
