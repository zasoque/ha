import { parseLaw } from '$lib/util/law';
import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ params, fetch }) => {
	const { lawId, revisionId } = params;
	const { law } = await fetch(`/api/v1/admin/laws/${lawId}`).then((res) => res.json());

	const index = law.contents.findIndex((content: any) => content.id === parseInt(revisionId!));
	const lawJSON = parseLaw(law.contents[index].content);

	return {
		law,
		lawJSON,
		revisionId: parseInt(revisionId!),
		index: law.contents.length - index
	};
};
