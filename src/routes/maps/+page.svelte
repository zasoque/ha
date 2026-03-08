<script>
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import PromptFloat from '$lib/components/PromptFloat.svelte';
	import { onMount } from 'svelte';
	import { init } from '$lib/util/map-canvas-manager';
	import { formatCurrency } from '$lib/util/economy';
	import AccountInput from '$lib/components/aci/AccountInput.svelte';
	import PersonInput from '$lib/components/aci/PersonInput.svelte';

	let { data } = $props();
	let { lands, buildings, roads, rails, me } = data;

	let canvas;

	let pathPrompt;
	let pathPromptPath;

	let landPrompt;
	let landPromptLand;
	let landPromptChangeColor = $state('#000000');
	let landPromptChangeName = $state('');

	function changeColor() {
		fetch(`/api/v1/maps/lands/${landPromptLand.id}/color`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				color: landPromptChangeColor.replace('#', ''),
				account_id: me.id
			})
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					location.reload();
				} else {
					alert('색상 변경에 실패했습니다: ' + data.message);
				}
			})
			.catch((err) => {
				alert('색상 변경 실패:', err);
			});
	}

	function changeName() {
		fetch(`/api/v1/maps/lands/${landPromptLand.id}/name`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: landPromptChangeName,
				account_id: me.id
			})
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					location.reload();
				} else {
					alert('이름 변경에 실패했습니다: ' + data.message);
				}
			})
			.catch((err) => {
				alert('이름 변경 실패:', err);
			});
	}

	let roadPrompt;
	let roadPromptRoad;

	let railPrompt;
	let railPromptRail;

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
	let addRoadOwnerId = $state(data.me?.id);
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
				owner_id: addRoadOwnerId,
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

	let addBuildingPrompt;
	let addBuildingName = $state('');
	let addBuildingLandId = $state(0);
	let addBuildingType = $state('');
	let addBuildingAccountId = $state(0);

	async function addBuilding() {
		await fetch(`/api/v1/maps/lands/${addBuildingLandId}/buildings`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: addBuildingName,
				type: addBuildingType,
				account_id: addBuildingAccountId
			})
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					location.reload();
				} else {
					alert('건물 추가에 실패했습니다: ' + data.message);
				}
			})
			.catch((err) => {
				console.error('건물 추가 실패:', err);
			});
	}

	let addRailPrompt;
	let addRailOwnerId = $state(data.me?.id);
	let addRailName = $state('');
	let addRailLandAId = $state(0);
	let addRailLandBId = $state(0);

	async function addRail() {
		await fetch('/api/v1/maps/rails', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				owner_id: addRailOwnerId,
				name: addRailName,
				land_a_id: addRailLandAId,
				land_b_id: addRailLandBId
			})
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					location.reload();
				} else {
					alert('철도 추가에 실패했습니다: ' + data.message);
				}
			})
			.catch((err) => {
				console.error('철도 추가 실패:', err);
			});
	}

	let harvestPrompt;
	let harvestPromptBuilding = $state(0);

	async function harvest() {
		await fetch(`/api/v1/maps/buildings/${harvestPromptBuilding}/harvest`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					alert(`테인트 ${data.quantity}개를를 획득했어!`);
				} else {
					alert('수확에 실패했습니다: ' + data.message);
				}
			})
			.catch((err) => {
				console.error('수확 실패:', err);
			});
	}

	function calculateDistanceOfRoad(road) {
		const dx = road.land_a.position.coordinates[0] - road.land_b.position.coordinates[0];
		const dy = road.land_a.position.coordinates[1] - road.land_b.position.coordinates[1];
		return Math.hypot(dx, dy).toFixed(2);
	}

	function calculateDistanceOfRail(rail) {
		const landA = lands.find((land) => land.id === rail.land_a_id).position.coordinates;
		const landB = lands.find((land) => land.id === rail.land_b_id).position.coordinates;
		const dx = landA[0] - landB[0];
		const dy = landA[1] - landB[1];
		return Math.hypot(dx, dy).toFixed(2);
	}

	function getPathDistance(path) {
		let distance = 0;
		for (let i = 0; i < path.length - 1; i++) {
			const landA = path[i];
			const landB = path[i + 1];
			const dx = landA.position.coordinates[0] - landB.position.coordinates[0];
			const dy = landA.position.coordinates[1] - landB.position.coordinates[1];
			distance += Math.hypot(dx, dy);
		}
		return distance.toFixed(2);
	}

	async function getPathFee(path) {
		return await fetch(`/api/v1/maps/path/${getPathCode(path)}`)
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					return formatCurrency(data.fee);
				} else {
					return '수수료 정보를 가져오는데 실패했어.';
				}
			})
			.catch((err) => {
				console.error('수수료 정보 가져오기 실패:', err);
				return '수수료 정보를 가져오는데 실패했어.';
			});
	}

	function getPathCode(path) {
		return path.map((land) => `${land.id}`).join('-');
	}

	let investFertilityPrompt;
	let investFertilityLandId = $state(0);
	let investFertilityLevel = $state(0);
	let investFertilityAccountId = $state(0);

	async function investFertility() {
		await fetch(
			`/api/v1/maps/lands/${investFertilityLandId}/fertility?level=${investFertilityLevel}&account_id=${investFertilityAccountId}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			}
		)
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					alert(`땅의 비옥도는 ${data.min}에서 ${data.max} 사이야.`);
				} else {
					alert('비옥도 조사를 실패했습니다: ' + data.message);
				}
			})
			.catch((err) => {
				console.error('비옥도 조사 실패:', err);
			});
	}

	let investSolidityPrompt;
	let investSolidityLandId = $state(0);
	let investSolidityLevel = $state(0);
	let investSolidityAccountId = $state(0);

	async function investSolidity() {
		await fetch(
			`/api/v1/maps/lands/${investSolidityLandId}/solidity?level=${investSolidityLevel}&account_id=${investSolidityAccountId}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			}
		)
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					alert(`땅의 강도는 ${data.min}에서 ${data.max} 사이야.`);
				} else {
					alert('강도 조사를 실패했습니다: ' + data.message);
				}
			})
			.catch((err) => {
				console.error('강도 조사 실패:', err);
			});
	}

	onMount(() => {
		data = init(
			canvas,
			lands,
			buildings,
			roads,
			rails,
			(land) => {
				landPromptLand = land;
				landPromptChangeColor = `#${land.color}`;
				landPromptChangeName = land.name;
				landPrompt.open();
			},
			(road) => {
				roadPromptRoad = road;
				roadPrompt.open();
			},
			(rail) => {
				railPromptRail = rail;
				railPrompt.open();
			}
		);

		pathPromptPath = data.path;

		return data.clear;
	});
