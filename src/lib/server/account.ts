import { query } from './db';

export async function getAccount(accountId: number): Promise<any> {
	const result = await query('SELECT * FROM accounts WHERE id = ?', [accountId]);
	return result[0];
}
