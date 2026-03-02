import { query } from '$lib/server/db';
import { getMe } from '$lib/discord/users';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const productId = params.productId;

	const product = await query(`SELECT * FROM products WHERE id = ?`, [productId]);

	if (product.length === 0) {
		return json({ success: false, message: 'Product not found' }, { status: 404 });
	}

	return json({ success: true, product: product[0] });
};

export const PUT: RequestHandler = async ({ params, request, cookies }) => {
	const productId = params.productId;
	const { name, description, price } = await request.json();

	if (!name || !description || !price) {
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

	const product = await query(`SELECT * FROM products WHERE id = ?`, [productId]);

	if (product.length === 0) {
		return json({ success: false, message: 'Product not found' }, { status: 404 });
	}

	if (product[0].owner_id !== me.id) {
		return json({ success: false, message: 'Forbidden' }, { status: 403 });
	}

	await query(`UPDATE products SET name = ?, description = ?, price = ? WHERE id = ?`, [
		name,
		description,
		price,
		productId
	]);

	return json({ success: true, message: 'Product updated successfully' });
};

export const DELETE: RequestHandler = async ({ params, cookies }) => {
	const productId = params.productId;

	const token = cookies.get('token');
	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const product = await query(`SELECT * FROM products WHERE id = ?`, [productId]);

	if (product.length === 0) {
		return json({ success: false, message: 'Product not found' }, { status: 404 });
	}

	if (product[0].owner_id !== me.id) {
		return json({ success: false, message: 'Forbidden' }, { status: 403 });
	}

	await query(`DELETE FROM products WHERE id = ?`, [productId]);

	return json({ success: true, message: 'Product deleted successfully' });
};