</script>

<PromptFloat bind:this={pathPrompt}>
	<div>경로 정보</div>
	{#if pathPromptPath.length === 0}
		<div>경로가 없어.</div>
	{:else}
		<div class="info-row">
			<div class="info-key">출발</div>
			<div class="info-value">{pathPromptPath[0].name} #{pathPromptPath[0].id}</div>
		</div>
		<div class="info-row">
			<div class="info-key">도착</div>
			<div class="info-value">
				{pathPromptPath[pathPromptPath.length - 1].name}
				#{pathPromptPath[pathPromptPath.length - 1].id}
			</div>
		</div>
		<div class="info-row">
			<div class="info-key">총 거리</div>
			<div class="info-value">{getPathDistance(pathPromptPath)}</div>
		</div>
		<div class="info-row">
			<div class="info-key">수수료</div>
			<div class="info-value">
				{#await getPathFee(pathPromptPath)}
					불러오는 중...
				{:then fee}
					{fee}
				{:catch error}
					수수료 정보를 가져오는데 실패했어.
				{/await}
			</div>
		</div>
		<div class="info-row">
			<div class="info-key">경로코드</div>
			<div class="info-value">{getPathCode(pathPromptPath)}</div>
		</div>
	{/if}
</PromptFloat>
<PromptFloat bind:this={landPrompt}>
	<div>토지 정보</div>
	<div class="info-row">
		<div class="info-key">이름</div>
		<div class="info-value">
			<input
				bind:value={landPromptChangeName}
				class="input-text"
				disabled={landPromptLand.owner_id !== me.id}
			/>
			{#if landPromptLand.owner_id === me.id}
				<button onclick={changeName}>이름 변경</button>
			{/if}
		</div>
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
			#{landPromptLand.color.toUpperCase()}
			<input
				type="color"
				bind:value={landPromptChangeColor}
				class="color-preview"
				disabled={landPromptLand.owner_id !== me.id}
			/>
			{#if landPromptLand.owner_id === me.id}
				<button onclick={changeColor}>색상 변경</button>
			{/if}
		</div>
	</div>
	<div class="info-row">
		<div class="info-key">주인</div>
		<div class="info-value">
			{landPromptLand.owner}
		</div>
	</div>
	<div class="info-row">
		<div class="info-key">건물</div>
		<div class="info-value">
			{#if landPromptLand.buildings.length === 0}
				(건물이 없어)
			{:else}
				{#each landPromptLand.buildings as building}
					<div>{building.name} (ID: {building.id}, 종류: {building.type})</div>
				{/each}
			{/if}
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
	<div class="info-row">
		<div class="info-key">도로 길이</div>
		<div class="info-value">{calculateDistanceOfRoad(roadPromptRoad)}</div>
	</div>
</PromptFloat>
<PromptFloat bind:this={railPrompt}>
	<div>철도 정보</div>
	<div class="info-row">
		<div class="info-key">이름</div>
		<div class="info-value">{railPromptRail.name}</div>
	</div>
	<div class="info-row">
		<div class="info-key">ID</div>
		<div class="info-value">{railPromptRail.id}</div>
	</div>
	<div class="info-row">
		<div class="info-key">토지 A</div>
		<div class="info-value">{railPromptRail.land_a.name} #{railPromptRail.land_a.id}</div>
	</div>
	<div class="info-row">
		<div class="info-key">토지 B</div>
		<div class="info-value">{railPromptRail.land_b.name} #{railPromptRail.land_b.id}</div>
	</div>
	<div class="info-row">
		<div class="info-key">철도 길이</div>
		<div class="info-value">{calculateDistanceOfRail(railPromptRail)}</div>
	</div>
</PromptFloat>
<PromptFloat bind:this={addLandPrompt}>
	<div>토지 추가</div>
	<div>이름</div>
	<input type="text" bind:value={addLandName} />
	<div>위치</div>
	<input type="number" bind:value={addLandPosition.x} step="0.01" placeholder="X 좌표" />
	<input type="number" bind:value={addLandPosition.y} step="0.01" placeholder="Y 좌표" />
	<div>색상</div>
	<input type="color" bind:value={addLandColor} />
	<div>계좌번호 (토지를 만들기 위해서는 2냥이 필요해.)</div>
	<AccountInput bind:value={addLandAccountId} />
	<button onclick={addLand}>추가</button>
</PromptFloat>
<PromptFloat bind:this={addBuildingPrompt}>
	<div>건물 추가</div>
	<div>이름</div>
	<input type="text" bind:value={addBuildingName} />
	<div>토지 ID</div>
	<input type="number" bind:value={addBuildingLandId} placeholder="토지 ID" />
	<div>건물 종류</div>
	<div>농장은 5, 주거는 8, 사무는 10, 시장은 20개 테인트가 필요해.</div>
	<select bind:value={addBuildingType}>
		<option value="" disabled selected>건물 종류 선택</option>
		<option>농장</option>
		<option>주거</option>
		<option>사무</option>
		<option>시장</option>
	</select>
	<div>계좌번호 (거주지를 등록할 때에는 층의 제곱 &times; 30푼만큼 내야 해)</div>
	<AccountInput bind:value={addBuildingAccountId} />
	<button onclick={addBuilding}>추가</button>
</PromptFloat>
<PromptFloat bind:this={addRoadPrompt}>
	<div>도로 추가</div>
	<div>도로를 만들기 위해서는 단위길이당 테인트 1개가 필요해.</div>
	<div>건축주</div>
	<PersonInput bind:value={addRoadOwnerId} />
	<div>이름</div>
	<input type="text" bind:value={addRoadName} />
	<div>토지 A ID</div>
	<input type="number" bind:value={addRoadLandAId} placeholder="토지 A ID" />
	<div>토지 B ID</div>
	<input type="number" bind:value={addRoadLandBId} placeholder="토지 B ID" />
	<button onclick={addRoad}>추가</button>
</PromptFloat>
<PromptFloat bind:this={addRailPrompt}>
	<div>철도 추가</div>
	<div>철도를 만들기 위해서는 단위길이당 테인트 20개가 필요해.</div>
	<div>건축주</div>
	<PersonInput bind:value={addRailOwnerId} />
	<div>이름</div>
	<input type="text" bind:value={addRailName} />
	<div>토지 A ID</div>
	<input type="number" bind:value={addRailLandAId} placeholder="토지 A ID" />
	<div>토지 B ID</div>
	<input type="number" bind:value={addRailLandBId} placeholder="토지 B ID" />
	<button onclick={addRail}>추가</button>
</PromptFloat>
<PromptFloat bind:this={harvestPrompt}>
	<div>수확</div>
	<div>건물 ID</div>
	<input type="number" bind:value={harvestPromptBuilding} placeholder="건물 ID" />
	<button onclick={harvest}>수확</button>
</PromptFloat>
<PromptFloat bind:this={investFertilityPrompt}>
	<div>비옥도 조사</div>
	<div>토지 ID</div>
	<input type="number" bind:value={investFertilityLandId} placeholder="토지 ID" />
	<div>조사 레벨</div>
	<input type="number" bind:value={investFertilityLevel} placeholder="조사 레벨" />
	<div>계좌번호</div>
	<AccountInput bind:value={investFertilityAccountId} />
	<button onclick={investFertility}>조사</button>
</PromptFloat>
<PromptFloat bind:this={investSolidityPrompt}>
	<div>강도 조사</div>
	<div>토지 ID</div>
	<input type="number" bind:value={investSolidityLandId} placeholder="토지 ID" />
	<div>조사 레벨</div>
	<input type="number" bind:value={investSolidityLevel} placeholder="조사 레벨" />
	<div>계좌번호</div>
	<AccountInput bind:value={investSolidityAccountId} />
	<button onclick={investSolidity}>조사</button>
</PromptFloat>

<Container>
	<Title>하 지도</Title>
	<canvas class="canvas" bind:this={canvas}></canvas>
	<button onclick={addLandPrompt.open}>토지 추가</button>
	<button onclick={addBuildingPrompt.open}>건물 추가</button>
	<button onclick={addRoadPrompt.open}>도로 추가</button>
	<button onclick={addRailPrompt.open}>철도 추가</button>
	<button onclick={harvestPrompt.open}>수확</button>
	<button onclick={pathPrompt.open}>경로</button>
	<button onclick={investFertilityPrompt.open}>비옥도 조사</button>
	<button onclick={investSolidityPrompt.open}>강도 조사</button>
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
		border: none;
		padding: 0;
		display: inline-block;
		width: 20px;
		height: 20px;
		margin-bottom: 0;
	}

	.input-text {
		padding: 0;
		border: none;
		margin-bottom: 0;
		border-radius: 0;
		border-bottom: 1px solid transparent;
		transition: border 0.3s;
	}

	.input-text:hover {
		border-bottom: 1px solid #aaa;
	}

	.input-text:focus {
		outline: none;
		border-bottom: 2px solid #007bff;
	}
</style>
