import { getUserName } from '$lib/server/people';
import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ parent, fetch, params }) => {
	const productId = params.productId;

	const product = await fetch(`/api/v1/products/${productId}`).then((res) => res.json());

	if (!product.success) {
		return { product: null };
	}

	const mine = (await parent()).me === product.product.owner_id;

	product.product.owner_name = await getUserName(product.product.owner_id);

	product.product.item = await fetch(`/api/v1/items/${product.product.item_id}`)
		.then((res) => res.json())
		.then((res) => {
			if (res.success) {
				return res.item;
			} else {
				return null;
			}
		});

	return { product: product.product, mine };
};
