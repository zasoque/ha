import { getMe } from '$lib/discord/users';
import { getAccount } from '$lib/server/account';
import { query } from '$lib/server/db';
import {
	TAINT_ITEM_ID,
	TYPE_FARM,
	TYPE_MARKET,
	TYPE_OFFICE,
	TYPE_RESIDENTIAL
} from '$lib/util/const';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const { landId } = params;

	const land = await query('SELECT * FROM lands WHERE id = ?', [landId]);

	if (land.length === 0) {
		return json({ success: false, message: 'Land not found' }, { status: 404 });
	}

	const buildings = await query('SELECT * FROM buildings WHERE land_id = ?', [landId]);

	return json({ success: true, land: land[0], buildings });
};

function taintCost(type: string): number {
	if (type === TYPE_RESIDENTIAL) {
		return 8;
	} else if (type === TYPE_OFFICE) {
		return 20;
	} else if (type === TYPE_MARKET) {
		return 10;
	} else if (type === TYPE_FARM) {
		return 5;
	}
	return Infinity;
}

export const POST: RequestHandler = async ({ params, request, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const { landId } = params;
	const owner_id = me.id;
	const { name, type, account_id } = await request.json();
	const land_id = landId;

	if (!name || !land_id || !type || !account_id) {
		return json({ success: false, message: 'Missing required fields' }, { status: 400 });
	}

	const account = await getAccount(account_id);

	if (account.user_id !== me.id) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const stock = await query('SELECT * FROM inventory WHERE user_id = ? AND item_id = ?', [
		owner_id,
		TAINT_ITEM_ID
	]);

	if (stock.length === 0 || stock[0].quantity < taintCost(type)) {
		return json({ success: false, message: 'Not enough taint in inventory' }, { status: 400 });
	}

	const alreadyBuildings = await query('SELECT * FROM buildings WHERE land_id = ?', [landId]);

	if (type === TYPE_FARM && alreadyBuildings.length > 0) {
		return json(
			{ success: false, message: 'Farm cannot be built on land with existing buildings' },
			{ status: 400 }
		);
	}

	if (type === TYPE_MARKET && alreadyBuildings.length > 0) {
		return json(
			{ success: false, message: 'Market cannot be built on land with existing buildings' },
			{ status: 400 }
		);
	}

	if (
		type === TYPE_OFFICE &&
		alreadyBuildings.length > 0 &&
		alreadyBuildings[alreadyBuildings.length - 1].type !== TYPE_OFFICE &&
		alreadyBuildings[alreadyBuildings.length - 1].type !== TYPE_MARKET
	) {
		return json(
			{
				success: false,
				message: 'Office can only be built on office or market building'
			},
			{ status: 400 }
		);
	}

	if (
		type === TYPE_RESIDENTIAL &&
		alreadyBuildings.length > 0 &&
		alreadyBuildings[alreadyBuildings.length - 1].type !== TYPE_RESIDENTIAL
	) {
		return json(
			{
				success: false,
				message:
					'Residential building can only be built on land with no existing buildings or with one existing residential building'
			},
			{ status: 400 }
		);
	}

	if (type === TYPE_RESIDENTIAL) {
		const residentialBuildingCost = Math.pow(alreadyBuildings.length + 1, 2) * 0.3;
		const account = await getAccount(account_id);
		if (account.balance < residentialBuildingCost) {
			return json(
				{ success: false, message: 'Not enough balance to build residential building' },
				{ status: 400 }
			);
		}

		await query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [
			residentialBuildingCost,
			account_id
		]);
		await query(
			"INSERT INTO transactions (account_id, amount, type, description) VALUES (?, ?, 'withdrawal', ?)",
			[
				account_id,
				residentialBuildingCost,
				`땅#${land_id} ${alreadyBuildings.length + 1}층 주거 증축세`
			]
		);
	}

	await query('UPDATE inventory SET quantity = quantity - ? WHERE user_id = ? AND item_id = ?', [
		taintCost(type),
		owner_id,
		TAINT_ITEM_ID
	]);
	await query('INSERT INTO buildings (name, owner_id, land_id, type) VALUES (?, ?, ?, ?)', [
		name,
		owner_id,
		land_id,
		type
	]);

	return json({ success: true, message: 'Building created successfully' });
};
