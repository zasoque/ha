import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch, url }) => {
	const page = url.searchParams.get('page') || '1';
	const limit = url.searchParams.get('limit') || '10';

	const people = await fetch(`/api/v1/admin/people?page=${page}&limit=${limit}`)
		.then((res) => res.json())
		.then((data) => data.people);

	return { people, page, limit };
};
