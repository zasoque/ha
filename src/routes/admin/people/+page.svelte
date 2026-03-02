<script lang="ts">
	const { data } = $props();
	const { people, page, limit } = data;

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

	function editPerson(personId) {
		const person = people.find((p) => p.id === personId);
		if (!person) return;

		const name = prompt('국민 이름을 입력해줘', person.name);
		if (!name) return;

		const residence = prompt('국민 거주지를 입력해줘', person.residence);
		if (!residence) return;

		fetch(`/api/v1/admin/people/${personId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ name, residence, id: personId })
		}).then((res) => {
			location.reload();
		});
	}

	function previousPage() {
		if (page > 1) {
			location.href = `?page=${parseInt(page) - 1}&limit=${limit}`;
		}
	}

	function nextPage() {
		location.href = `?page=${parseInt(page) + 1}&limit=${limit}`;
	}
</script>

<div class="container">
	<div class="title">국민 관리</div>
	<ul>
		{#each people as person}
			<li>
				{person.name} ({person.id}): {person.residence}
				<button onclick={editPerson(person.id)}>변경</button>
			</li>
		{/each}
	</ul>
	<div>
		<button onclick={previousPage}>&lt;</button>
		<span>{page}&times;{limit}</span>
		<button onclick={nextPage}>&gt;</button>
	</div>
	<button onclick={addPerson}>국민 추가</button>
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
		margin-right: 1rem;
		padding: 0.25rem 0.5rem;
		background-color: #eee;
		border: 1px solid #ccc;
		border-radius: 4px;
		cursor: pointer;
	}
</style>
