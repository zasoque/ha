import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch, url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '50');

	const { certificates } = await fetch(
		`/api/v1/admin/certificates?page=${page}&limit=${limit}`
	).then((res) => res.json());

	return {
		certificates
	};
};
