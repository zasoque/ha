<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';

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

			fetch(`/api/v1/inventory/users/${userId}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ item_id: itemId, quantity })
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
	<ul>
		{#each inventory() as stock}
			<li>
				{stock.item.name} &times; {stock.quantity}<br />
				{stock.item.description}<br />
				<button onclick={give(stock.item_id)}>주기</button>
			</li>
		{/each}
	</ul>
</Container>

<style>
	button {
		padding: 0.25rem 0.5rem;
		font-size: 0.875rem;
	}
</style>
