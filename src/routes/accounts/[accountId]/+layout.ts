import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ url, params, fetch }) => {
	const { accountId } = params;
	const { account } = await fetch(`/api/v1/accounts/${accountId}`).then((res) => res.json());

	const page = url.searchParams.get('page') || '1';
	const limit = url.searchParams.get('limit') || '50';
	const { transactions } = await fetch(
		`/api/v1/transactions/accounts/${accountId}?page=${page}&limit=${limit}`
	).then((res) => res.json());

	return { account, transactions };
};
