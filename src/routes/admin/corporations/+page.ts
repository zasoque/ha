import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch, url }) => {
	const page = url.searchParams.get('page') || '1';
	const limit = url.searchParams.get('limit') || '50';

	const res = await fetch(`/api/v1/admin/corporations?page=${page}&limit=${limit}`).then((res) =>
		res.json()
	);

	for (const member of res.corporationmembers) {
		member.user = (
			await fetch(`/api/v1/admin/people/${member.user_id}`).then((res) => res.json())
		).person;
		member.corporation = (
			await fetch(`/api/v1/admin/people/${member.corporation_id}`).then((res) => res.json())
		).person;
	}

	return {
		corporationmembers: res.corporationmembers,
		page: parseInt(page),
		limit: parseInt(limit)
	};
};
