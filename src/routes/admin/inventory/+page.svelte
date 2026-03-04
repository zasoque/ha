<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';

	let userId = $state('');
	let itemId = $state('');
	let quantity = $state(1);

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
			} else {
				res.json().then((data) => {
					alert(`아이템 지급 실패: ${data.error}`);
				});
			}
		});
	}
</script>

<Container>
	<Title>인벤토리</Title>
	<input type="text" placeholder="이용자 ID" bind:value={userId} />
	<input type="text" placeholder="아이템 ID" bind:value={itemId} />
	<input type="number" placeholder="수량" bind:value={quantity} />
	<button onclick={giveItem}>아이템 주기</button>
</Container>

<style>
	input {
		display: block;
		margin-top: 1rem;
		padding: 0.5rem;
		font-size: 1rem;
	}
</style>
