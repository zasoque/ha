<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import PromptFloat from '$lib/components/PromptFloat.svelte';

	let addPrompt;
	let addRoadName = $state('');
	let addRoadLandAId = $state(0);
	let addRoadLandBId = $state(0);

	async function addRoad() {
		await fetch('/api/v1/maps/roads', {
			method: 'POST',
			body: JSON.stringify({
				name: addRoadName,
				land_a_id: addRoadLandAId,
				land_b_id: addRoadLandBId,
				free: true
			})
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					addPrompt.close();
				} else {
					alert('도로 추가에 실패했습니다. ' + data.message);
				}
			})
			.catch((err) => {
				alert('도로 추가에 실패했습니다. ' + err.message);
			});
	}
</script>

<Container>
	<div><a href="/admin/maps">뒤로 가기</a></div>
	<Title>도로 관리</Title>
	<button onclick={addPrompt.open}>도로 추가</button>
</Container>
<PromptFloat bind:this={addPrompt}>
	<div>도로 이름</div>
	<input type="text" placeholder="도로 이름" bind:value={addRoadName} />
	<div>도로가 연결된 토지 A ID</div>
	<input type="number" placeholder="도로가 연결된 토지 A ID" bind:value={addRoadLandAId} />
	<div>도로가 연결된 토지 B ID</div>
	<input type="number" placeholder="도로가 연결된 토지 B ID" bind:value={addRoadLandBId} />
	<button onclick={addRoad}>추가</button>
</PromptFloat>
