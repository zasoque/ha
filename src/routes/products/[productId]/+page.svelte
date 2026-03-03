<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import { formatCurrency } from '$lib/util/economy';

	const { data } = $props();
	const { product, me } = data;

	function editProduct() {
		let name = prompt('바꿀 상품 이름이 뭐야?', product.name);
		if (name === null) return;
		let description = prompt('바꿀 상품 설명을 입력해줘.', product.description);
		if (description === null) return;
		let priceStr = prompt('바꿀 상품 가격을 냥 단위로 입력해줘.', product.price.toString());
		if (priceStr === null) return;

		const price = parseFloat(priceStr);

		if (isNaN(price)) {
			alert('유효한 가격을 입력해줘!');
			return;
		}

		fetch(`/api/v1/products/${product.id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ name, description, price })
		}).then(() => location.reload());
	}

	function deleteProduct() {
		if (!confirm('정말 이 상품을 삭제할래?')) return;

		fetch(`/api/v1/products/${product.id}`, {
			method: 'DELETE'
		}).then(() => (location.href = '/products'));
	}
</script>

<Container>
	<div class="back"><a href="/products">뒤로 가기</a></div>
	<Title>상품 상세</Title>
	<div class="name">{product.name}</div>
	<div class="description">{product.description}</div>
	<div class="price">{formatCurrency(product.price)}</div>
	<div class="owner">판매자: {product.owner_name}</div>
	<div class="buttons">
		{#if me.id === product.owner_id}
			<button class="edit-product" onclick={editProduct}>상품 수정</button>
			<button class="delete-product" onclick={deleteProduct}>상품 삭제</button>
		{/if}
	</div>
</Container>

<style>
	.container {
		max-width: var(--max-width);
		margin: 0 auto;
		padding: 2rem;
	}

	.back {
		color: #007bff;
		cursor: pointer;
		margin-bottom: 1rem;
	}

	.back a {
		text-decoration: none;
		color: inherit;
	}

	.title {
		font-size: 1.5rem;
		font-weight: bold;
		margin-bottom: 1rem;
	}

	.name {
		font-size: 1.2rem;
		font-weight: bold;
		margin-bottom: 0.5rem;
	}

	.description {
		margin-bottom: 1rem;
		color: #555;
	}

	.price {
		font-size: 1.2rem;
		color: #333;
		margin-bottom: 0.5rem;
	}

	.owner {
		font-size: 0.9rem;
		color: #777;
	}

	.buttons {
		margin-top: 1rem;
	}

	.buttons button {
		margin-right: 0.5rem;
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
</style>
