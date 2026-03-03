<script>
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import { formatCurrency } from '$lib/util/economy.ts';

	const { data } = $props();
	const { accounts } = data;

	function createAccount() {
		fetch('/api/v1/accounts', {
			method: 'POST'
		})
			.then((response) => response.json())
			.then((data) => {
				location.reload();
			});
	}
</script>

<Container>
	<Title>계좌</Title>
	<div class="accounts">
		{#each accounts as account}
			<a href="/accounts/{account.id}" class="account">
				<div class="account-id">예금 {account.id}</div>
				<div class="account-balance">{formatCurrency(account.balance)}</div>
			</a>
		{/each}
	</div>
	<div><button onclick={createAccount} class="create-account">계좌 개설하기</button></div>
</Container>

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
