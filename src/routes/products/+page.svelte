<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import { formatCurrency } from '$lib/util/economy';

	const { data } = $props();
	const products = $derived(() => data.products);

	async function newProduct() {
		const name = prompt('상품 이름이 뭐야?');
		if (!name) return;

		const description = prompt('상품 설명을 입력해줘.');
		if (!description) return;

		const priceStr = prompt('상품 가격을 냥 단위로 입력해줘.');
		if (!priceStr) return;
		const price = parseInt(priceStr);
		if (isNaN(price)) {
			alert('유효한 가격을 입력해줘!');
			return;
		}

		await fetch('/api/v1/products', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ name, description, price })
		});

		location.reload();
	}
</script>

<Container>
	<Title>시장</Title>
	<div class="description">
		이 시장은 중개의 대상이 되고, 실제 거래는 본인과 직접 만나서 하기를 바라.
	</div>
	<div class="description">
		이 거래에서 발생하는 일련의 피해에 대해서는 하은행에서 책임지지 않으니 주의해!
	</div>
	<div class="products">
		{#each products() as product}
			<a class="product" href="/products/{product.id}">
				<div class="product-name">{product.name}</div>
				<div class="product-description">{product.description}</div>
				<div class="product-price">{formatCurrency(product.price)}</div>
				<div class="product-owner">{product.owner_name}</div>
			</a>
		{/each}
	</div>
	<button class="new-product" onclick={newProduct}>새로운 상품 출품</button>
</Container>

<style>
	.description {
		margin-bottom: 1rem;
		color: #555;
	}

	.products {
		gap: 2rem;
		column-count: 3;
	}

	.product {
		text-decoration: none;
		color: black;
		display: block;
		padding: 1rem;
		border: 1px solid #e0e0e0;
		border-radius: 4px;
		break-inside: avoid;
	}

	.product-name {
		font-size: 1.2rem;
		font-weight: bold;
		margin-bottom: 0.5rem;
	}

	.product-description {
		margin-bottom: 0.5rem;
		color: #555;
	}

	.product-price {
		font-weight: bold;
		color: #007bff;
	}

	.product-owner {
		margin-top: 0.5rem;
		font-size: 0.9rem;
		color: #888;
	}

	button {
		margin-top: 2rem;
		padding: 0.5rem 1rem;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button:hover {
		background-color: #0056b3;
	}

	@media (max-width: 768px) {
		.products {
			column-count: 1;
		}
	}
</style>
