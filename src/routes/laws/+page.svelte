<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';

	const { data } = $props();
	const { laws } = $derived(data);
</script>

<Container>
	<Title>법령정보</Title>
	<ul>
		{#each laws as law}
			<li>
				<a href={`/laws/${law.id}`}>
					{law.name}
				</a>
			</li>
		{/each}
	</ul>
</Container>
