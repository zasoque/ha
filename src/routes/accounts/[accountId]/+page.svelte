<script lang="ts">
	import { formatCurrency } from '$lib/util/economy';
	import PromptFloat from '$lib/components/PromptFloat.svelte';

	const { data } = $props();
	const account = $derived(() => data.account);
	const transactions = $derived(() => data.transactions);
	const person = $derived(() => data.person);

	function deleteAccount() {
		fetch(`/api/v1/accounts/${account().id}`, {
			method: 'DELETE'
		}).then((response) => {
			if (response.ok) {
				window.location.href = '/accounts';
			} else {
				alert('계좌 삭제에 실패했습니다.');
			}
		});
	}

	let transferPrompt;

	async function transferButton() {
		const toAccountId = parseInt(document.getElementById('toAccountId').value);
		const amount = parseFloat(document.getElementById('amount').value);
		const description = document.getElementById('description').value;
		const path = document.getElementById('path').value;

		if (isNaN(toAccountId) || isNaN(amount)) {
			alert('모든 필드를 올바르게 입력해주세요.');
			return;
		}

		await transfer(toAccountId, amount, description.length === 0 ? null : description, path);
	}

	async function transfer(
		toAccountId: number,
		amount: number,
		description: string | null,
		path: string
	) {
		await fetch(`/api/v1/transactions/transfer`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				fromAccountId: account().id,
				toAccountId,
				amount,
				description,
				path
			})
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.success) {
					window.reload();
				} else {
					console.log(data);
					alert('송금에 실패했습니다: ' + data.message);
				}
			})
			.catch((error) => {
				alert('송금 중 오류가 발생했습니다: ' + error.message);
			});
	}
</script>

<div class="container">
	<div class="go-back">
		<a href="/accounts">목록으로 돌아가기</a>
	</div>
	<div class="title">계좌 상세</div>
	<div class="account-id">
		<div class="row-key">주인</div>
		<div class="row-value">{person().name} ({account().user_id})</div>
	</div>
	<div class="account-id">
		<div class="row-key">계좌번호</div>
		<div class="row-value">{account().id}</div>
	</div>
	<div class="balance">
		<div class="row-key">잔액</div>
		<div class="row-value">{formatCurrency(account().balance)}</div>
	</div>
	<div class="created-at">
		<div class="row-key">개설일자</div>
		<div class="row-value">{new Date(account().created_at).toLocaleString()}</div>
	</div>
	<div class="updated-at">
		<div class="row-key">갱신일자</div>
		<div class="row-value">{new Date(account().updated_at).toLocaleString()}</div>
	</div>
	<div class="transfer">
		<button onclick={transferPrompt.open}>송금</button>
	</div>
	<div class="transactions">
		{#each transactions() as transaction}
			<div class="transaction">
				<div class="row-key">거래 ID</div>
				<div class="row-value">{transaction.id}</div>
				<div class="row-key">금액</div>
				<div class="row-value">{formatCurrency(transaction.amount)}</div>
				<div class="row-key">타입</div>
				<div class="row-value">{transaction.type}</div>
				<div class="row-key">설명</div>
				<div class="row-value">{transaction.description}</div>
				<div class="row-key">날짜</div>
				<div class="row-value">{new Date(transaction.created_at).toLocaleString()}</div>
			</div>
		{/each}
	</div>
	<div class="delete">
		<button onclick={deleteAccount}>계좌 삭제하기</button>
	</div>
</div>
<PromptFloat bind:this={transferPrompt}>
	<div>계좌번호</div>
	<input type="text" id="toAccountId" />
	<div>금액 (수수료가 발생한다면 여기에 입력한 것보다 더 많은 금액이 빠져나갈 수 있어)</div>
	<input type="number" id="amount" min="0" step="0.01" />
	<div>설명</div>
	<input type="text" id="description" />
	<div>이동 경로</div>
	<input type="text" id="path" placeholder="1_2" />
	<button onclick={transferButton}>송금하기</button>
</PromptFloat>

<style>
	.container {
		max-width: var(--max-width);
		margin: 0 auto;
		padding: 0 2rem;
	}

	.go-back {
		margin-top: 2rem;
	}

	.title {
		font-size: 2rem;
		font-weight: bold;
		margin-top: 1rem;
		margin-bottom: 2rem;
	}

	.row-key {
		font-weight: bold;
		margin-bottom: 0.5rem;
	}

	.row-value {
		margin-bottom: 1rem;
	}

	.transfer {
		margin-bottom: 2rem;
	}

	.delete {
		margin-top: 1rem;
	}

	.delete button {
		background-color: #e74c3c;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
	}

	.delete button:hover {
		background-color: #c0392b;
	}

	.transaction {
		border: 1px solid #ddd;
		padding: 1rem;
		margin-bottom: 1rem;
		border-radius: 4px;
		display: grid;
		grid-template-columns: 1fr 2fr;
	}
</style>
