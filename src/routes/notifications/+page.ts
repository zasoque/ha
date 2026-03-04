import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch }) => {
	const notifications = await fetch('/api/v1/notifications').then((res) => res.json());

	return {
		notifications: notifications.notifications
	};
};
