import { getUserName } from '$lib/server/people';
import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ url, fetch }) => {
	const page = url.searchParams.get('page') || '1';
	const limit = url.searchParams.get('limit') || '50';

	const items = await fetch(`/api/v1/items?page=${page}&limit=${limit}`).then((res) => res.json());

	if (!items.success) {
		return {
			items: []
		};
	}

	for (const item of items.items) {
		item.maker_name = await getUserName(item.maker);
	}

	return {
		items: items.items,
		page: parseInt(page),
		limit: parseInt(limit)
	};
};
