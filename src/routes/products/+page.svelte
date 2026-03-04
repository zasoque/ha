<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import { formatCurrency } from '$lib/util/economy';
	import PromptFloat from '$lib/components/PromptFloat.svelte';

	const { data } = $props();
	const products = $derived(() => data.products);

	let newProductPrompt;
	let newName = $state('');
	let newDescription = $state('');
	let newPrice = $state('');

	async function newProduct() {
		const price = parseInt(newPrice, 10);
		if (isNaN(price)) {
			alert('유효한 가격을 입력해줘!');
			return;
		}

		await fetch('/api/v1/products', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ name: newName, description: newDescription, price })
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
	<button class="new-product" onclick={newProductPrompt.open}>새로운 상품 출품</button>
</Container>
<PromptFloat bind:this={newProductPrompt}>
	<div>상품 이름</div>
	<input type="text" bind:value={newName} placeholder="상품 이름을 입력하세요" />
	<div>상품 설명</div>
	<input type="text" bind:value={newDescription} placeholder="상품 설명을 입력하세요" />
	<div>상품 가격</div>
	<input type="text" bind:value={newPrice} placeholder="상품 가격을 입력하세요" />
	<button onclick={newProduct}>출품하기</button>
</PromptFloat>

<style>
	.description {
		margin-bottom: 1rem;
		color: #555;
	}

	.products {
		gap: 2rem;
		column-count: 3;
		margin-bottom: 2rem;
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

	@media (max-width: 768px) {
		.products {
			column-count: 1;
		}
	}
</style>
