import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch, url }) => {
	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const limit = parseInt(url.searchParams.get('limit') || '50', 10);

	const people = await fetch(`/api/v1/admin/people?page=${page}&limit=${limit}`)
		.then((res) => res.json())
		.then((data) => data.people);

	for (const person of people) {
		if (!person.residence) {
			person.residence_building = {};
			person.residence_land = {};
			continue;
		}

		person.residence_building = await fetch(`/api/v1/maps/buildings/${person.residence}`)
			.then((res) => res.json())
			.then((data) => data.building);
		person.residence_land = await fetch(`/api/v1/maps/lands/${person.residence_building.land_id}`)
			.then((res) => res.json())
			.then((data) => data.land);
	}

	return { people, page, limit };
};
