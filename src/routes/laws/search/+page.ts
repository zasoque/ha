import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ url, fetch }) => {
	const q = url.searchParams.get('q') || '';

	const { laws } = await fetch(`/api/v1/admin/laws/search?q=${encodeURIComponent(q)}`).then((res) =>
		res.json()
	);

	return {
		laws,
		q
	};
};
