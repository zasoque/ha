import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch, url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '50');

	const { mails } = await fetch(`/api/v1/mails/me?page=${page}&limit=${limit}`).then((res: any) =>
		res.json()
	);

	for (const mail of mails) {
		const { person } = await fetch(`/api/v1/people/${mail.sender}`).then((res) => res.json());
		mail.senderObject = person;
	}

	return { mails, page, limit };
};
