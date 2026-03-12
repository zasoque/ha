import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { getFee, sendFeeNotification } from '$lib/server/maps';
import { sendNotification } from '$lib/server/notification';
import { GOVERNMENT_ACCOUNT_ID } from '$lib/util/const';
import { formatCurrency } from '$lib/util/economy';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/transactions/transfer:
 *   post:
 *     summary: Transfer money between accounts.
 *     tags:
 *       - Transactions
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromAccountId
 *               - toAccountId
 *               - amount
 *               - path
 *             properties:
 *               fromAccountId:
 *                 type: integer
 *                 description: The ID of the account (starts from 1) to transfer money from.
 *               toAccountId:
 *                 type: integer
 *                 description: The ID of the account (starts from 1) to transfer money to.
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: The amount of money to transfer. Must be greater than zero.
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: An optional description for the transaction.
 *               path:
 *                 type: string
 *                 description: The path (land IDs separated by underscores) between the from account owner's residence and the to account owner's residence, used for fee calculation.
 *     responses:
 *       200:
 *         description: Transaction created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Transaction created successfully
 *       400:
 *         description: Bad request, missing required parameters, invalid amount, invalid path, or insufficient funds.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   examples:
 *                     missingParams:
 *                       value: "Missing required parameters"
 *                     invalidAmount:
 *                       value: "Amount must be greater than zero"
 *                     invalidPathStartOrEnd:
 *                       value: "Invalid path: start or end land not found"
 *                     invalidPathFromAccountResidence:
 *                       value: "Invalid path: from account owner residence is not located on the start land"
 *                     invalidPathToAccountResidence:
 *                       value: "Invalid path: to account owner residence is not located on the end land"
 *                     insufficientFunds:
 *                       value: "Insufficient funds in the from account"
 *       401:
 *         description: Unauthorized, no token found or invalid token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No token found
 *       404:
 *         description: From account not found, to account not found, or account owner not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   examples:
 *                     fromAccountNotFound:
 *                       value: "From account not found or does not belong to the user"
 *                     toAccountNotFound:
 *                       value: "To account not found"
 *                     accountOwnerNotFound:
 *                       value: "Invalid path: from or to account owner not found"
 *                     accountOwnerResidenceNotFound:
 *                       value: "Invalid path: from or to account owner residence not found"
 */
export const POST: RequestHandler = async ({ cookies, request }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'No token found' }, { status: 401 });
	}

	let { fromAccountId, toAccountId, amount, description, path } = await request.json();

	if (!fromAccountId || !toAccountId || !amount || !path) {
		return json({ success: false, message: 'Missing required parameters' }, { status: 400 });
	}

	if (amount <= 0) {
		return json({ success: false, message: 'Amount must be greater than zero' }, { status: 400 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Invalid token' }, { status: 401 });
	}

	let [fromAccount] = await query('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [
		fromAccountId,
		me.id
	]);

	if (!fromAccount) {
		[fromAccount] = await query(
			'SELECT a.* FROM accounts a JOIN corporation_members cm ON a.user_id = cm.corporation_id WHERE a.id = ? AND cm.user_id = ?',
			[fromAccountId, me.id]
		);
	}

	if (!fromAccount) {
		return json(
			{ success: false, message: 'From account not found or does not belong to the user' },
			{ status: 404 }
		);
	}

	// path 검증
	const landIds = path.split('-').map((id: string) => parseInt(id));
	const startLandId = landIds[0];
	const endLandId = landIds[landIds.length - 1];

	const startLand = await query('SELECT * FROM lands WHERE id = ?', [startLandId]);
	const endLand = await query('SELECT * FROM lands WHERE id = ?', [endLandId]);

	if (startLand.length === 0 || endLand.length === 0) {
		return json(
			{ success: false, message: 'Invalid path: start or end land not found' },
			{ status: 400 }
		);
	}

	const [toAccount] = await query('SELECT * FROM accounts WHERE id = ?', [toAccountId]);

	if (!toAccount) {
		return json({ success: false, message: 'To account not found' }, { status: 404 });
	}

	const fromAccountOwner = await query('SELECT * FROM people WHERE id = ?', [fromAccount.user_id]);
	const toAccountOwner = await query('SELECT * FROM people WHERE id = ?', [toAccount.user_id]);

	if (fromAccountOwner.length === 0 || toAccountOwner.length === 0) {
		return json(
			{ success: false, message: 'Invalid path: from or to account owner not found' },
			{ status: 400 }
		);
	}

	const fromAccountOwnerResidence = await query('SELECT * FROM buildings WHERE id = ?', [
		fromAccountOwner[0].residence
	]);
	const toAccountOwnerResidence = await query('SELECT * FROM buildings WHERE id = ?', [
		toAccountOwner[0].residence
	]);

	if (fromAccountOwnerResidence.length === 0 || toAccountOwnerResidence.length === 0) {
		return json(
			{ success: false, message: 'Invalid path: from or to account owner residence not found' },
			{ status: 400 }
		);
	}

	if (fromAccountOwnerResidence[0].land_id !== startLandId) {
		return json(
			{
				success: false,
				message: 'Invalid path: from account owner residence is not located on the start land'
			},
			{ status: 400 }
		);
	}

	if (toAccountOwnerResidence[0].land_id !== endLandId) {
		return json(
			{
				success: false,
				message: 'Invalid path: to account owner residence is not located on the end land'
			},
			{ status: 400 }
		);
	}
	// path 검증 끝

	const fee = await getFee(path);

	if (fee instanceof Response) {
		return fee;
	}

	if (fromAccount.balance < amount + fee) {
		return json(
			{ success: false, message: 'Insufficient funds in the from account' },
			{ status: 400 }
		);
	}

	await sendFeeNotification(path, fromAccountOwner[0].id);

	description = description || `${fromAccount.id}>${toAccount.id},${formatCurrency(amount)}`;

	await query(
		`INSERT INTO transactions (account_id, amount, type, description) VALUES (?, ?, ?, ?)`,
		[fromAccountId, -amount - fee, 'transfer', description || '']
	);
	await query(
		`INSERT INTO transactions (account_id, amount, type, description) VALUES (?, ?, ?, ?)`,
		[toAccountId, amount, 'transfer', description || '']
	);
	await query(`UPDATE accounts SET balance = balance - ? WHERE id = ?`, [
		amount + fee,
		parseInt(fromAccountId)
	]);
	await query(`UPDATE accounts SET balance = balance + ? WHERE id = ?`, [amount, toAccountId]);
	await query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [
		fee,
		GOVERNMENT_ACCOUNT_ID
	]);
	await sendNotification(
		toAccount.user_id,
		`계좌번호 ${toAccount.id}번으로 ${formatCurrency(amount)}원이 입금됐어. 현재 잔액은 ${formatCurrency(parseFloat(toAccount.balance) + parseFloat(amount))}원이야.`
	);

	return json({ success: true, message: 'Transaction created successfully' });
};
