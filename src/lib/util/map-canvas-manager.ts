let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

let lands: any[];
let buildings: any[];
let roads: any[];
let rails: any[];

let openLandPrompt: (land: any) => void;
let openRoadPrompt: (road: any) => void;

let camera = {
	x: 0,
	y: 0,
	targetX: 0,
	targetY: 0,
	targetZoom: 100,
	zoom: 100,
	convertScreenToWorld: (screenX: number, screenY: number) => {
		const worldX = (screenX - canvas.width / 2) / camera.zoom + camera.x;
		const worldY = (screenY - canvas.height / 2) / camera.zoom + camera.y;
		return { x: worldX, y: worldY };
	},
	convertWorldToScreen: (worldX: number, worldY: number) => {
		const screenX = (worldX - camera.x) * camera.zoom + canvas.width / 2;
		const screenY = (worldY - camera.y) * camera.zoom + canvas.height / 2;
		return { x: screenX, y: screenY };
	}
};

function getTouchPositions(event: TouchEvent) {
	const rect = canvas.getBoundingClientRect();

	if (event.touches.length === 0)
		return Array.from(event.changedTouches).map((touch) => ({
			x: (touch.clientX - rect.left) * window.devicePixelRatio,
			y: (touch.clientY - rect.top) * window.devicePixelRatio
		}));

	return Array.from(event.touches).map((touch) => ({
		x: (touch.clientX - rect.left) * window.devicePixelRatio,
		y: (touch.clientY - rect.top) * window.devicePixelRatio
	}));
}

function getMousePosition(event: MouseEvent) {
	const rect = canvas.getBoundingClientRect();
	return {
		x: (event.clientX - rect.left) * window.devicePixelRatio,
		y: (event.clientY - rect.top) * window.devicePixelRatio
	};
}

function lerp(start: number, end: number, t: number) {
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

function getNiceScaleLength(targetLength: number) {
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

	ctx.textAlign = 'left';
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

	console.log(canvas.width, canvas.height);

	render();
}

function wheelZoom(event: WheelEvent) {
	event.preventDefault();

	camera.targetZoom *= Math.exp(-event.deltaY * 0.001);
	if (camera.targetZoom < 0.1) camera.targetZoom = 0.1;
	if (camera.targetZoom > 1000) camera.targetZoom = 1000;

	render();
}

let isDragging = false;
let lastMousePos = { x: 0, y: 0 };

function mouseDown(event: MouseEvent) {
	isDragging = true;
	lastMousePos = getMousePosition(event);
}

function mouseUp() {
	isDragging = false;
}

function mouseMove(event: MouseEvent) {
	if (isDragging) {
		const currentMousePos = getMousePosition(event);
		const deltaX = currentMousePos.x - lastMousePos.x;
		const deltaY = currentMousePos.y - lastMousePos.y;

		camera.targetX -= (deltaX * window.devicePixelRatio) / camera.zoom;
		camera.targetY -= (deltaY * window.devicePixelRatio) / camera.zoom;

		lastMousePos = currentMousePos;
		render();
	}
}

let isZooming = false;
let lastTouchDistance = 0;
function touchStart(event: TouchEvent) {
	if (event.touches.length === 1) {
		isDragging = true;
		lastMousePos = getTouchPositions(event)[0];
	}

	if (event.touches.length === 2) {
		event.preventDefault();
		isZooming = true;
		const touchPositions = getTouchPositions(event);
		const dx = touchPositions[0].x - touchPositions[1].x;
		const dy = touchPositions[0].y - touchPositions[1].y;
		lastTouchDistance = Math.hypot(dx, dy);
	}
}

function touchMove(event: TouchEvent) {
	if (isDragging && event.touches.length >= 1) {
		event.preventDefault();

		const currentMousePos = getTouchPositions(event)[0];
		const deltaX = currentMousePos.x - lastMousePos.x;
		const deltaY = currentMousePos.y - lastMousePos.y;

		camera.targetX -= deltaX / camera.zoom;
		camera.targetY -= deltaY / camera.zoom;

		lastMousePos = getTouchPositions(event)[0];
		render();
	}

	if (isZooming && event.touches.length === 2) {
		const currentTouchPositions = getTouchPositions(event);
		const dx = currentTouchPositions[0].x - currentTouchPositions[1].x;
		const dy = currentTouchPositions[0].y - currentTouchPositions[1].y;
		const currentDistance = Math.sqrt(dx * dx + dy * dy);
		const zoomFactor = currentDistance / lastTouchDistance;

		camera.targetZoom *= zoomFactor;
		if (camera.targetZoom < 0.1) camera.targetZoom = 0.1;
		if (camera.targetZoom > 1000) camera.targetZoom = 1000;

		lastTouchDistance = currentDistance;
		render();
	}
}

function touchEnd(event: TouchEvent) {
	if (event.touches.length === 0) {
		isDragging = false;
	}

	if (event.touches.length < 2) {
		isZooming = false;
	}
}

function openPopup(cursorPosition: { x: number; y: number }) {
	const land = lands.find((land) => {
		const screenPos = camera.convertWorldToScreen(
			land.position.coordinates[0],
			land.position.coordinates[1]
		);
		const dx = cursorPosition.x - screenPos.x;
		const dy = cursorPosition.y - screenPos.y;
		const distance = Math.hypot(dx, dy);
		console.log(distance);
		return distance < 50 * window.devicePixelRatio;
	});

	if (land) {
		openLandPrompt(land);
	}

	if (!land) {
		const road = roads.find((road) => {
			const landAPosition = road.line.coordinates[0];
			const landBPosition = road.line.coordinates[1];
			const screenPosA = camera.convertWorldToScreen(landAPosition[0], landAPosition[1]);
			const screenPosB = camera.convertWorldToScreen(landBPosition[0], landBPosition[1]);

			const dx = screenPosB.x - screenPosA.x;
			const dy = screenPosB.y - screenPosA.y;
			const length = Math.hypot(dx, dy);
			const t =
				((cursorPosition.x - screenPosA.x) * dx + (cursorPosition.y - screenPosA.y) * dy) /
				(length * length);
			if (t < 0 || t > 1) return false;

			const closestX = screenPosA.x + t * dx;
			const closestY = screenPosA.y + t * dy;
			const distance = Math.hypot(cursorPosition.x - closestX, cursorPosition.y - closestY);
			return distance < 15 * window.devicePixelRatio;
		});

		if (road) {
			openRoadPrompt(road);
		}
	}

	render();
}

function doubleClick(event: MouseEvent) {
	const currentMousePos = getMousePosition(event);
	openPopup(currentMousePos);
}

export function init(
	c: HTMLCanvasElement,
	ls: any[],
	bs: any[],
	rds: any[],
	rls: any[],
	onLandClick: (land: any) => void,
	onRoadClick: (road: any) => void
) {
	canvas = c;
	ctx = c.getContext('2d')!;

	lands = ls;
	buildings = bs;
	roads = rds;
	rails = rls;

	openLandPrompt = onLandClick;
	openRoadPrompt = onRoadClick;

	window.addEventListener('resize', resizeCanvas);
	canvas.addEventListener('wheel', wheelZoom);
	canvas.addEventListener('mousedown', mouseDown);
	canvas.addEventListener('mouseup', mouseUp);
	canvas.addEventListener('mousemove', mouseMove);
	canvas.addEventListener('touchstart', touchStart);
	canvas.addEventListener('touchmove', touchMove);
	canvas.addEventListener('touchend', touchEnd);
	canvas.addEventListener('dblclick', doubleClick);

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
		canvas.removeEventListener('dblclick', doubleClick);
		clearInterval(interval);
	};
}
