<script>
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

<div>
	<div>계좌</div>
	<div>
		{#each accounts as account}
			<div>
				{account.id} - {formatCurrency(account.balance)}
				<a href="/accounts/{account.id}">보기</a>
			</div>
		{/each}
	</div>
	<div><button onclick={createAccount}>계좌 개설하기</button></div>
</div>
