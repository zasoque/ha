<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import PromptFloat from '$lib/components/PromptFloat.svelte';

	let addBuidlingPrompt: PromptFloat;
	let addBuildingName = $state('새 건물');
	let addBuildingLandId = $state(0);
	let addBuildingType = $state('');

	async function addBuilding() {
		await fetch(`/api/v1/maps/lands/${addBuildingLandId}/buildings`, {
			method: 'POST',
			body: JSON.stringify({
				name: addBuildingName,
				land_id: addBuildingLandId,
				type: addBuildingType,
				account_id: 24,
				free: true
			})
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					addBuidlingPrompt.close();
				} else {
					alert('건물 추가에 실패했습니다. ' + data.message);
				}
			})
			.catch((err) => {
				console.error(err);
				alert('건물 추가 중 오류가 발생했습니다. ' + err.message);
			});
	}
</script>

<Container>
	<div><a href="/admin/maps">뒤로 가기</a></div>
	<Title>건물 관리</Title>
	<button onclick={addBuidlingPrompt.open}>건물 추가</button>
</Container>

<PromptFloat bind:this={addBuidlingPrompt}>
	<div>건물 추가</div>
	<div>건물 이름</div>
	<input type="text" bind:value={addBuildingName} />
	<div>토지 ID</div>
	<input type="number" bind:value={addBuildingLandId} />
	<div>건물 유형</div>
	<select bind:value={addBuildingType}>
		<option>주거</option>
		<option>사무</option>
		<option>농장</option>
		<option>시장</option>
	</select>
	<button onclick={addBuilding}>추가</button>
</PromptFloat>
