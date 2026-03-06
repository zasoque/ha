import { getMe } from '$lib/discord/users';
import { getAccount } from '$lib/server/account';
import { query } from '$lib/server/db';
import { getFee } from '$lib/server/maps';
import { TYPE_MARKET } from '$lib/util/const';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const limit = url.searchParams.get('limit') || '20';
	const page = url.searchParams.get('page') || '1';

	const products = await query('SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?', [
		parseInt(limit),
		(parseInt(page) - 1) * parseInt(limit)
	]);

	return json({ success: true, products });
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { item_id, count, description, price, market_id, path, account_id } = await request.json();

	if (!item_id || !count || !price || !market_id || !path || !account_id) {
		return json({ success: false, message: 'Missing required fields' }, { status: 400 });
	}

	const token = cookies.get('token');
	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const market = await query('SELECT * FROM buildings WHERE id = ?', [market_id]);

	if (market.length === 0) {
		return json({ success: false, message: 'Market not found' }, { status: 404 });
	}

	if (market[0].type !== TYPE_MARKET) {
		return json({ success: false, message: 'Invalid market' }, { status: 400 });
	}

	// path 검증
	const pathIds = path.split('_').map((id: string) => {
		return { id: parseInt(id) };
	});

	const [mePerson] = await query('SELECT * FROM people WHERE id = ?', [me.id]);
	if (!mePerson) {
		return json({ success: false, message: 'Person not found' }, { status: 404 });
	}

	const [mePersonResidence] = await query('SELECT * FROM buildings WHERE id = ?', [
		mePerson.residence
	]);
	if (!mePersonResidence) {
		return json({ success: false, message: 'Residence not found' }, { status: 404 });
	}

	const [mePersonResidenceLand] = await query('SELECT * FROM lands WHERE id = ?', [
		mePersonResidence.land_id
	]);
	if (!mePersonResidenceLand) {
		return json({ success: false, message: 'Residence land not found' }, { status: 404 });
	}

	const [marketBuilding] = await query('SELECT * FROM buildings WHERE id = ?', [market_id]);
	if (!marketBuilding) {
		return json({ success: false, message: 'Market building not found' }, { status: 404 });
	}

	const [marketLand] = await query('SELECT * FROM lands WHERE id = ?', [marketBuilding.land_id]);
	if (!marketLand) {
		return json({ success: false, message: 'Market land not found' }, { status: 404 });
	}

	if (pathIds[0].id !== mePersonResidenceLand.id) {
		return json({ success: false, message: 'Invalid path start' }, { status: 400 });
	}

	if (pathIds[pathIds.length - 1].id !== marketLand.id) {
		return json({ success: false, message: 'Invalid path end' }, { status: 400 });
	}
	// path 검증 끝

	const fee = await getFee(path);

	if (fee instanceof Response) {
		return fee;
	}

	const [stock] = await query('SELECT * FROM inventory WHERE item_id = ? AND user_id = ?', [
		item_id,
		me.id
	]);
	if (!stock || stock.quantity < count) {
		return json({ success: false, message: 'Not enough stock' }, { status: 400 });
	}

	if (stock.count === count) {
		await query('DELETE FROM inventory WHERE item_id = ? AND user_id = ?', [item_id, me.id]);
	} else {
		await query('UPDATE inventory SET quantity = quantity - ? WHERE item_id = ? AND user_id = ?', [
			count,
			item_id,
			me.id
		]);
	}

	const account = await getAccount(account_id);
	if (!account) {
		return json({ success: false, message: 'Account not found' }, { status: 404 });
	}

	if (account.owner_id !== me.id) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	if (account.balance < fee) {
		return json(
			{ success: false, message: 'Not enough balance to cover the fee' },
			{ status: 400 }
		);
	}

	await query(
		'INSERT INTO transactions (account_id, amount, type, description) VALUES (?, ?, ?, ?)',
		[account_id, fee, 'withdrawal', `"${item_id}" 출품을 위한 운송비`]
	);
	await query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [fee, account_id]);
	await query(
		'INSERT INTO products (item_id, quantity, price, description, owner_id, market_id) VALUES (?, ?, ?, ?, ?, ?)',
		[item_id, count, price, description, me.id, market_id]
	);

	return json({ success: true, message: 'Product created successfully' });
};
