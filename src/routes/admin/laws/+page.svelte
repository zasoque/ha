<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import PromptFloat from '$lib/components/PromptFloat.svelte';

	const { data } = $props();
	const { laws } = $derived(data);

	let newLawPrompt: PromptFloat = $state<PromptFloat>();
	let newLawName = $state();
	let newLawLevel = $state();

	function newLaw() {
		if (!newLawName || !newLawLevel) {
			alert('모든 필드를 입력해주세요.');
			return;
		}

		fetch('/api/v1/admin/laws', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: newLawName,
				level: newLawLevel
			})
		})
			.then((res) => {
				if (res.ok) {
					location.reload();
				} else {
					alert('법령 생성에 실패했습니다.');
				}
			})
			.catch(() => {
				alert('법령 생성에 실패했습니다.');
			});
	}
</script>

<Container>
	<div><a href="/admin">뒤로 가기</a></div>
	<Title>법령 관리</Title>
	<div>헌법</div>
	<ul>
		{#each laws.filter((l) => l.level === '헌법') as law}
			<li>
				<a href={`/admin/laws/${law.id}`}>
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
				<a href={`/admin/laws/${law.id}`}>
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
				<a href={`/admin/laws/${law.id}`}>
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
				<a href={`/admin/laws/${law.id}`}>
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
				<a href={`/admin/laws/${law.id}`}>
					{law.name}
				</a>
			</li>
		{/each}
	</ul>
	<div><button onclick={newLawPrompt.open}>새 법령 만들기</button></div>
</Container>

<PromptFloat bind:this={newLawPrompt}>
	<div>법령 이름</div>
	<input type="text" bind:value={newLawName} />
	<div>법령 레벨</div>
	<select bind:value={newLawLevel}>
		<option value="" disabled selected>선택하세요</option>
		<option>헌법</option>
		<option>법률</option>
		<option>명령</option>
		<option>조례</option>
		<option>규칙</option>
	</select>
	<div><button onclick={newLaw}>생성</button></div>
</PromptFloat>
