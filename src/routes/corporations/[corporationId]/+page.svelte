<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import PromptFloat from '$lib/components/PromptFloat.svelte';
	import Stock from '$lib/components/Stock.svelte';
	import { formatCurrency } from '$lib/util/economy';

	let { data } = $props();
	let corporation = $derived(() => data.corporation);
	let members = $derived(() => data.members);
	let inventory = $derived(() => data.inventory);
	let accounts = $derived(() => data.accounts);

	let addMemberPrompt: PromptFloat;
	let addMemberUserId = $state('');

	async function addMember() {
		if (!addMemberUserId) {
			alert('법인 멤버 ID를 입력해주세요.');
			return;
		}

		await fetch(`/api/v1/corporations/${corporation().id}/members`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ user_id: addMemberUserId })
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					addMemberPrompt.close();
					location.reload();
				} else {
					alert('실패: ' + data.message);
				}
			})
			.catch((err) => {
				alert('오류: ' + err.message);
			});
	}
</script>

<Container>
	<div><a href="/corporations">뒤로 가기</a></div>
	<Title>법인 상세</Title>
	<div>법인 본명: {corporation().id}</div>
	<ul>
		{#each members() as member}
			<li>{member.user_id}</li>
		{/each}
	</ul>
	<div><button onclick={addMemberPrompt.open}>법인 멤버 추가</button></div>
	<div>인벤토리</div>
	<div class="inventory">
		{#each inventory() as stock}
			<Stock {stock} />
		{/each}
	</div>
	<div>계좌</div>
	<ul>
		{#each accounts() as account}
			<li><a href="/accounts/{account.id}">{account.id} - {formatCurrency(account.balance)}</a></li>
		{/each}
	</ul>
</Container>
<PromptFloat bind:this={addMemberPrompt}>
	<div>법인 멤버 추가</div>
	<div>법인 멤버 ID</div>
	<input type="text" bind:value={addMemberUserId} />
	<button onclick={addMember}>추가</button>
</PromptFloat>
