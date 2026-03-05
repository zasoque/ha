import { getUserName } from '$lib/server/people';
import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch }) => {
	const lands = await fetch('/api/v1/maps/lands').then((res) => res.json());
	const buildings = await fetch('/api/v1/maps/buildings').then((res) => res.json());
	const roads = await fetch('/api/v1/maps/roads').then((res) => res.json());
	const rails = await fetch('/api/v1/maps/rails').then((res) => res.json());

	for (const land of lands.lands) {
		land.owner = await getUserName(land.owner_id);
	}

	for (const road of roads.roads) {
		road.owner = await getUserName(road.owner_id);
		road.land_a = lands.lands.find((land: any) => land.id === road.land_a_id);
		road.land_b = lands.lands.find((land: any) => land.id === road.land_b_id);
	}

	return {
		lands: lands.lands,
		buildings: buildings.buildings,
		roads: roads.roads,
		rails: rails.rails
	};
};
