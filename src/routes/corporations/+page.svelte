<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';

	let { data } = $props();
	let corporations = $derived(() => data.corporations);
</script>

<Container>
	<Title>법인</Title>
	<ul>
		{#each corporations() as corporation}
			<li><a href="/corporations/{corporation.id}">{corporation.name}</a></li>
		{/each}
	</ul>
</Container>
