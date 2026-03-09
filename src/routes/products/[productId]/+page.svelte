<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import { formatCurrency } from '$lib/util/economy';
	import PromptFloat from '$lib/components/PromptFloat.svelte';
	import AccountInput from '$lib/components/aci/AccountInput.svelte';

	const { data } = $props();
	const product = $derived(() => data.product);
	const me = $derived(() => data.me);

	let buyPrompt = $state()! as PromptFloat;
	let buyPromptQuantity = $state(1);
	let buyPromptAccount = $state(0);
	let buyPromptPath = $state('');

	async function buy() {
		await fetch(`/api/v1/products/${product().id}/buy`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				count: buyPromptQuantity,
				account_id: buyPromptAccount,
				path: buyPromptPath
			})
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					location.href = '/products';
				} else {
					alert('구매에 실패했습니다: ' + data.message);
				}
			})
			.catch((err) => {
				alert('구매 중 오류가 발생했습니다: ' + err.message);
			});
	}
</script>

<Container>
	<div class="back"><a href="/products">뒤로 가기</a></div>
	<Title>상품 상세</Title>
	<div class="name">{product().item.name} &times; {product().quantity}</div>
	<div class="description">{product().description}</div>
	<div class="price">{formatCurrency(product().price)}</div>
	<div class="owner">판매자: {product().owner_name}</div>
	<div class="buttons">
		<button onclick={buyPrompt.open}>구매하기</button>
	</div>
</Container>

<PromptFloat bind:this={buyPrompt}>
	<div>상품 구매</div>
	<div>구매 수량</div>
	<input type="number" min="1" bind:value={buyPromptQuantity} />
	<div>지불 계좌</div>
	<AccountInput bind:value={buyPromptAccount} />
	<div>이동 경로</div>
	<input type="text" placeholder="이동 경로" bind:value={buyPromptPath} />
	<button onclick={buy}>구매</button>
</PromptFloat>

<style>
	.back {
		color: #007bff;
		cursor: pointer;
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
