import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch }) => {
	const corporations = await fetch('/api/v1/corporations').then((res) => res.json());

	return {
		corporations: corporations.corporations
	};
};
