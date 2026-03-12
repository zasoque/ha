import { getMe } from '$lib/discord/users';
import { getAccount } from '$lib/server/account';
import { query } from '$lib/server/db';
import { getFee, sendFeeNotification } from '$lib/server/maps';
import { GOVERNMENT_ACCOUNT_ID, TYPE_MARKET } from '$lib/util/const';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Retrieve a paginated list of products.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: The number of items to return per page.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve.
 *     responses:
 *       200:
 *         description: A paginated list of products.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       item_id:
 *                         type: integer
 *                       quantity:
 *                         type: integer
 *                       price:
 *                         type: number
 *                         format: float
 *                       description:
 *                         type: string
 *                       owner_id:
 *                         type: string
 *                         description: The Discord ID of the product owner.
 *                       market_id:
 *                         type: integer
 *                       account_id:
 *                         type: integer
 *                       created_at:
 *                         type: string
 *                         format: date-time
 */
export const GET: RequestHandler = async ({ url }) => {
	const limit = url.searchParams.get('limit') || '20';
	const page = url.searchParams.get('page') || '1';

	const products = await query('SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?', [
		parseInt(limit),
		(parseInt(page) - 1) * parseInt(limit)
	]);

	return json({ success: true, products });
};

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create a new product listing.
 *     tags:
 *       - Products
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - item_id
 *               - count
 *               - price
 *               - market_id
 *               - path
 *               - account_id
 *             properties:
 *               item_id:
 *                 type: integer
 *                 description: The ID of the item (starts from 1) to list as a product.
 *               count:
 *                 type: integer
 *                 description: The quantity of the item to list.
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: A description for the product listing.
 *               price:
 *                 type: number
 *                 format: float
 *                 description: The price of the product.
 *               market_id:
 *                 type: integer
 *                 description: The ID of the market (starts from 1) where the product will be listed.
 *               path:
 *                 type: string
 *                 description: The path (land IDs separated by underscores) from the owner's residence to the market.
 *               account_id:
 *                 type: integer
 *                 description: The account ID (starts from 1) from which the listing fee will be deducted.
 *     responses:
 *       200:
 *         description: Product created successfully.
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
 *                   example: Product created successfully
 *       400:
 *         description: Bad request, missing required fields, invalid market, invalid path, not enough stock, or not enough balance.
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
 *                     missingFields:
 *                       value: "Missing required fields"
 *                     invalidMarket:
 *                       value: "Invalid market"
 *                     invalidPathStart:
 *                       value: "Invalid path start"
 *                     invalidPathEnd:
 *                       value: "Invalid path end"
 *                     notEnoughStock:
 *                       value: "Not enough stock"
 *                     notEnoughBalance:
 *                       value: "Not enough balance to cover the fee"
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
 *                   example: Unauthorized
 *       404:
 *         description: Market, person, residence, residence land, market building, market land, or account not found.
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
 *                     marketNotFound:
 *                       value: "Market not found"
 *                     personNotFound:
 *                       value: "Person not found"
 *                     residenceNotFound:
 *                       value: "Residence not found"
 *                     residenceLandNotFound:
 *                       value: "Residence land not found"
 *                     marketBuildingNotFound:
 *                       value: "Market building not found"
 *                     marketLandNotFound:
 *                       value: "Market land not found"
 *                     accountNotFound:
 *                       value: "Account not found"
 */
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

	let sellerId = me.id;

	const isValidAccount = await query(`SELECT * FROM accounts WHERE id = ? AND user_id = ?`, [
		account_id,
		sellerId
	]);

	if (isValidAccount.length === 0) {
		// assert that the seller is a corporation
		const corporationMemberRelation = await query(
			'SELECT cm.* FROM corporation_members cm JOIN accounts a ON cm.corporation_id = a.user_id WHERE a.id = ? AND cm.user_id = ?',
			[account_id, sellerId]
		);

		if (corporationMemberRelation.length === 0) {
			return json({ success: false, message: 'Unauthorized' }, { status: 401 });
		}

		const corporation = await query('SELECT * FROM people WHERE id = ?', [
			corporationMemberRelation[0].corporation_id
		]);

		sellerId = corporation[0].id;
	}

	// path 검증
	const pathIds = path.split('-').map((id: string) => {
		return { id: parseInt(id) };
	});

	const [mePerson] = await query('SELECT * FROM people WHERE id = ?', [sellerId]);
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
		sellerId
	]);
	if (!stock || stock.quantity < count) {
		return json({ success: false, message: 'Not enough stock' }, { status: 400 });
	}

	if (stock.count === count) {
		await query('DELETE FROM inventory WHERE item_id = ? AND user_id = ?', [item_id, sellerId]);
	} else {
		await query('UPDATE inventory SET quantity = quantity - ? WHERE item_id = ? AND user_id = ?', [
			count,
			item_id,
			sellerId
		]);
	}

	const account = await getAccount(account_id);
	if (!account) {
		return json({ success: false, message: 'Account not found' }, { status: 404 });
	}

	if (account.user_id !== sellerId) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	if (account.balance < fee) {
		return json(
			{ success: false, message: 'Not enough balance to cover the fee' },
			{ status: 400 }
		);
	}

	await sendFeeNotification(path, sellerId);

	await query(
		'INSERT INTO transactions (account_id, amount, type, description) VALUES (?, ?, ?, ?)',
		[account_id, fee, 'withdrawal', `"${item_id}" 출품을 위한 운송비`]
	);
	await query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [fee, account_id]);
	await query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [
		fee,
		GOVERNMENT_ACCOUNT_ID
	]);
	await query(
		'INSERT INTO products (item_id, quantity, price, description, owner_id, market_id, account_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
		[item_id, count, price, description, sellerId, market_id, account_id]
	);

	return json({ success: true, message: 'Product created successfully' });
};
