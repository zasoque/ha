import { query } from '$lib/server/db';
import { getFee } from '$lib/server/maps';
import { json, type RequestHandler } from '@sveltejs/kit';
import { formatCurrency } from '$lib/util/economy';
import { getMe } from '$lib/discord/users';
import { GOVERNMENT_ACCOUNT_ID } from '$lib/util/const';

/**
 * @swagger
 * /api/v1/products/{productId}/buy:
 *   post:
 *     summary: Purchase a product.
 *     tags:
 *       - Products
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: The ID of the product (starts from 1) to purchase.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account_id
 *               - count
 *               - path
 *             properties:
 *               account_id:
 *                 type: integer
 *                 description: The account ID (starts from 1) to use for the purchase.
 *               count:
 *                 type: integer
 *                 description: The quantity of the product to purchase.
 *               path:
 *                 type: string
 *                 description: The path (land IDs separated by underscores) from the buyer's residence to the market.
 *     responses:
 *       200:
 *         description: Purchase successful.
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
 *                   example: Purchase successful
 *       400:
 *         description: Bad request, missing required fields, invalid path, not enough products in stock, or not enough balance.
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
 *                     invalidPath:
 *                       value: "Invalid path"
 *                     pathStartError:
 *                       value: "Buyer must start from their residence land"
 *                     pathEndError:
 *                       value: "Buyer must end at the market land"
 *                     notEnoughStock:
 *                       value: "Not enough products in stock"
 *                     notEnoughBalance:
 *                       value: "Not enough balance"
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
 *         description: Product, buyer residence land, or market land not found.
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
 *                     productNotFound:
 *                       value: "Product not found"
 *                     buyerResidenceLandNotFound:
 *                       value: "Buyer residence land not found"
 *                     marketLandNotFound:
 *                       value: "Market land not found"
 */
export const POST: RequestHandler = async ({ params, request, cookies }) => {
	const token = cookies.get('token');
	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const { productId } = params;

	const { account_id, count, path } = await request.json();

	if (!account_id || !count || !path) {
		return json({ success: false, message: 'Missing required fields' }, { status: 400 });
	}

	let buyer_id = me.id;
	const isValidAccount = await query(`SELECT * FROM accounts WHERE id = ? AND user_id = ?`, [
		account_id,
		buyer_id
	]);

	if (isValidAccount.length === 0) {
		// assert that the buyer is a corporation
		const corporationMemberRelation = await query(
			'SELECT cm.* FROM corporation_members cm JOIN accounts a ON cm.corporation_id = a.user_id WHERE a.id = ? AND cm.user_id = ?',
			[account_id, buyer_id]
		);

		if (corporationMemberRelation.length === 0) {
			return json({ success: false, message: 'Unauthorized' }, { status: 401 });
		}

		const corporation = await query('SELECT * FROM people WHERE id = ?', [
			corporationMemberRelation[0].corporation_id
		]);

		buyer_id = corporation[0].id;
	} else {
		if (buyer_id !== me.id) {
			return json({ success: false, message: 'Unauthorized' }, { status: 401 });
		}
	}

	const [product] = await query(`SELECT * FROM products WHERE id = ?`, [productId]);

	if (!product) {
		return json({ success: false, message: 'Product not found' }, { status: 404 });
	}

	const pathIds = path.split('-').map((id: string) => parseInt(id));
	const [startLand] = await query(`SELECT * FROM lands WHERE id = ?`, [pathIds[0]]);
	const [endLand] = await query(`SELECT * FROM lands WHERE id = ?`, [pathIds[pathIds.length - 1]]);

	if (!startLand || !endLand) {
		return json({ success: false, message: 'Invalid path' }, { status: 400 });
	}

	const [buyer] = await query(`SELECT * FROM people WHERE id = ?`, [buyer_id]);
	const [buyerResidence] = await query(`SELECT * FROM buildings WHERE id = ?`, [buyer.residence]);
	const [buyerResidenceLand] = await query(`SELECT * FROM lands WHERE id = ?`, [
		buyerResidence.land_id
	]);

	if (!buyerResidenceLand) {
		return json({ success: false, message: 'Buyer residence land not found' }, { status: 404 });
	}

	if (buyerResidenceLand.id !== startLand.id) {
		return json(
			{ success: false, message: 'Buyer must start from their residence land' },
			{ status: 400 }
		);
	}

	const [market] = await query(`SELECT * FROM buildings WHERE id = ?`, [product.market_id]);
	const [marketLand] = await query(`SELECT * FROM lands WHERE id = ?`, [market.land_id]);

	if (!marketLand) {
		return json({ success: false, message: 'Market land not found' }, { status: 404 });
	}

	if (marketLand.id !== endLand.id) {
		return json({ success: false, message: 'Buyer must end at the market land' }, { status: 400 });
	}

	const fee = await getFee(path);

	if (fee instanceof Response) {
		return fee;
	}

	if (product.quantity < count) {
		return json({ success: false, message: 'Not enough products in stock' }, { status: 400 });
	}

	const totalPrice = product.price * count + fee;

	const [account] = await query(`SELECT * FROM accounts WHERE id = ? AND user_id = ?`, [
		account_id,
		buyer_id
	]);

	if (account.balance < totalPrice) {
		return json({ success: false, message: 'Not enough balance' }, { status: 400 });
	}

	const [productItem] = await query(`SELECT * FROM items WHERE id = ?`, [product.item_id]);

	await query(`UPDATE accounts SET balance = balance - ? WHERE id = ?`, [totalPrice, account_id]);
	await query(`UPDATE accounts SET balance = balance + ? WHERE id = ?`, [
		product.price * count,
		product.account_id
	]);
	await query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [
		fee,
		GOVERNMENT_ACCOUNT_ID
	]);
	await query(
		'INSERT INTO transactions (account_id, amount, type, description) VALUES (?, ?, ?, ?)',
		[
			account_id,
			totalPrice,
			'withdrawal',
			`"${productItem.name}" 구매 (수량: ${count}, 상품 ID: ${product.id})`
		]
	);
	await query(
		'INSERT INTO transactions (account_id, amount, type, description) VALUES (?, ?, ?, ?)',
		[
			product.account_id,
			product.price * count,
			'deposit',
			`"${productItem.name}" 판매 (수량: ${count}, 상품 ID: ${product.id})`
		]
	);
	await query('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [
		product.owner_id,
		`${market.name}에서 ${productItem.name} ${count}개가 판매되었습니다. ${formatCurrency(product.price * count)}을 획득하였습니다.`
	]);

	if (product.quantity === count) {
		await query(`DELETE FROM products WHERE id = ?`, [productId]);
	} else {
		await query(`UPDATE products SET quantity = quantity - ? WHERE id = ?`, [count, productId]);
	}

	const [buyerStock] = await query(`SELECT * FROM inventory WHERE user_id = ? AND item_id = ?`, [
		buyer_id,
		product.item_id
	]);

	if (buyerStock) {
		await query(`UPDATE inventory SET quantity = quantity + ? WHERE id = ?`, [
			count,
			buyerStock.id
		]);
	} else {
		await query(`INSERT INTO inventory (user_id, item_id, quantity) VALUES (?, ?, ?)`, [
			buyer_id,
			product.item_id,
			count
		]);
	}

	return json({ success: true, message: 'Purchase successful' });
};
