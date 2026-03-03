import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch }) => {
	const inventory = await fetch('/api/v1/inventory').then((res) => res.json());

	if (!inventory.success) {
		return {
			inventory: []
		};
	}

	for (const item of inventory.inventory) {
		const itemData = await fetch(`/api/v1/items/${item.item_id}`).then((res) => res.json());
		item.item = itemData.item;
	}

	return {
		inventory: inventory.inventory
	};
};
