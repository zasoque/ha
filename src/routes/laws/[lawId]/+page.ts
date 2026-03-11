import { parseLaw } from '$lib/util/law';
import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ params, fetch }) => {
	const { lawId } = params;
	const { law } = await fetch(`/api/v1/admin/laws/${lawId}`).then((res) => res.json());

	const lawJSON = parseLaw(law.contents[0].content);

	return {
		law,
		lawJSON
	};
};
