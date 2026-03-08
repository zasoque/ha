let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

let lands: any[];
let buildings: any[];
let roads: any[];
let rails: any[];

let openLandPrompt: (land: any) => void;
let openRoadPrompt: (road: any) => void;
let openRailPrompt: (rail: any) => void;

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

	renderRails();
	renderRoads();
	renderLands();

	renderPath();

	renderScaleBar();
}

function renderRails() {
	rails.forEach((rail) => {
		const landAPosition = lands.find((l) => l.id === rail.land_a_id).position.coordinates;
		const landBPosition = lands.find((l) => l.id === rail.land_b_id).position.coordinates;
		const screenPosA = camera.convertWorldToScreen(landAPosition[0], landAPosition[1]);
		const screenPosB = camera.convertWorldToScreen(landBPosition[0], landBPosition[1]);

		ctx.strokeStyle = 'grey';
		ctx.lineWidth = 14 * window.devicePixelRatio;
		ctx.beginPath();
		ctx.moveTo(screenPosA.x, screenPosA.y);
		ctx.lineTo(screenPosB.x, screenPosB.y);
		ctx.stroke();

		ctx.strokeStyle = '#afdbff';
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
		let angle = Math.atan2(screenPosB.y - screenPosA.y, screenPosB.x - screenPosA.x);
		if (angle >= Math.PI / 2) angle -= Math.PI;
		if (angle <= -Math.PI / 2) angle += Math.PI;
		ctx.save();
		if (distance >= 75 * window.devicePixelRatio) {
			ctx.translate(midX, midY);
			ctx.rotate(angle);
			ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
			ctx.fillText(rail.name, 0, 0);
		}
		ctx.restore();
	});
}

function renderRoads() {
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
		let angle = Math.atan2(screenPosB.y - screenPosA.y, screenPosB.x - screenPosA.x);
		if (angle >= Math.PI / 2) angle -= Math.PI;
		if (angle <= -Math.PI / 2) angle += Math.PI;
		ctx.save();
		if (distance >= 75 * window.devicePixelRatio) {
			ctx.translate(midX, midY);
			ctx.rotate(angle);
			ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
			ctx.fillText(road.name, 0, 0);
		}
		ctx.restore();
	});
}

function lerpColor(a: string, b: string, t: number) {
	const colorA = parseInt(a, 16);
	const colorB = parseInt(b, 16);

	const r = Math.round((colorA >> 16) * (1 - t) + (colorB >> 16) * t);
	const g = Math.round(((colorA >> 8) & 0xff) * (1 - t) + ((colorB >> 8) & 0xff) * t);
	const blue = Math.round((colorA & 0xff) * (1 - t) + (colorB & 0xff) * t);

	return `#${((1 << 24) + (r << 16) + (g << 8) + blue).toString(16).slice(1)}`;
}

