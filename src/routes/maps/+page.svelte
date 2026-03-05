<script>
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import { onMount } from 'svelte';

	let { data } = $props();
	let { lands, buildings, roads, rails } = data;

	let canvas;
	let ctx;

	let camera = {
		x: 0,
		y: 0,
		targetX: 0,
		targetY: 0,
		targetZoom: 100,
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

	function getNiceScaleLength(targetLength) {
		const niceNumbers = [1, 2, 5];
		const exponent = Math.floor(Math.log10(targetLength));
		const base = Math.pow(10, exponent);
		for (let i = 0; i < niceNumbers.length; i++) {
			const niceLength = niceNumbers[i] * base;
			if (niceLength >= targetLength) {
				return niceLength;
			}
		}
		return 10 * base; // Fallback to the next order of magnitude
	}

	function lerp(start, end, t) {
		return start + (end - start) * t;
	}

	let previousTimestamp = 0;
	function tick() {
		const fps = 1000 / (performance.now() - previousTimestamp);

		let needsRender = false;

		if (Math.abs(camera.targetX - camera.x) > 0.01) needsRender = true;
		if (Math.abs(camera.targetY - camera.y) > 0.01) needsRender = true;
		if (Math.abs(Math.log(camera.targetZoom / camera.zoom)) > 0.01) needsRender = true;

		previousTimestamp = performance.now();
		if (!needsRender) return;

		const t = 10 / fps;
		camera.x = lerp(camera.x, camera.targetX, t);
		camera.y = lerp(camera.y, camera.targetY, t);
		camera.zoom *= Math.exp(lerp(0, Math.log(camera.targetZoom / camera.zoom), t));

		render();
	}

	function render() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		roads.forEach((road) => {
			const landAPosition = road.line.coordinates[0];
			const landBPosition = road.line.coordinates[1];
			const screenPosA = camera.convertWorldToScreen(landAPosition[0], landAPosition[1]);
			const screenPosB = camera.convertWorldToScreen(landBPosition[0], landBPosition[1]);

			ctx.strokeStyle = 'grey';
			ctx.lineWidth = 14 * window.devicePixelRatio;
			ctx.beginPath();
			ctx.moveTo(screenPosA.x, screenPosA.y);
			ctx.lineTo(screenPosB.x, screenPosB.y);
			ctx.stroke();

			ctx.strokeStyle = 'white';
			ctx.lineWidth = 12 * window.devicePixelRatio;
			ctx.beginPath();
			ctx.moveTo(screenPosA.x, screenPosA.y);
			ctx.lineTo(screenPosB.x, screenPosB.y);
			ctx.stroke();

			ctx.fillStyle = 'black';
			ctx.font = `${12 * window.devicePixelRatio}px Arial`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			const midX = (screenPosA.x + screenPosB.x) / 2;
			const midY = (screenPosA.y + screenPosB.y) / 2;
			const distance = Math.hypot(screenPosB.x - screenPosA.x, screenPosB.y - screenPosA.y);
			const angle = Math.atan2(screenPosB.y - screenPosA.y, screenPosB.x - screenPosA.x);
			ctx.save();
			if (distance >= 75 * window.devicePixelRatio) {
				ctx.translate(midX, midY);
				ctx.rotate(angle);
				ctx.fillText(road.name, 0, 0);
			}
			ctx.restore();
		});

		lands.forEach((land) => {
			const screenPos = camera.convertWorldToScreen(
				land.position.coordinates[0],
				land.position.coordinates[1]
			);

			const renderRadius = 10 * window.devicePixelRatio;

			ctx.strokeStyle = 'black';
			ctx.lineWidth = 2 * window.devicePixelRatio;
			ctx.fillStyle = `#${land.color}`;
			ctx.beginPath();
			ctx.arc(screenPos.x, screenPos.y, renderRadius, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();

			if (camera.zoom >= 50) {
				ctx.font = `${12 * window.devicePixelRatio}px Arial`;
				ctx.fillStyle = 'black';
				ctx.textAlign = 'left';
				ctx.textBaseline = 'middle';
				ctx.fillText(
					land.name,
					screenPos.x + renderRadius + 5 * window.devicePixelRatio,
					screenPos.y
				);
			}
		});

		renderScaleBar();
	}

	function renderScaleBar() {
		const targetLengthInScreen = 75 * window.devicePixelRatio;
		const targetLengthInWorld = targetLengthInScreen / camera.zoom;
		const niceLength = getNiceScaleLength(targetLengthInWorld);

		ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
		ctx.fillRect(10, canvas.height - 50, niceLength * camera.zoom + 20, 30);

		ctx.beginPath();
		ctx.moveTo(20, canvas.height - 30);
		ctx.lineTo(20 + niceLength * camera.zoom, canvas.height - 30);
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 2;
		ctx.stroke();

		ctx.font = `${12 * window.devicePixelRatio}px Arial`;
		ctx.fillStyle = 'black';
		ctx.textAlign = 'right';
		ctx.textBaseline = 'bottom';
		ctx.fillText(`${niceLength}`, 20 + niceLength * camera.zoom, canvas.height - 30);

		ctx.strokeStyle = 'rgb(0, 0, 0, 0.1)';
		ctx.lineWidth = 1;
		ctx.font = `${10 * window.devicePixelRatio}px Arial`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		const startingScreenX = camera.convertWorldToScreen(0, 0).x % (niceLength * camera.zoom);
		for (let x = startingScreenX; x < canvas.width; x += niceLength * camera.zoom) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, canvas.height);
			ctx.stroke();
			ctx.fillText(
				`${Math.round((camera.x + (x - canvas.width / 2) / camera.zoom) / niceLength) * niceLength}`,
				x,
				canvas.height - 10
			);
		}
		const startingScreenY = camera.convertWorldToScreen(0, 0).y % (niceLength * camera.zoom);
		for (let y = startingScreenY; y < canvas.height; y += niceLength * camera.zoom) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(canvas.width, y);
			ctx.stroke();
			ctx.fillText(
				`${Math.round((camera.y + (y - canvas.height / 2) / camera.zoom) / niceLength) * niceLength}`,
				10,
				y
			);
		}
	}

	function resizeCanvas() {
		canvas.width = canvas.clientWidth * window.devicePixelRatio;
		canvas.height = canvas.clientHeight * window.devicePixelRatio;

		render();
	}

	function wheelZoom(event) {
		event.preventDefault();

		camera.targetZoom *= Math.exp(-event.deltaY * 0.001);
		if (camera.targetZoom < 1) camera.targetZoom = 1;
		if (camera.targetZoom > 1000) camera.targetZoom = 1000;

		render();
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

			camera.targetX -= (deltaX * window.devicePixelRatio) / camera.zoom;
			camera.targetY -= (deltaY * window.devicePixelRatio) / camera.zoom;

			lastMousePos = { x: event.clientX, y: event.clientY };
			render();
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

			camera.targetX -= (deltaX * window.devicePixelRatio) / camera.zoom;
			camera.targetY -= (deltaY * window.devicePixelRatio) / camera.zoom;

			lastMousePos = { x: event.touches[0].clientX, y: event.touches[0].clientY };
			render();
		}

		if (isZooming && event.touches.length === 2) {
			const dx = event.touches[0].clientX - event.touches[1].clientX;
			const dy = event.touches[0].clientY - event.touches[1].clientY;
			const currentDistance = Math.sqrt(dx * dx + dy * dy);
			const zoomFactor = currentDistance / lastTouchDistance;

			camera.targetZoom *= zoomFactor;
			if (camera.targetZoom < 10) camera.targetZoom = 10;
			if (camera.targetZoom > 1000) camera.targetZoom = 1000;

			lastTouchDistance = currentDistance;
			render();
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

		const interval = setInterval(tick);

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
			clearInterval(interval);
		};
	});
</script>

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
