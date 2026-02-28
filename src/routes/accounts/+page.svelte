<script>
	const { data } = $props();
	const { accounts } = data;

	console.log('accounts', accounts);

	function createAccount() {
		fetch('/api/v1/accounts', {
			method: 'POST'
		})
			.then((response) => response.json())
			.then((data) => {
				console.log('계좌 개설 성공:', data);
				location.reload();
			})
			.catch((error) => {
				console.error('계좌 개설 실패:', error);
			});
	}
</script>

<div>
	<div>계좌</div>
	<div>
		{#each accounts as account}
			<div>{account.id}</div>
		{/each}
	</div>
	<div><button onclick={createAccount}>계좌 개설하기</button></div>
</div>
