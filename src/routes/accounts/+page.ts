import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch }) => {
	const res = await fetch('/api/v1/accounts').then((res) => res.json());

	let accounts;
	if (!res.success) {
		accounts = [];
	} else {
		accounts = res.accounts;
	}

	return { accounts };
};
