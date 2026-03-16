<script lang="ts">
	import Title from '$lib/components/Title.svelte';
	import Stock from '$lib/components/Stock.svelte';
	import PromptFloat from '$lib/components/PromptFloat.svelte';

	let { data } = $props();
	let inventory = $derived(() => data.inventory);

	let giveItemId = $state(0);
	let giveUserId = $state('');
	let giveQuantity = $state('');
	let givePrompt = $state()! as PromptFloat;

	function give() {
		const quantity = parseInt(giveQuantity || '0', 10);

		if (!giveUserId || isNaN(quantity) || quantity <= 0) {
			alert('모든 필드를 올바르게 입력해주세요!');
			return;
		}

		fetch(`/api/v1/inventory/transfer`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				to_user_id: giveUserId,
				item_id: giveItemId,
				quantity
			})
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					alert('아이템이 성공적으로 지급되었습니다!');
					location.reload();
				} else {
					alert(`아이템 지급 실패: ${data.message}`);
				}
			})
			.catch((error) => {
				console.error('Error:', error);
				alert('아이템 지급 중 오류가 발생했습니다.');
			});
	}

	function openGive(itemId: number) {
		giveItemId = itemId;
		givePrompt.open();
	}
</script>

<Title>인벤토리</Title>
<div class="inventory">
	{#each inventory() as stock}
		<Stock {stock} ongive={() => openGive(stock.item.id)} />
	{/each}
</div>
<PromptFloat bind:this={givePrompt}>
	<div>아이템 ID</div>
	<input id="item-id" type="number" bind:value={giveItemId} disabled />
	<div>아이템을 지급할 이용자 ID</div>
	<input id="user-id" type="text" bind:value={giveUserId} />
	<div>지급할 수량</div>
	<input id="quantity" type="number" bind:value={giveQuantity} />
	<button class="button" onclick={give}>지급</button>
</PromptFloat>

<style>
	.inventory {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}
</style>
