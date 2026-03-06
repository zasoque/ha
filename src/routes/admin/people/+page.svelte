<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import PromptFloat from '$lib/components/PromptFloat.svelte';

	const { data } = $props();
	const people = $derived(() => data.people);
	const page = $derived(() => data.page);
	const limit = $derived(() => data.limit);

	let newId = $state('');
	let newName = $state('');
	let newResidence = $state('');
	let addPersonPrompt;

	function addPerson() {
		fetch('/api/v1/admin/people', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: newId, name: newName, residence: newResidence })
		}).then((res) => {
			location.reload();
		});
	}

	let editId = $state('');
	let editName = $state('');
	let editResidence = $state('');
	let editPersonPrompt;

	function openEditPersonPrompt(personId: string) {
		const person = people().find((p: any) => p.id === personId);
		if (!person) return;

		return () => {
			editId = person.id;
			editName = person.name;
			editResidence = person.residence;
			editPersonPrompt.open();
		};
	}

	function editPerson(personId: string): () => void {
		const person = people().find((p: any) => p.id === personId);
		if (!person) return () => {};

		return () => {
			fetch(`/api/v1/admin/people/${personId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ name: editName, residence: editResidence })
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.success) {
						location.reload();
					} else {
						alert('국민 정보 변경에 실패했습니다: ' + data.message);
					}
				});
		};
	}
</script>

<Container>
	<div><a href="/admin">뒤로 가기</a></div>
	<Title>국민 관리</Title>
	<table class="table">
		<tbody>
			<tr>
				<th>본명</th>
				<th>예명</th>
				<th>거주지</th>
				<th>동작</th>
			</tr>
			{#each people() as person}
				<tr>
					<td>{person.id}</td>
					<td>{person.name}</td>
					<td>{person.residence_land.name} {person.residence_building.name} #{person.residence}</td>
					<td><button onclick={openEditPersonPrompt(person.id)}>변경</button></td>
				</tr>
			{/each}
		</tbody>
	</table>
	<Pagination page={page()} limit={limit()} />
	<button onclick={addPersonPrompt.open}>국민 추가</button>
</Container>
<PromptFloat bind:this={addPersonPrompt}>
	<div>국민 본명</div>
	<input type="text" placeholder="본명" bind:value={newId} />
	<div>국민 예명</div>
	<input type="text" placeholder="예명" bind:value={newName} />
	<div>국민 거주지</div>
	<input type="text" placeholder="거주지" bind:value={newResidence} />
	<button onclick={addPerson}>추가하기</button>
</PromptFloat>
<PromptFloat bind:this={editPersonPrompt}>
	<div>국민 본명</div>
	<input type="text" placeholder="본명" bind:value={editId} />
	<div>국민 예명</div>
	<input type="text" placeholder="예명" bind:value={editName} />
	<div>국민 거주지</div>
	<input type="text" placeholder="거주지" bind:value={editResidence} />
	<button onclick={editPerson(editId)}>변경하기</button>
</PromptFloat>

<style>
	.table {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 1rem;
	}

	.table th,
	.table td {
		padding: 0.5rem;
		border: 1px solid #ccc;
	}

	.table th {
		background-color: #f5f5f5;
	}
</style>
