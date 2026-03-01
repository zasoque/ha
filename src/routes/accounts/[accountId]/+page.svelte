<script lang="ts">
	import { formatCurrency } from '$lib/util/economy';

	const { data } = $props();
	const { account } = data;

	function deleteAccount() {
		fetch(`/api/v1/accounts/${account.id}`, {
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

<div>
	<div><a href="/accounts">목록으로 돌아가기</a></div>
	<div>계좌 상세</div>
	<div>계좌번호: {account.id}</div>
	<div>잔액: {formatCurrency(account.balance)}</div>
	<div>개설일자: {new Date(account.created_at)}</div>
	<div>갱신일자: {new Date(account.updated_at)}</div>
	<div><a href="/accounts/{account.id}/transfer">송금</a></div>
	<div><button onclick={deleteAccount}>계좌 삭제하기</button></div>
</div>
