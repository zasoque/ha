<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import PromptFloat from '$lib/components/PromptFloat.svelte';
	import PersonInput from '$lib/components/aci/PersonInput.svelte';
	import { CERTIFICATIONS } from '$lib/util/const';

	const { data } = $props();
	const certificates = $derived(() => data.certificates);

	let postCertificatePrompt: PromptFloat = $state<PromptFloat>();
	let postCertificateUserId = $state<number>();
	let postCertificateType = $state<string>('');

	async function postCertificate() {
		await fetch('/api/v1/admin/certificates', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				user_id: postCertificateUserId,
				type: postCertificateType
			})
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					location.reload();
				} else {
					alert(data.message);
				}
			})
			.catch((err) => {
				alert(err.message);
			});
	}

	function deleteCertificate(id: number) {
		return async () => {
			if (!confirm('정말 삭제하시겠습니까?')) {
				return;
			}

			await fetch(`/api/v1/admin/certificates/${id}`, {
				method: 'DELETE'
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.success) {
						location.reload();
					} else {
						alert(data.message);
					}
				})
				.catch((err) => {
					alert(err.message);
				});
		};
	}
</script>

<Container>
	<div><a href="/admin">뒤로 가기</a></div>
	<Title>자격증 관리</Title>
	<button onclick={postCertificatePrompt.open}>자격증 발급</button>
	<table>
		<thead>
			<tr>
				<th>ID</th>
				<th>발급인원</th>
				<th>종류</th>
				<th>행동</th>
			</tr>
		</thead>
		<tbody>
			{#each certificates() as certificate}
				<tr>
					<td>{certificate.id}</td>
					<td>{certificate.user_id}</td>
					<td>{certificate.type}</td>
					<td><button onclick={deleteCertificate(certificate.id)}>삭제</button></td>
				</tr>
			{/each}
		</tbody>
	</table>
</Container>
<PromptFloat bind:this={postCertificatePrompt}>
	<div>자격증 발급</div>
	<div>발급인원 ID</div>
	<PersonInput bind:value={postCertificateUserId}></PersonInput>
	<div>자격증 종류</div>
	<select bind:value={postCertificateType}>
		{#each CERTIFICATIONS as certification}
			<option value={certification}>{certification}</option>
		{/each}
	</select>
	<button onclick={postCertificate}>발급</button>
</PromptFloat>
