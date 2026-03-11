<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import Law from '$lib/components/Law.svelte';

	const { data } = $props();
	const { law, lawJSON, revisionId } = $derived(data);

	console.log(law);

	const index =
		law.contents.length - law.contents.findIndex((content) => content.id === revisionId);
</script>

<Container>
	<div><a href="/laws/{law.id}">뒤로 가기</a></div>
	<Title>{law.name} 제{index}호</Title>
	<Law {lawJSON} />
</Container>
