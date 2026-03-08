<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import PromptFloat from '$lib/components/PromptFloat.svelte';
	import PersonInput from '$lib/components/aci/PersonInput.svelte';

	let { data } = $props();
	let corporationmembers = $derived(() => data.corporationmembers);
	let page = $derived(() => data.page);
	let limit = $derived(() => data.limit);

	let addMemberPrompt: PromptFloat;
	let addMemberCorporationId = $state('');
	let addMemberUserId = $state('');

	async function addMember() {
		alert(`법인 ID: ${addMemberCorporationId}, 회원 ID: ${addMemberUserId}`);
		await fetch(`/api/v1/admin/corporations/${addMemberCorporationId}/members`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				user_id: addMemberUserId
			})
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					addMemberPrompt.close();
					location.reload();
				} else {
					alert('법인에 사람 추가 실패: ' + data.message);
				}
			})
			.catch((err) => {
				alert('법인에 사람 추가 오류: ' + err.message);
			});
	}

	function deleteMember(corporationId: string, userId: string) {
		return async () => {
			if (!confirm(`법인 ${corporationId}에서 회원 ${userId}를 삭제하시겠습니까?`)) {
				return;
			}

			await fetch(`/api/v1/admin/corporations/${corporationId}/members`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					user_id: userId
				})
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.success) {
						location.reload();
					} else {
						alert('법인에서 사람 삭제 실패: ' + data.message);
					}
				})
				.catch((err) => {
					alert('법인에서 사람 삭제 오류: ' + err.message);
				});
		};
	}
</script>

<Container>
	<div><a href="/admin">뒤로 가기</a></div>
	<Title>법인 관리</Title>
	<table>
		<tbody>
			<tr>
				<th>법인</th>
				<th>회원</th>
				<th>동작</th>
			</tr>
			{#each corporationmembers() as member}
				<tr>
					<td>{member.corporation.name} ({member.corporation_id})</td>
					<td>{member.user.name} ({member.user_id})</td>
					<td>
						<button onclick={deleteMember(member.corporation_id, member.user_id)}>삭제</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<button onclick={addMemberPrompt.open}>회원 추가</button>
	<Pagination page={page()} limit={limit()} />
	<PromptFloat bind:this={addMemberPrompt}>
		<div>법인에 사람 추가</div>
		<div>법인 본명</div>
		<PersonInput bind:value={addMemberCorporationId} />
		<div>회원 본명</div>
		<PersonInput bind:value={addMemberUserId} />
		<button onclick={addMember}>추가</button>
	</PromptFloat>
</Container>
