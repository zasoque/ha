<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';

	const { data } = $props();
	const { laws } = $derived(data);

	console.log(laws);
</script>

<Container>
	<Title>법령정보</Title>
	<div>헌법</div>
	<ul>
		{#each laws.filter((l) => l.level === '헌법') as law}
			<li>
				<a href={`/laws/${law.id}`}>
					{law.name}
				</a>
			</li>
		{/each}
	</ul>
	<div>법률</div>
	<ul>
		{#each laws
			.filter((l) => l.level === '법률')
			.sort((a, b) => a.name.localeCompare(b.name)) as law}
			<li>
				<a href={`/laws/${law.id}`}>
					{law.name}
				</a>
			</li>
		{/each}
	</ul>
	<div>명령</div>
	<ul>
		{#each laws
			.filter((l) => l.level === '명령')
			.sort((a, b) => a.name.localeCompare(b.name)) as law}
			<li>
				<a href={`/laws/${law.id}`}>
					{law.name}
				</a>
			</li>
		{/each}
	</ul>
	<div>조례</div>
	<ul>
		{#each laws
			.filter((l) => l.level === '조례')
			.sort((a, b) => a.name.localeCompare(b.name)) as law}
			<li>
				<a href={`/laws/${law.id}`}>
					{law.name}
				</a>
			</li>
		{/each}
	</ul>
	<div>규칙</div>
	<ul>
		{#each laws
			.filter((l) => l.level === '규칙')
			.sort((a, b) => a.name.localeCompare(b.name)) as law}
			<li>
				<a href={`/laws/${law.id}`}>
					{law.name}
				</a>
			</li>
		{/each}
	</ul>
</Container>
