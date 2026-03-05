<script>
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import PromptFloat from '$lib/components/PromptFloat.svelte';
	import { onMount } from 'svelte';
	import { init } from '$lib/util/map-canvas-manager';

	let { data } = $props();
	let { lands, buildings, roads, rails, me } = data;

	let canvas;

	let landPrompt;
	let landPromptName = $state('');
	let landPromptId = $state(0);
	let landPromptPosition = $state({ x: 0, y: 0 });
	let landPromptColor = $state('#000000');

	let roadPrompt;
	let roadPromptName = $state('');
	let roadPromptLandAId = $state(0);
	let roadPromptLandBId = $state(0);

	let addLandPrompt;
	let addLandName = $state('');
	let addLandPosition = $state({ x: 0, y: 0 });
	let addLandColor = $state('#000000');
	let addLandAccountId = $state(0);

	async function addLand() {
		await fetch('/api/v1/maps/lands', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: addLandName,
				owner_id: me.id,
				x: addLandPosition.x,
				y: addLandPosition.y,
				color: addLandColor.replace('#', ''),
				account_id: addLandAccountId
			})
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					location.reload();
				} else {
					alert('토지 추가에 실패했습니다: ' + data.message);
				}
			})
			.catch((err) => {
				console.error('토지 추가 실패:', err);
			});
	}

	let addRoadPrompt;
	let addRoadName = $state('');
	let addRoadLandAId = $state(0);
	let addRoadLandBId = $state(0);

	async function addRoad() {
		await fetch('/api/v1/maps/roads', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: addRoadName,
				land_a_id: addRoadLandAId,
				land_b_id: addRoadLandBId
			})
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					location.reload();
				} else {
					alert('도로 추가에 실패했습니다: ' + data.message);
				}
			})
			.catch((err) => {
				console.error('도로 추가 실패:', err);
			});
	}

	onMount(() => {
		init(
			canvas,
			lands,
			buildings,
			roads,
			rails,
			(land) => {
				landPromptName = land.name;
				landPromptId = land.id;
				landPromptPosition = {
					x: land.position.coordinates[0],
					y: land.position.coordinates[1]
				};
				landPromptColor = '#' + land.color;
				landPrompt.open();
			},
			(road) => {
				roadPromptName = road.name;
				roadPromptLandAId = road.land_a_id;
				roadPromptLandBId = road.land_b_id;
				roadPrompt.open();
			}
		);
	});
</script>

<PromptFloat bind:this={landPrompt}>
	<div>토지 정보</div>
	<div>이름: {landPromptName}</div>
	<div>ID: {landPromptId}</div>
	<div>위치: ({landPromptPosition.x}, {landPromptPosition.y})</div>
	<div>색상: {landPromptColor.toUpperCase()}</div>
</PromptFloat>
<PromptFloat bind:this={roadPrompt}>
	<div>도로 정보</div>
	<div>이름: {roadPromptName}</div>
	<div>토지 A ID: {roadPromptLandAId}</div>
	<div>토지 B ID: {roadPromptLandBId}</div>
</PromptFloat>
<PromptFloat bind:this={addLandPrompt}>
	<div>토지 추가</div>
	<div>이름</div>
	<input type="text" bind:value={addLandName} />
	<div>위치</div>
	<input type="number" bind:value={addLandPosition.x} placeholder="X 좌표" />
	<input type="number" bind:value={addLandPosition.y} placeholder="Y 좌표" />
	<div>색상</div>
	<input type="color" bind:value={addLandColor} />
	<div>계좌번호 (토지를 만들기 위해서는 2냥이 필요해.)</div>
	<input type="number" bind:value={addLandAccountId} placeholder="계좌번호" />
	<button onclick={addLand}>추가</button>
</PromptFloat>
<PromptFloat bind:this={addRoadPrompt}>
	<div>도로 추가</div>
	<div>이름</div>
	<input type="text" bind:value={addRoadName} />
	<div>토지 A ID</div>
	<input type="number" bind:value={addRoadLandAId} placeholder="토지 A ID" />
	<div>토지 B ID</div>
	<input type="number" bind:value={addRoadLandBId} placeholder="토지 B ID" />
	<button onclick={addRoad}>추가</button>
</PromptFloat>

<Container>
	<Title>하 지도</Title>
	<canvas class="canvas" bind:this={canvas}></canvas>
	<button onclick={addLandPrompt.open}>토지 추가</button>
	<button onclick={addRoadPrompt.open}>도로 추가</button>
</Container>

<style>
	.canvas {
		width: 100%;
		height: calc(100vh - 200px);
		border: 1px solid #ccc;
		border-radius: 4px;
	}
</style>
