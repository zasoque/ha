<script lang="ts">
	import { formatCurrency } from '$lib/util/economy';

	const { data } = $props();
	const account = $derived(() => data.account);
	const transactions = $derived(() => data.transactions);

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
</script>

<div class="container">
	<div class="go-back">
		<a href="/accounts">목록으로 돌아가기</a>
	</div>
	<div class="title">계좌 상세</div>
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
	<div class="transfer">
		<a href="/accounts/{account().id}/transfer">송금</a>
	</div>
	<div class="delete">
		<button onclick={deleteAccount}>계좌 삭제하기</button>
	</div>
</div>

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
		margin-top: 2rem;
	}

	.transfer a {
		text-decoration: none;
		background-color: #3498db;
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 4px;
	}

	.transfer a:hover {
		background-color: #2980b9;
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
