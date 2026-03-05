<script>
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import PromptFloat from '$lib/components/PromptFloat.svelte';
	import { onMount } from 'svelte';
	import { init } from '$lib/util/map-canvas-manager';

	let { data } = $props();
	let { lands, buildings, roads, rails } = data;

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

<Container>
	<Title>하 지도</Title>
	<canvas class="canvas" bind:this={canvas}></canvas>
</Container>

<style>
	.canvas {
		width: 100%;
		height: calc(100vh - 200px);
		border: 1px solid #ccc;
		border-radius: 4px;
	}
</style>
