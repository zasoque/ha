import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch }) => {
	const lands = await fetch('/api/v1/maps/lands').then((res) => res.json());
	const buildings = await fetch('/api/v1/maps/buildings').then((res) => res.json());
	const roads = await fetch('/api/v1/maps/roads').then((res) => res.json());
	const rails = await fetch('/api/v1/maps/rails').then((res) => res.json());

	return {
		lands: lands.lands,
		buildings: buildings.buildings,
		roads: roads.roads,
		rails: rails.rails
	};
};