function renderLands() {
	lands.forEach((land) => {
		const screenPos = camera.convertWorldToScreen(
			land.position.coordinates[0],
			land.position.coordinates[1]
		);

		const buildingsOnIt = buildings.filter((b) => b.land_id === land.id);

		const renderRadius = 10 * Math.sqrt(buildingsOnIt.length + 1) * window.devicePixelRatio;

		ctx.strokeStyle = 'black';
		ctx.lineWidth = 2 * window.devicePixelRatio;
		ctx.fillStyle = lerpColor(land.color, 'ffffff', 0.5);
		ctx.beginPath();
		ctx.arc(screenPos.x, screenPos.y, renderRadius, 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();
	});

	lands.forEach((land) => {
		const buildingsOnIt = buildings.filter((b) => b.land_id === land.id);
		const renderRadius = 10 * Math.sqrt(buildingsOnIt.length + 1) * window.devicePixelRatio;
		if (camera.zoom >= 2000 / renderRadius) {
			const screenPos = camera.convertWorldToScreen(
				land.position.coordinates[0],
				land.position.coordinates[1]
			);

			ctx.font = `${12 * window.devicePixelRatio}px Arial`;
			ctx.fillStyle = 'black';
			ctx.textAlign = 'left';
			ctx.textBaseline = 'middle';
			ctx.save();
			ctx.translate(screenPos.x, screenPos.y);
			ctx.rotate((-15 * Math.PI) / 180);
			ctx.fillText(`${land.name} #${land.id}`, renderRadius + 4 * window.devicePixelRatio, 0);
			ctx.restore();
		}
	});
}

function renderPath() {
	if (path.length === 0) return;

	ctx.strokeStyle = 'white';
	ctx.lineWidth = 8 * window.devicePixelRatio;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	ctx.beginPath();
	path.forEach((land, index) => {
		const screenPos = camera.convertWorldToScreen(
			land.position.coordinates[0],
			land.position.coordinates[1]
		);
		if (index === 0) {
			ctx.moveTo(screenPos.x, screenPos.y);
		} else {
			ctx.lineTo(screenPos.x, screenPos.y);
		}
	});
	ctx.stroke();

	const lastLand = path[path.length - 1];
	const lastScreenPos = camera.convertWorldToScreen(
		lastLand.position.coordinates[0],
		lastLand.position.coordinates[1]
	);
	ctx.beginPath();
	ctx.arc(lastScreenPos.x, lastScreenPos.y, 12 * window.devicePixelRatio, 0, 2 * Math.PI);
	ctx.stroke();

	ctx.strokeStyle = '#007bff';
	ctx.lineWidth = 4 * window.devicePixelRatio;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	ctx.beginPath();
	path.forEach((land, index) => {
		const screenPos = camera.convertWorldToScreen(
			land.position.coordinates[0],
			land.position.coordinates[1]
		);
		if (index === 0) {
			ctx.moveTo(screenPos.x, screenPos.y);
		} else {
			ctx.lineTo(screenPos.x, screenPos.y);
		}
	});
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(lastScreenPos.x, lastScreenPos.y, 12 * window.devicePixelRatio, 0, 2 * Math.PI);
	ctx.stroke();
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

		camera.targetX -= deltaX / camera.zoom;
		camera.targetY -= deltaY / camera.zoom;

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

function getLandByCursorPosition(cursorPosition: { x: number; y: number }): any | undefined {
	return lands.find((land) => {
		const screenPos = camera.convertWorldToScreen(
			land.position.coordinates[0],
			land.position.coordinates[1]
		);
		const dx = cursorPosition.x - screenPos.x;
		const dy = cursorPosition.y - screenPos.y;
		const distance = Math.hypot(dx, dy);
		return distance < 50 * window.devicePixelRatio;
	});
}

function getRoadByCursorPosition(cursorPosition: { x: number; y: number }): any | undefined {
	return roads.find((road) => {
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
}

function getRailByCursorPosition(cursorPosition: { x: number; y: number }): any | undefined {
	return rails.find((rail) => {
		const landAPosition = lands.find((l) => l.id === rail.land_a_id).position.coordinates;
		const landBPosition = lands.find((l) => l.id === rail.land_b_id).position.coordinates;
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
}

function openPopup(cursorPosition: { x: number; y: number }): boolean {
	const land = getLandByCursorPosition(cursorPosition);

	if (land) {
		openLandPrompt(land);
		return true;
	}

	const road = getRoadByCursorPosition(cursorPosition);

	if (road) {
		openRoadPrompt(road);
		return true;
	}

	const rail = getRailByCursorPosition(cursorPosition);

	if (rail) {
		openRailPrompt(rail);
		return true;
	}

	return false;
}

async function copyToClipboard(text: string) {
	try {
		await navigator.clipboard.writeText(text);
	} catch (err) {}
}

async function doubleClick(event: MouseEvent) {
	const currentMousePos = getMousePosition(event);
	openPopup(currentMousePos);

	if (path.length > 0) {
		const content = path.map((l) => `${l.id}`).join('-');
		await copyToClipboard(content);
		path.length = 0;
	}
	render();
}

const path: any[] = [];

function click(event: MouseEvent) {
	const currentMousePos = getMousePosition(event);
	const land = getLandByCursorPosition(currentMousePos);

	if (!land) return;

	const lastLand = path[path.length - 1];

	if (land.id === lastLand?.id) {
		path.splice(path.length - 1, 1);
		return render();
	}

	if (path.length === 0) {
		path.push(land);
		return render();
	}

	// dijkstra's algorithm to find the shortest path between lastLand and clickedLand using roads and rails as edges
	const clickedLand = land;
	const distanceFromLastToClicked = Math.hypot(
		clickedLand.position.coordinates[0] - lastLand.position.coordinates[0],
		clickedLand.position.coordinates[1] - lastLand.position.coordinates[1]
	);
	const landsBetween = lands.filter((l) => {
		const distanceFromLast = Math.hypot(
			l.position.coordinates[0] - lastLand.position.coordinates[0],
			l.position.coordinates[1] - lastLand.position.coordinates[1]
		);
		return distanceFromLast < distanceFromLastToClicked * 2;
	});
	const roadsBetween = roads.filter((r) => {
		return (
			landsBetween.some((l) => l.id === r.land_a_id) &&
			landsBetween.some((l) => l.id === r.land_b_id)
		);
	});
	const railsBetween = rails.filter((r) => {
		return (
			landsBetween.some((l) => l.id === r.land_a_id) &&
			landsBetween.some((l) => l.id === r.land_b_id)
		);
	});

	const graph: Record<number, { land: any; edges: { landId: number; type: 'road' | 'rail' }[] }> =
		{};
	lands.forEach((l) => {
		graph[l.id] = { land: l, edges: [] };
	});
	roadsBetween.forEach((r) => {
		graph[r.land_a_id].edges.push({ landId: r.land_b_id, type: 'road' });
		graph[r.land_b_id].edges.push({ landId: r.land_a_id, type: 'road' });
	});
	railsBetween.forEach((r) => {
		graph[r.land_a_id].edges.push({ landId: r.land_b_id, type: 'rail' });
		graph[r.land_b_id].edges.push({ landId: r.land_a_id, type: 'rail' });
	});

	const queue = [{ landId: lastLand.id, path: [lastLand], cost: 0 }];
	const visited = new Set<number>();

	while (queue.length > 0) {
		queue.sort((a, b) => a.path.length - b.path.length);
		const current = queue.shift()!;
		if (current.landId === clickedLand.id) {
			path.push(...current.path.slice(1));
			return render();
		}
		if (visited.has(current.landId)) continue;
		visited.add(current.landId);

		graph[current.landId].edges.forEach((edge) => {
			if (!visited.has(edge.landId)) {
				const newCost = current.cost + (edge.type === 'road' ? 1 : 0.5);
				queue.push({
					landId: edge.landId,
					path: [...current.path, graph[edge.landId].land],
					cost: newCost
				});
			}
		});
	}
}

export function init(
	c: HTMLCanvasElement,
	ls: any[],
	bs: any[],
	rds: any[],
	rls: any[],
	onLandClick: (land: any) => void,
	onRoadClick: (road: any) => void,
	onRailClick: (rail: any) => void
) {
	canvas = c;
	ctx = c.getContext('2d')!;

	lands = ls;
	buildings = bs;
	roads = rds;
	rails = rls;

	openLandPrompt = onLandClick;
	openRoadPrompt = onRoadClick;
	openRailPrompt = onRailClick;

	window.addEventListener('resize', resizeCanvas);
	canvas.addEventListener('wheel', wheelZoom);
	canvas.addEventListener('mousedown', mouseDown);
	canvas.addEventListener('mouseup', mouseUp);
	canvas.addEventListener('mousemove', mouseMove);
	canvas.addEventListener('touchstart', touchStart);
	canvas.addEventListener('touchmove', touchMove);
	canvas.addEventListener('touchend', touchEnd);
	canvas.addEventListener('dblclick', doubleClick);
	canvas.addEventListener('click', click);

	const interval = setInterval(tick);

	resizeCanvas();

	return {
		clear: () => {
			window.removeEventListener('resize', resizeCanvas);
			canvas.removeEventListener('wheel', wheelZoom);
			canvas.removeEventListener('mousedown', mouseDown);
			canvas.removeEventListener('mouseup', mouseUp);
			canvas.removeEventListener('mousemove', mouseMove);
			canvas.removeEventListener('touchstart', touchStart);
			canvas.removeEventListener('touchmove', touchMove);
			canvas.removeEventListener('touchend', touchEnd);
			canvas.removeEventListener('dblclick', doubleClick);
			canvas.removeEventListener('click', click);
			clearInterval(interval);
		},
		path
	};
}
