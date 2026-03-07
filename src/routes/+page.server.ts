import { getMe } from '$lib/discord/users';
import { getUserName } from '$lib/server/people';
import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch, cookies }) => {
	const token = cookies.get('token');
	let username;
	let residence;
	let land;

	if (token) {
		const me = await getMe(token);
		username = await getUserName(me.id);

		const residenceId = await fetch(`/api/v1/people/${me.id}`)
			.then((res) => res.json())
			.then((data) => data.person.residence);
		residence = residenceId
			? await fetch(`/api/v1/maps/buildings/${residenceId}`)
					.then((res) => res.json())
					.then((data) => data.building)
			: null;
		land = residence?.land_id
			? await fetch(`/api/v1/maps/lands/${residence.land_id}`)
					.then((res) => res.json())
					.then((data) => data.land)
			: null;
	}

	return {
		username,
		residence,
		land
	};
};
