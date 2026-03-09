<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import PromptFloat from '$lib/components/PromptFloat.svelte';

	let userId = $state('');
	let itemId = $state('');
	let quantity = $state(1);

	let giveItemPrompt: PromptFloat = $state()!;

	async function giveItem() {
		if (!userId || !itemId || quantity <= 0) {
			alert('모든 필드를 올바르게 입력해주세요!');
			return;
		}

		await fetch(`/api/v1/inventory/users/${userId}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ item_id: itemId, quantity })
		}).then((res) => {
			if (res.ok) {
				alert('아이템이 성공적으로 지급되었습니다!');
				userId = '';
				itemId = '';
				quantity = 1;
				giveItemPrompt.close();
			} else {
				res.json().then((data) => {
					alert(`아이템 지급 실패: ${data.error}`);
				});
			}
		});
	}
</script>

<Container>
	<div><a href="/admin">뒤로 가기</a></div>
	<Title>인벤토리</Title>
	<button onclick={giveItemPrompt.open}>아이템 주기</button>
</Container>
<PromptFloat bind:this={giveItemPrompt}>
	<div>아이템을 지급할 사용자 ID</div>
	<input type="text" placeholder="사용자 ID" bind:value={userId} />
	<div>지급할 아이템 ID</div>
	<input type="text" placeholder="아이템 ID" bind:value={itemId} />
	<div>지급할 수량</div>
	<input type="number" placeholder="수량" min="1" step="1" bind:value={quantity} />
	<button onclick={giveItem}>지급하기</button>
</PromptFloat>

<style>
	input {
		display: block;
		margin-top: 1rem;
		padding: 0.5rem;
		font-size: 1rem;
	}
</style>
