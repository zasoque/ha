import { json } from '@sveltejs/kit';
import { query } from './db';

export async function getFee(path: any[]): Promise<number | Response> {
	let previousWasRoad = true;
	let buffer = 0;
	let fee = 0;
	for (let i = 0; i < path.length - 1; i++) {
		const roads = await query(
			'SELECT * FROM roads WHERE land_a_id = ? AND land_b_id = ? OR land_a_id = ? AND land_b_id = ?',
			[path[i].id, path[i + 1].id, path[i + 1].id, path[i].id]
		);
		const rails = await query(
			'SELECT * FROM rails WHERE land_a_id = ? AND land_b_id = ? OR land_a_id = ? AND land_b_id = ?',
			[path[i].id, path[i + 1].id, path[i + 1].id, path[i].id]
		);

		if (roads.length === 0 && rails.length === 0) {
			if (previousWasRoad) {
				return json(
					{
						success: false,
						error: `No road or rail between land ${path[i].id} and land ${path[i + 1].id}`
					},
					{ status: 404 }
				);
			}
		}

		const isRoad = roads.length > 0;

		if (isRoad) {
			const road = roads[0];
			const distance = Math.hypot(
				road.line.coordinates[0][0] - road.line.coordinates[1][0],
				road.line.coordinates[0][1] - road.line.coordinates[1][1]
			);

			if (!previousWasRoad) {
				fee += Math.ceil(buffer / 3) / 100;
				buffer = 0;
			}
			buffer += distance;
			previousWasRoad = true;
		} else {
			const distance = Math.hypot(
				path[i].position.coordinates[0] - path[i + 1].position.coordinates[0],
				path[i].position.coordinates[1] - path[i + 1].position.coordinates[1]
			);

			if (previousWasRoad) {
				fee += Math.ceil(Math.pow(buffer, 2) / 200) / 100;
				buffer = 0;
			}
			buffer += distance;
			previousWasRoad = false;
		}
	}

	if (buffer > 0) {
		if (previousWasRoad) {
			fee += Math.ceil(Math.pow(buffer, 2) / 200) / 100;
		} else {
			fee += Math.ceil(buffer / 3) / 100;
		}
	}

	return fee;
}
