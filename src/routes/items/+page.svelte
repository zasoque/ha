<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import Stock from '$lib/components/Stock.svelte';

	let { data } = $props();
	let items = $derived(() => data.items);
	let page = $derived(() => data.page!);
	let limit = $derived(() => data.limit!);

	function createItem() {
		const name = prompt('아이템 이름을 입력해.');
		const description = prompt('아이템 설명을 입력해.');

		if (!name || !description) {
			alert('아이템 이름과 설명은 필수야!');
			return;
		}

		fetch('/api/v1/items', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, description })
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
	<button onclick={createItem}>아이템 제작하기</button>
	<Pagination page={page()} limit={limit()} />
</Container>

<style>
	.inventory {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 1rem;
	}
</style>
