<script lang="ts">
	import Title from '$lib/components/Title.svelte';
	import Law from '$lib/components/Law.svelte';
	import { createTwoFilesPatch } from 'diff';

	const { data } = $props();
	const { law, lawJSON, revisionId } = $derived(data);

	const index =
		law.contents.length - law.contents.findIndex((content) => content.id === revisionId);

	function getDiff(one, two) {
		if (one === undefined) return '(제정)';

		const patch = createTwoFilesPatch('현행', '개정', one.trim(), two.trim(), '', '');
		return patch.replace(/\\ No newline at end of file(\n|$)?/g, '');
	}
</script>

<div><a href="/laws/{law.id}">뒤로 가기</a></div>
<Title>{law.name} 제{index}호</Title>
<Law {lawJSON} />
<Title>변화</Title>
<pre>{getDiff(
		law.contents[law.contents.length - index + 1]?.content,
		law.contents[law.contents.length - index].content
	)}</pre>
