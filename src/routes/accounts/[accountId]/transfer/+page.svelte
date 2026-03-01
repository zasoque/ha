<script lang="ts">
	import { formatCurrency } from '$lib/util/economy';

	const { data } = $props();
	const { account } = data;

	let amount = 0;
	let toAccountId;

	async function transfer() {
		await fetch(`/api/v1/transactions/transfer`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				fromAccountId: account.id,
				toAccountId,
				amount
			})
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.success) {
					alert('송금이 완료되었습니다.');
					window.location.href = '/accounts';
				} else {
					alert('송금에 실패했습니다: ' + data.message);
				}
			})
			.catch((error) => {
				alert('송금 중 오류가 발생했습니다: ' + error.message);
			});
	}
</script>

<div>{account.id} 계좌에서 송금합니다.</div>
<div>현재 잔액: {formatCurrency(account.balance)}</div>
<div><input type="text" placeholder="송금할 계좌번호" bind:value={toAccountId} /></div>
<div><input type="number" min="0" step="0.01" bind:value={amount} placeholder="송금할 금액" /></div>
<div><button onclick={transfer}>송금하기</button></div>
