<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	const { data } = $props();
	const people = $derived(() => data.people);
	const page = $derived(() => parseInt(data.page));
	const limit = $derived(() => parseInt(data.limit));

	function addPerson() {
		const id = prompt('추가할 국민 ID를 입력해줘');
		if (!id) return;

		const name = prompt('추가할 국민 이름을 입력해줘');
		if (!name) return;

		const residence = prompt('추가할 국민 거주지를 입력해줘');
		if (!residence) return;

		fetch('/api/v1/admin/people', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id, name, residence })
		}).then((res) => {
			location.reload();
		});
	}

	function editPerson(personId: string): () => void {
		const person = people().find((p: any) => p.id === personId);
		if (!person) return () => {};

		const name = prompt('국민 이름을 입력해줘', person.name);
		if (!name) return () => {};

		const residence = prompt('국민 거주지를 입력해줘', person.residence);
		if (!residence) return () => {};

		return () => {
			fetch(`/api/v1/admin/people/${personId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ name, residence, id: personId })
			}).then((res) => {
				location.reload();
			});
		};
	}

	function previousPage() {
		if (page() > 1) {
			location.href = `?page=${page() - 1}&limit=${limit()}`;
		}
	}

	function nextPage() {
		location.href = `?page=${page() + 1}&limit=${limit()}`;
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
					<td>{person.residence}</td>
					<td><button onclick={editPerson(person.id)}>변경</button></td>
				</tr>
			{/each}
		</tbody>
	</table>
	<div>
		<button onclick={previousPage}>&lt;</button>
		<span>{page()}&times;{limit()}</span>
		<button onclick={nextPage}>&gt;</button>
	</div>
	<button onclick={addPerson}>국민 추가</button>
</Container>

<style>
	.table {
		width: 100%;
		border-collapse: collapse;
	}

	.table th,
	.table td {
		padding: 0.5rem;
		border: 1px solid #ccc;
	}

	.table th {
		background-color: #f5f5f5;
	}

	button {
		margin-left: 1rem;
		margin-right: 1rem;
		padding: 0.25rem 0.5rem;
		background-color: #eee;
		border: 1px solid #ccc;
		border-radius: 4px;
		cursor: pointer;
	}
</style>
