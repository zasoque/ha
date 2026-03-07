import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ params, fetch }) => {
	const { corporationId } = params;

	const members = await fetch(`/api/v1/corporations/${corporationId}`).then((res) => res.json());
	const corporation = await fetch(`/api/v1/people/${corporationId}`).then((res) => res.json());

	const { inventory } = await fetch(`/api/v1/inventory/users/${corporationId}`).then((res) =>
		res.json()
	);

	const { accounts } = await fetch(`/api/v1/accounts/corporations/${corporationId}`).then((res) =>
		res.json()
	);

	return {
		members: members.members,
		corporation: corporation.person,
		inventory,
		accounts
	};
};
