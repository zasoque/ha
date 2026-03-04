<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	const { data } = $props();
	const users = $derived(() => data.users);

	async function addAdmin() {
		const id = prompt('추가할 관리자 ID를 입력해줘');
		if (!id) return;

		await fetch('/api/v1/admin/users', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id })
		}).then((res) => {
			location.reload();
		});
	}

	function deleteAdmin(id: string) {
		return async () => {
			if (!confirm('정말 관리자를 제거할까?')) return;

			await fetch(`/api/v1/admin/users/${id}`, {
				method: 'DELETE'
			}).then((res) => {
				location.reload();
			});
		};
	}
</script>

<Container>
	<div><a href="/admin">뒤로 가기</a></div>
	<Title>관리자 관리</Title>
	<div class="admins">
		{#each users() as user}
			<div class="admin">
				<div>{user.id}</div>
				<div><button onclick={deleteAdmin(user.id)}>관리자 제거</button></div>
			</div>
		{/each}
	</div>
	<button class="button" onclick={addAdmin}>관리자 추가</button>
</Container>

<style>
	.admins {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.admin {
		display: flex;
		justify-content: space-between;
		flex-direction: column;
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
	}
</style>
