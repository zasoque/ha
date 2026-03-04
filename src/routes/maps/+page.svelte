<script>
	import { onMount } from 'svelte';

	let { data } = $props();
	let { lands, buildings, roads, rails } = data;

	let canvas;
	let ctx;

	let camera = {
		x: 0,
		y: 0,
		zoom: 100,
		convertScreenToWorld: (screenX, screenY) => {
			const worldX = (screenX - canvas.width / 2) / camera.zoom + camera.x;
			const worldY = (screenY - canvas.height / 2) / camera.zoom + camera.y;
			return { x: worldX, y: worldY };
		},
		convertWorldToScreen: (worldX, worldY) => {
			const screenX = (worldX - camera.x) * camera.zoom + canvas.width / 2;
			const screenY = (worldY - camera.y) * camera.zoom + canvas.height / 2;
			return { x: screenX, y: screenY };
		}
	};

	const objects = [
		{ x: 1, y: 1, r: 0.5 },
		{ x: -1, y: -1, r: 0.5 },
		{ x: 2, y: -1.5, r: 0.5 },
		{ x: -1.5, y: 2, r: 0.5 }
	];

	function renderObjects() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		objects.forEach((obj) => {
			const screenPos = camera.convertWorldToScreen(obj.x, obj.y);
			ctx.beginPath();
			ctx.arc(screenPos.x, screenPos.y, obj.r * camera.zoom, 0, Math.PI * 2);
			ctx.fillStyle = 'blue';
			ctx.fill();
		});
	}

	function resizeCanvas() {
		canvas.width = window.innerWidth * window.devicePixelRatio;
		canvas.height = (window.innerHeight - 200) * window.devicePixelRatio;

		renderObjects();
	}

	function wheelZoom(event) {
		event.preventDefault();

		camera.x += (event.clientX - canvas.width / 2) / camera.zoom;
		camera.y += (event.clientY - canvas.height / 2) / camera.zoom;

		camera.zoom *= Math.exp(-event.deltaY * 0.001);
		if (camera.zoom < 10) camera.zoom = 10;
		if (camera.zoom > 1000) camera.zoom = 1000;

		camera.x -= (event.clientX - canvas.width / 2) / camera.zoom;
		camera.y -= (event.clientY - canvas.height / 2) / camera.zoom;

		renderObjects();
	}

	let isDragging = false;
	let lastMousePos = { x: 0, y: 0 };

	function mouseDown(event) {
		isDragging = true;
		lastMousePos = { x: event.clientX, y: event.clientY };
	}

	function mouseUp() {
		isDragging = false;
	}

	function mouseMove(event) {
		if (isDragging) {
			const deltaX = event.clientX - lastMousePos.x;
			const deltaY = event.clientY - lastMousePos.y;

			camera.x -= (deltaX * window.devicePixelRatio) / camera.zoom;
			camera.y -= (deltaY * window.devicePixelRatio) / camera.zoom;

			lastMousePos = { x: event.clientX, y: event.clientY };
			renderObjects();
		}
	}

	let isZooming = false;
	let lastTouchDistance = 0;
	function touchStart(event) {
		if (event.touches.length === 1) {
			isDragging = true;
			lastMousePos = { x: event.touches[0].clientX, y: event.touches[0].clientY };
		}

		if (event.touches.length === 2) {
			event.preventDefault();
			isZooming = true;
			const dx = event.touches[0].clientX - event.touches[1].clientX;
			const dy = event.touches[0].clientY - event.touches[1].clientY;
			lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
		}
	}

	function touchMove(event) {
		if (isDragging && event.touches.length >= 1) {
			const deltaX = event.touches[0].clientX - lastMousePos.x;
			const deltaY = event.touches[0].clientY - lastMousePos.y;

			camera.x -= (deltaX * window.devicePixelRatio) / camera.zoom;
			camera.y -= (deltaY * window.devicePixelRatio) / camera.zoom;

			lastMousePos = { x: event.touches[0].clientX, y: event.touches[0].clientY };
			renderObjects();
		}

		if (isZooming && event.touches.length === 2) {
			const dx = event.touches[0].clientX - event.touches[1].clientX;
			const dy = event.touches[0].clientY - event.touches[1].clientY;
			const currentDistance = Math.sqrt(dx * dx + dy * dy);
			const zoomFactor = currentDistance / lastTouchDistance;

			camera.zoom *= zoomFactor;
			if (camera.zoom < 10) camera.zoom = 10;
			if (camera.zoom > 1000) camera.zoom = 1000;

			lastTouchDistance = currentDistance;
			renderObjects();
		}
	}

	function touchEnd(event) {
		if (event.touches.length === 0) {
			isDragging = false;
		}

		if (event.touches.length < 2) {
			isZooming = false;
		}
	}

	onMount(() => {
		ctx = canvas.getContext('2d');

		window.addEventListener('resize', resizeCanvas);
		canvas.addEventListener('wheel', wheelZoom);
		canvas.addEventListener('mousedown', mouseDown);
		canvas.addEventListener('mouseup', mouseUp);
		canvas.addEventListener('mousemove', mouseMove);
		canvas.addEventListener('touchstart', touchStart);
		canvas.addEventListener('touchmove', touchMove);
		canvas.addEventListener('touchend', touchEnd);

		resizeCanvas();

		return () => {
			window.removeEventListener('resize', resizeCanvas);
			canvas.removeEventListener('wheel', wheelZoom);
			canvas.removeEventListener('mousedown', mouseDown);
			canvas.removeEventListener('mouseup', mouseUp);
			canvas.removeEventListener('mousemove', mouseMove);
			canvas.removeEventListener('touchstart', touchStart);
			canvas.removeEventListener('touchmove', touchMove);
			canvas.removeEventListener('touchend', touchEnd);
		};
	});
</script>

<canvas class="canvas" bind:this={canvas}></canvas>
<div>
	<pre>{JSON.stringify(data, null, 2)}</pre>
</div>

<style>
	.canvas {
		width: 100%;
		height: calc(100vh - 200px);
	}
</style>
