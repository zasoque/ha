<script lang="ts">
	const { data } = $props();
	const { users } = data;

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

<div class="container">
	<div><a href="/admin">뒤로 가기</a></div>
	<div class="title">관리자 관리</div>
	<ul>
		{#each users as user}
			<li>{user.id} <button onclick={deleteAdmin(user.id)}>관리자 제거</button></li>
		{/each}
	</ul>
	<button class="button" onclick={addAdmin}>관리자 추가</button>
</div>

<style>
	.container {
		max-width: var(--max-width);
		margin: 0 auto;
		padding: 0 2rem;
	}

	.title {
		font-size: 2rem;
		font-weight: bold;
	}

	button {
		margin-left: 1rem;
		padding: 0.25rem 0.5rem;
		background-color: #eee;
		border: 1px solid #ccc;
		border-radius: 4px;
		cursor: pointer;
	}
</style>
