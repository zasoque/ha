<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';

	let { data } = $props();
	let items = $derived(() => data.items);
	let page = $derived(() => data.page);
	let limit = $derived(() => data.limit);

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

	function previousPage() {
		if (page() > 1) {
			location.href = `/items?page=${page() - 1}&limit=${limit()}`;
		}
	}

	function nextPage() {
		location.href = `/items?page=${page() + 1}&limit=${limit()}`;
	}
</script>

<Container>
	<Title>아이템 목록</Title>
	<ul>
		{#each items() as item}
			<li>{item.name} ({item.maker_name}) #{item.id}<br />{item.description}</li>
		{/each}
	</ul>
	<button onclick={createItem}>아이템 만들기</button>
	<div>
		<button onclick={previousPage}>&lt;</button>
		<span>{page()}&times;{limit()}</span>
		<button onclick={nextPage}>&gt;</button>
	</div>
</Container>

<style>
	button {
		margin-top: 1rem;
		padding: 0.5rem 1rem;
		font-size: 1rem;
	}
</style>
