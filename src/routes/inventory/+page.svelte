<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import Stock from '$lib/components/Stock.svelte';

	let { data } = $props();
	let inventory = $derived(() => data.inventory);

	function give(itemId: number): () => void {
		return () => {
			const userId = prompt('아이템을 지급할 이용자 ID를 입력해.');
			const quantityStr = prompt('지급할 수량을 입력해.');
			const quantity = parseInt(quantityStr || '0', 10);

			if (!userId || isNaN(quantity) || quantity <= 0) {
				alert('모든 필드를 올바르게 입력해주세요!');
				return;
			}

			fetch(`/api/v1/inventory/transfer`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					to_user_id: userId,
					item_id: itemId,
					quantity: quantity
				})
			}).then((res) => {
				if (res.ok) {
					alert('아이템이 성공적으로 지급되었습니다!');
				} else {
					res.json().then((data) => {
						alert(`아이템 지급 실패: ${data.error}`);
					});
				}
			});
		};
	}
</script>

<Container>
	<Title>인벤토리</Title>
	<div class="inventory">
		{#each inventory() as stock}
			<Stock {stock} ongive={give(stock.item_id)} />
		{/each}
	</div>
</Container>

<style>
	button {
		padding: 0.25rem 0.5rem;
		font-size: 0.875rem;
	}

	.inventory {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}
</style>
