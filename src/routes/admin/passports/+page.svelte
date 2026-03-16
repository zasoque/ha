<script lang="ts">
	import Title from '$lib/components/Title.svelte';
	import PromptFloat from '$lib/components/PromptFloat.svelte';
	import PersonInput from '$lib/components/aci/PersonInput.svelte';

	const { data } = $props();
	const { passports } = $derived(data);

	let issuePassportPrompt: PromptFloat;
	let issuePassportPersonId: string = $state('');
	async function issuePassport() {
		await fetch('/api/v1/admin/passports', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				person_id: issuePassportPersonId
			})
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.success) {
					location.reload();
				} else {
					alert('여권 발급에 실패했습니다. ' + res.message);
				}
			})
			.catch((err) => {
				alert('여권 발급에 실패했습니다. ' + err.message);
			});
	}
</script>

<div><a href="/admin">뒤로 가기</a></div>
<Title>여권 관리</Title>
<table>
	<thead>
		<tr>
			<th>여권 번호</th>
			<th>본명</th>
			<th>예명</th>
			<th>발급일자</th>
			<th>만료일자</th>
		</tr>
	</thead>
	<tbody>
		{#each passports as passport}
			<tr>
				<td>{passport.id}</td>
				<td>{passport.person_id}</td>
				<td>{passport.name}</td>
				<td>{new Date(passport.issue_date).toLocaleDateString()}</td>
				<td>{new Date(passport.expiry_date).toLocaleDateString()}</td>
			</tr>
		{/each}
	</tbody>
</table>
<button onclick={issuePassportPrompt.open}>여권 발급</button>
<PromptFloat bind:this={issuePassportPrompt}>
	<div>여권 발급</div>
	<div>본명</div>
	<PersonInput bind:value={issuePassportPersonId} />
	<button onclick={issuePassport}>발급</button>
</PromptFloat>
