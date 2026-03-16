<script lang="ts">
	import Title from '$lib/components/Title.svelte';

	let { data } = $props();
	let corporations = $derived(() => data.corporations);
</script>

<Title>법인</Title>
<ul>
	{#each corporations() as corporation}
		<li><a href="/corporations/{corporation.id}">{corporation.name}</a></li>
	{/each}
</ul>
