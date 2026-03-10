<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import PromptFloat from '$lib/components/PromptFloat.svelte';

	let addPrompt = $state()! as PromptFloat;
	let addLandName = $state('');
	let addLandOwnerId = $state('');
	let addLandX = $state(0);
	let addLandY = $state(0);
	let addLandColor = $state('#ffffff');

	async function addLand() {
		await fetch('/api/v1/maps/lands', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: addLandName,
				owner_id: addLandOwnerId,
				x: addLandX,
				y: addLandY,
				color: addLandColor.substring(1)
			})
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					addPrompt.close();
				} else {
					alert('토지 추가에 실패했습니다. ' + data.message);
				}
			})
			.catch((err) => {
				alert('토지 추가에 실패했습니다. ' + err.message);
			});
	}
</script>

<Container>
	<div><a href="/admin/maps">뒤로 가기</a></div>
	<Title>토지 관리</Title>
	<button onclick={addPrompt.open}>토지 추가</button>
</Container>
<PromptFloat bind:this={addPrompt}>
	<div>토지 이름</div>
	<input type="text" placeholder="토지 이름" bind:value={addLandName} />
	<div>토지 소유자 ID</div>
	<input type="text" placeholder="토지 소유자 ID" bind:value={addLandOwnerId} />
	<div>토지 x 좌표</div>
	<input type="number" placeholder="토지 x 좌표" step="0.01" bind:value={addLandX} />
	<div>토지 y 좌표</div>
	<input type="number" placeholder="토지 y 좌표" step="0.01" bind:value={addLandY} />
	<div>토지 색상</div>
	<input type="color" bind:value={addLandColor} />
	<button onclick={addLand}>추가</button>
</PromptFloat>
