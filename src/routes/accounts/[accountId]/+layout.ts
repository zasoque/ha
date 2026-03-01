import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ params, fetch }) => {
	const { accountId } = params;
	const res = await fetch(`/api/v1/accounts/${accountId}`).then((res) => res.json());

	return {
		account: res.account
	};
};
