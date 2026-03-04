import { query } from './db';

export async function sendNotification(userId: string, message: string) {
	await query('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [userId, message]);
}
