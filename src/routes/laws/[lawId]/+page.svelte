<script lang="ts">
	import Title from '$lib/components/Title.svelte';
	import Law from '$lib/components/Law.svelte';

	const { data } = $props();
	const { law, lawJSON } = $derived(data);
</script>

<!-- chapter - section - article - clause - item  -->
<div><a href="/laws">뒤로 가기</a></div>
<Title>{law.name}</Title>
<Law {lawJSON} />
<Title>역사</Title>
<ul>
	{#each law.contents as contents, i}
		<li>
			<a href="/laws/{law.id}/{contents.id}">
				<span class="history-date">{new Date(contents.created_at).toLocaleString()}</span>
				<span class="history-description">제{law.contents.length - i}호</span>
			</a>
		</li>
	{/each}
</ul>
