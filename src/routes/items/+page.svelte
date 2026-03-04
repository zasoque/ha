<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import Stock from '$lib/components/Stock.svelte';
	import PromptFloat from '$lib/components/PromptFloat.svelte';

	let { data } = $props();
	let items = $derived(() => data.items);
	let page = $derived(() => data.page!);
	let limit = $derived(() => data.limit!);

	let createItemPrompt;
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
</script>

<Container>
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
			/>
		{/each}
	</div>
	<button onclick={createItemPrompt.open}>아이템 제작하기</button>
	<Pagination page={page()} limit={limit()} />
</Container>
<PromptFloat bind:this={createItemPrompt}>
	<div>아이템 이름</div>
	<input type="text" bind:value={newItemName} />
	<div>아이템 설명</div>
	<input type="text" bind:value={newItemDescription} />
	<button onclick={createItem}>제작하기</button>
</PromptFloat>

<style>
	.inventory {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 1rem;
	}
</style>
