<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import Pagination from '$lib/components/Pagination.svelte';

	const { data } = $props();
	const visas = $derived(() => data.visas);
	const limit = $derived(() => data.limit);
	const page = $derived(() => data.page);

	function addVisa() {
		const user_id = prompt('사증 발급 인원 디스코드 ID를 입력해줘');
		if (!user_id) return;

		const type = prompt('사증 종류를 입력해줘 (예: 단기, 체험, 사업)');
		if (!type) return;

		const date_issued = prompt('사증 발급 날짜를 입력해줘 (YYYY-MM-DD)');
		if (!date_issued) return;

		fetch('/api/v1/admin/visas', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ user_id, type, date_issued })
		}).then((res) => {
			location.reload();
		});
	}

	function getExpiry(dateIssued: string, type: string): Date {
		const issuedDate = new Date(dateIssued);
		let expiryDate: Date;

		switch (type) {
			case '단기':
				expiryDate = new Date(issuedDate.setDate(issuedDate.getDate() + 6));
				break;
			case '체험':
			case '사업':
				expiryDate = new Date(issuedDate.setMonth(issuedDate.getMonth() + 1));
				expiryDate.setDate(expiryDate.getDate() - 1); // 한 달 후의 전날로 설정
				break;
			default:
				return new Date(issuedDate); // 기본적으로 발급 날짜를 반환
		}

		return expiryDate; // YYYY-MM-DD 형식으로 반환
	}
</script>

<Container>
	<div><a href="/admin">뒤로 가기</a></div>
	<Title>사증 관리</Title>
	<table class="table">
		<thead>
			<tr>
				<th>인원 디스코드 ID</th>
				<th>사증 종류</th>
				<th>발급 날짜</th>
				<th>만료 날짜</th>
			</tr>
		</thead>
		<tbody>
			{#each visas() as visa}
				<tr>
					<td>{visa.user_id}</td>
					<td>{visa.type}</td>
					<td>{new Date(visa.date_issued).toLocaleDateString()}</td>
					<td>{getExpiry(visa.date_issued, visa.type).toLocaleDateString()}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<Pagination page={page()} limit={limit()}></Pagination>
	<button onclick={addVisa}>사증 추가</button>
</Container>

<style>
	.table {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 1rem;
	}

	.table th,
	.table td {
		border: 1px solid #ccc;
		padding: 0.5rem;
		text-align: left;
	}

	.table th {
		background-color: #f5f5f5;
	}
</style>
