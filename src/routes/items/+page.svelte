<script lang="ts">
	import Title from '$lib/components/Title.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import Stock from '$lib/components/Stock.svelte';
	import PromptFloat from '$lib/components/PromptFloat.svelte';

	let { data } = $props();
	let items = $derived(() => data.items);
	let page = $derived(() => data.page!);
	let limit = $derived(() => data.limit!);

	let createItemPrompt = $state()! as PromptFloat;
	let newItemName = $state('');
	let newItemDescription = $state('');

	function createItem() {
		if (!newItemName || !newItemDescription) {
			alert('아이템 이름과 설명은 필수야!');
			return;
		}

		fetch('/api/v1/items', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: newItemName,
				description: newItemDescription
			})
		}).then((res) => {
			location.reload();
		});
	}

	let makeItemPrompt = $state()! as PromptFloat;
	let makeItemId = $state('');
	let makeItemQuantity = $state(1);

	function makeItem() {
		if (!makeItemId || makeItemQuantity <= 0) {
			alert('아이템 ID와 수량은 필수야!');
			return;
		}

		fetch(`/api/v1/items/${makeItemId}/craft`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				quantity: makeItemQuantity
			})
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					location.reload();
				} else {
					alert(`아이템 제작에 실패했어: ${data.message}`);
				}
			})
			.catch((err) => {
				alert(`아이템 제작 중 오류가 발생했어: ${err.message}`);
			});
	}
</script>

<Title>아이템 목록</Title>
<div class="inventory">
	{#each items() as item}
		<Stock
			stock={{
				quantity: 0,
				item,
				item_id: item.id
			}}
			showaction={false}
			ongive={() => {}}
		/>
	{/each}
</div>
<button onclick={createItemPrompt.open}>아이템 발명하기</button>
<button onclick={makeItemPrompt.open}>아이템 제작하기</button>
<Pagination page={page()} limit={limit()} />
<PromptFloat bind:this={createItemPrompt}>
	<div>아이템 이름</div>
	<input type="text" bind:value={newItemName} />
	<div>아이템 설명</div>
	<input type="text" bind:value={newItemDescription} />
	<button onclick={createItem}>발명하기</button>
</PromptFloat>
<PromptFloat bind:this={makeItemPrompt}>
	<div>아이템 ID</div>
	<input type="text" bind:value={makeItemId} />
	<div>아이템 수량 (아이템을 하나 만들 때마다 테인트가 1개씩 필요해.)</div>
	<input type="number" bind:value={makeItemQuantity} />
	<button onclick={makeItem}>제작하기</button>
</PromptFloat>

<style>
	.inventory {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 1rem;
	}
</style>
