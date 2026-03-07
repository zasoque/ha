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
	let newType = $state('person');
	let addPersonPrompt;

	function addPerson() {
		fetch('/api/v1/admin/people', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: newId, name: newName, residence: newResidence, type: newType })
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					location.reload();
				} else {
					alert('국민 추가에 실패했습니다: ' + data.message);
				}
			})
			.catch((err) => {
				alert('국민 추가 중 오류가 발생했습니다: ' + err.message);
			});
	}

	let editPersonPrompt;
	let editId = $state('');
	let editName = $state('');
	let editResidence = $state('');

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

	function deletePerson(personId: string) {
		return () => {
			if (!confirm('정말로 이 국민을 삭제하시겠습니까?')) return;

			fetch(`/api/v1/admin/people/${personId}`, {
				method: 'DELETE'
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.success) {
						location.reload();
					} else {
						alert('국민 삭제에 실패했습니다: ' + data.message);
					}
				})
				.catch((err) => {
					alert('국민 삭제 중 오류가 발생했습니다: ' + err.message);
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
				<th>종류</th>
				<th>동작</th>
			</tr>
			{#each people() as person}
				<tr>
					<td>{person.id}</td>
					<td>{person.name}</td>
					<td>
						{#if person.residence}
							{person.residence_land.name} {person.residence_building.name} #{person.residence}
						{:else}
							(거주지 없음)
						{/if}
					</td>
					<td>{person.type}</td>
					<td>
						<button onclick={openEditPersonPrompt(person.id)}>변경</button>
						<button onclick={deletePerson(person.id)}>삭제</button>
					</td>
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
	<div>국민 타입</div>
	<select bind:value={newType}>
		<option value="person">사람</option>
		<option value="corporation">법인</option>
	</select>
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
