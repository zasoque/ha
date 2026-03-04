<script>
	import { onMount } from 'svelte';
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

		ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

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

			camera.x -= deltaX / camera.zoom;
			camera.y -= deltaY / camera.zoom;

			lastMousePos = { x: event.clientX, y: event.clientY };
			renderObjects();
		}
	}

	onMount(() => {
		ctx = canvas.getContext('2d');

		window.addEventListener('resize', resizeCanvas);
		canvas.addEventListener('wheel', wheelZoom);
		canvas.addEventListener('mousedown', mouseDown);
		canvas.addEventListener('mouseup', mouseUp);
		canvas.addEventListener('mousemove', mouseMove);

		resizeCanvas();

		return () => {
			window.removeEventListener('resize', resizeCanvas);
			canvas.removeEventListener('wheel', wheelZoom);
			canvas.removeEventListener('mousedown', mouseDown);
			canvas.removeEventListener('mouseup', mouseUp);
			canvas.removeEventListener('mousemove', mouseMove);
		};
	});
</script>

<canvas class="canvas" bind:this={canvas}></canvas>

<style>
	.canvas {
		width: 100%;
		height: calc(100vh - 200px);
	}
</style>
