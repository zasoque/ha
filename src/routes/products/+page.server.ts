import { getUserName } from '$lib/server/people';
import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch, url }) => {
	const limit = url.searchParams.get('limit') || '20';
	const page = url.searchParams.get('page') || '1';

	const res = await fetch(`/api/v1/products?limit=${limit}&page=${page}`);
	const data = await res.json();

	if (!data.success) {
		return { products: [] };
	}

	for (const product of data.products) {
		product.owner_name = await getUserName(product.owner_id);
	}

	return { products: data.products };
};
