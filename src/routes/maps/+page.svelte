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
	let landPromptLand;

	let roadPrompt;
	let roadPromptRoad;

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
				landPromptLand = land;
				landPrompt.open();
			},
			(road) => {
				roadPromptRoad = road;
				roadPrompt.open();
			}
		);
	});
</script>

<PromptFloat bind:this={landPrompt}>
	<div>토지 정보</div>
	<div class="info-row">
		<div class="info-key">이름</div>
		<div class="info-value">{landPromptLand.name}</div>
	</div>
	<div class="info-row">
		<div class="info-key">ID</div>
		<div class="info-value">{landPromptLand.id}</div>
	</div>
	<div class="info-row">
		<div class="info-key">위치</div>
		<div class="info-value">
			({landPromptLand.position.coordinates[0]}, {landPromptLand.position.coordinates[1]})
		</div>
	</div>
	<div class="info-row">
		<div class="info-key">색상</div>
		<div class="info-value">
			<span class="color-preview" style="background-color: #{landPromptLand.color};"></span>
			#{landPromptLand.color.toUpperCase()}
		</div>
	</div>
	<div class="info-row">
		<div class="info-key">주인</div>
		<div class="info-value">
			{landPromptLand.owner}
		</div>
	</div>
</PromptFloat>
<PromptFloat bind:this={roadPrompt}>
	<div>도로 정보</div>
	<div class="info-row">
		<div class="info-key">이름</div>
		<div class="info-value">{roadPromptRoad.name}</div>
	</div>
	<div class="info-row">
		<div class="info-key">ID</div>
		<div class="info-value">{roadPromptRoad.id}</div>
	</div>
	<div class="info-row">
		<div class="info-key">토지 A</div>
		<div class="info-value">{roadPromptRoad.land_a.name} #{roadPromptRoad.land_a.id}</div>
	</div>
	<div class="info-row">
		<div class="info-key">토지 B</div>
		<div class="info-value">{roadPromptRoad.land_b.name} #{roadPromptRoad.land_b.id}</div>
	</div>
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
	<div>도로를 만들기 위해서는 단위길이당 테인트 1개가 필요해.</div>
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
		height: 600px;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	.info-row {
		display: flex;
		margin: 0;
	}

	.info-key {
		font-weight: bold;
		margin-right: 8px;
		min-width: 60px;
	}

	.info-value {
		flex: 1;
	}

	.color-preview {
		display: inline-block;
		width: 16px;
		height: 16px;
		border: 1px solid #ccc;
		border-radius: 4px;
		vertical-align: middle;
		transform: translateY(-2px);
	}
</style>
