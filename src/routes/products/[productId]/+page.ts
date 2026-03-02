import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ parent, fetch, params }) => {
	const productId = params.productId;

	const product = await fetch(`/api/v1/products/${productId}`).then((res) => res.json());

	if (!product.success) {
		return { product: null };
	}

	const mine = (await parent()).me === product.product.owner_id;

	return { product: product.product, mine };
};
