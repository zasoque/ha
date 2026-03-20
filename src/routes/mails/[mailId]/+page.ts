import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ params, fetch }) => {
	const mailId = params.mailId;

	const { mail } = await fetch(`/api/v1/mails/${mailId}`).then((res: any) => res.json());

	const sender = await fetch(`/api/v1/people/${mail.sender}`).then((res: any) => res.json());

	const recipient = await fetch(`/api/v1/people/${mail.recipient}`).then((res: any) => res.json());

	return { mail, sender: sender.person, recipient: recipient.person };
};
