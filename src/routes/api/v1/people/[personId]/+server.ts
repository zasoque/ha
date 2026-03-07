import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const id = params.personId;

	if (!id) {
		return json({ success: false, error: 'User ID is required' }, { status: 400 });
	}

	const person = await query('SELECT id, name FROM people WHERE id = ?', [id]);

	if (person.length === 0) {
		return json({ success: false, error: 'User not found' }, { status: 404 });
	}

	return json({ success: true, person: person[0] });
};
