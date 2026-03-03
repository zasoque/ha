<script lang="ts">
	import { formatCurrency } from '$lib/util/economy';

	const { data } = $props();
	const account = $derived(() => data.account);

	let amount = $state(0);
	let toAccountId = $state('');

	async function transfer() {
		await fetch(`/api/v1/transactions/transfer`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				fromAccountId: account().id,
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

<div class="container">
	<div class="subtitle">{account().id} 계좌에서 송금합니다.</div>
	<div class="title">송금</div>
	<div>현재 잔액: {formatCurrency(account().balance)}</div>
	<div><input type="text" placeholder="송금할 계좌번호" bind:value={toAccountId} /></div>
	<div>
		<input type="number" min="0" step="0.01" bind:value={amount} placeholder="송금할 금액" />
	</div>
	<div><button onclick={transfer}>송금하기</button></div>
</div>

<style>
	.container {
		max-width: var(--max-width);
		margin: 0 auto;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	input {
		padding: 0.5rem;
		font-size: 1rem;
		width: 100%;
		box-sizing: border-box;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	button {
		padding: 0.75rem;
		font-size: 1rem;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button:hover {
		background-color: #0056b3;
	}
</style>
