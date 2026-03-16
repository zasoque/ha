<script lang="ts">
	import Title from '$lib/components/Title.svelte';

	const { data } = $props();
	const { q, laws } = $derived(data);

	function getMatch(law: any) {
		const matches = [];
		law.content.split('\n').forEach((line: string) => {
			if (line.includes(q)) {
				line = line.trim();
				line = line.replace(new RegExp(q, 'g'), `<mark>${q}</mark>`);
				matches.push(line);
			}
		});
		return matches;
	}
</script>

<div><a href="/laws">뒤로 가기</a></div>
<Title>검색 결과: {q}</Title>
{#each laws as law}
	<div class="law">
		<a href={`/laws/${law.id}`}>
			<div class="law-name">
				{law.name}
			</div>
			<div class="match">
				{#each getMatch(law) as match}
					<div class="match-item">
						{@html match}
					</div>
				{/each}
			</div>
		</a>
	</div>
{/each}

<style>
	.law {
		margin-bottom: 1rem;
	}
	.law-name {
		font-weight: bold;
		margin-bottom: 0.5rem;
	}
	.match-item {
		margin-bottom: 0.5rem;
	}
</style>
