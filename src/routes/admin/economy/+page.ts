import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch }) => {
	const response = await fetch('/api/v1/admin/economy/taintfee');
	const data = await response.json();

	return {
		taintFee: data.fee
	};
};
