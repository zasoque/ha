<script>
	import Title from '$lib/components/Title.svelte';
	import { formatCurrency } from '$lib/util/economy';

	const { data } = $props();
	const accounts = $derived(() => data.accounts);
	const me = $derived(() => data.me);

	function createAccount() {
		const user_id = prompt('계좌를 개설할 국민/법인 ID를 입력하세요:', me().id);

		if (!user_id) {
			return;
		}

		fetch('/api/v1/accounts', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ user_id })
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.success) {
					location.reload();
				} else {
					alert('계좌 개설에 실패했습니다: ' + data.message);
				}
			})
			.catch((error) => {
				alert('계좌 개설 중 오류가 발생했습니다. 다시 시도해주세요.');
			});
	}
</script>

<Title>계좌</Title>
<div class="accounts">
	{#each accounts() as account}
		<a href="/accounts/{account.id}" class="account">
			<div class="account-id">예금 {account.id}</div>
			<div class="account-balance">{formatCurrency(account.balance)}</div>
		</a>
	{/each}
</div>
<div><button onclick={createAccount} class="create-account">계좌 개설하기</button></div>

<style>
	.accounts {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.account {
		display: flex;
		flex-direction: column;
		padding: 1rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		text-decoration: none;
		color: inherit;
	}

	.account-id {
		font-size: 1.25rem;
		font-weight: bold;
	}

	.account-balance {
		font-size: 1rem;
		color: var(--text-secondary);
	}

	.create-account {
		margin-top: 1rem;
		padding: 0.5rem 1rem;
		font-size: 1rem;
		color: #fff;
		background-color: #007bff;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
</style>
