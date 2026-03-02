<script lang="ts">
	const { data } = $props();
	const { visas } = data;

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

	function getExpiry(dateIssued: string, type: string): string {
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
				return '알 수 없는 사증 종류';
		}

		return expiryDate; // YYYY-MM-DD 형식으로 반환
	}
</script>

<div class="container">
	<div class="title">사증 관리</div>
	<ul>
		{#each visas as visa}
			<li>
				{visa.user_id} ({visa.type}), {new Date(visa.date_issued).toLocaleDateString()} 발행 ({getExpiry(
					visa.date_issued,
					visa.type
				).toLocaleDateString()} 만료)
			</li>
		{/each}
	</ul>
	<button onclick={addVisa}>사증 추가</button>
</div>

<style>
	.container {
		max-width: var(--max-width);
		margin: 0 auto;
		padding: 0 2rem;
	}

	.title {
		font-size: 2rem;
		font-weight: bold;
	}
</style>
