import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const productId = params.productId;

	const product = await query(`SELECT * FROM products WHERE id = ?`, [productId]);

	if (product.length === 0) {
		return json({ success: false, message: 'Product not found' }, { status: 404 });
	}

	return json({ success: true, product: product[0] });
};
