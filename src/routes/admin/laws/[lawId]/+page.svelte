<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import Law from '$lib/components/Law.svelte';
	import { parseLaw } from '$lib/util/law';

	const { data } = $props();
	const { law } = $derived(data);

	let value = $state(law.contents[0]?.content || '');

	function postLaw() {
		const content = (document.querySelector('textarea') as HTMLTextAreaElement).value;

		fetch(`/api/v1/admin/laws/${law.id}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ content })
		})
			.then((res) => res.json())
			.then((data) => {
				console.log(data);
				if (data.success) {
					alert('법령이 수정되었습니다.');
				} else {
					alert('법령 수정에 실패했습니다. ' + data.message);
				}
			})
			.catch((e) => {
				alert('법령 수정에 실패했습니다. ' + e.message);
			});
	}
</script>

<Container>
	<div><a href="/admin/laws">뒤로 가기</a></div>
	<Title>{law.name}</Title>
	<div>법령 레벨: {law.level}</div>
	<textarea bind:value></textarea>
	<button onclick={postLaw}>법령 수정</button>
	<Law lawJSON={parseLaw(value)} />
</Container>

<style>
	textarea {
		width: 100%;
		height: 50vh;
	}
</style>
