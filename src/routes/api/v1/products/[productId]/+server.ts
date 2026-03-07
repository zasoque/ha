import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/products/{productId}:
 *   get:
 *     summary: Retrieve a specific product by ID.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: The ID of the product (starts from 1) to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Details of the specified product.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     item_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: number
 *                       format: float
 *                     description:
 *                       type: string
 *                     owner_id:
 *                       type: string
 *                       description: The Discord ID of the product owner.
 *                     market_id:
 *                       type: integer
 *                     account_id:
 *                       type: integer
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Product not found.
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
 *                   example: Product not found
 */
export const GET: RequestHandler = async ({ params }) => {
	const productId = params.productId;

	const product = await query(`SELECT * FROM products WHERE id = ?`, [productId]);

	if (product.length === 0) {
		return json({ success: false, message: 'Product not found' }, { status: 404 });
	}

	return json({ success: true, product: product[0] });
};