import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch, url, cookies }) => {
	const limit = url.searchParams.get('limit') || '20';
	const page = url.searchParams.get('page') || '1';

	const res = await fetch(`/api/v1/products?limit=${limit}&page=${page}`);
	const data = await res.json();

	if (!data.success) {
		return { products: [] };
	}

	return { products: data.products };
};
