<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import PromptFloat from '$lib/components/PromptFloat.svelte';
	import AccountInput from '$lib/components/aci/AccountInput.svelte';

	const { data } = $props();
	const { taintFee } = $derived(data);

	let accountNumber = $state('');
	let amountStr = $state('');

	let printPrompt: PromptFloat = $state()!;
	async function printCurrency() {
		const amount = parseFloat(amountStr);
		if (isNaN(amount) || amount <= 0) {
			alert('유효한 냥푼 양을 입력해줘!');
			return;
		}

		await fetch('/api/v1/admin/economy/print', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ account: accountNumber, amount })
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					accountNumber = '';
					amountStr = '';
					printPrompt.close();
				} else {
					alert(`냥푼 발행에 실패했어: ${data.message}`);
				}
			})
			.catch((error) => {
				console.error('Error:', error);
				alert('냥푼 발행 중 오류가 발생했어!');
			});
	}

	let burnPrompt: PromptFloat = $state()!;

	async function burnCurrency() {
		const amount = parseFloat(amountStr);
		if (isNaN(amount) || amount <= 0) {
			alert('유효한 냥푼 양을 입력해줘!');
			return;
		}

		await fetch('/api/v1/admin/economy/burn', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ account: accountNumber, amount })
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					accountNumber = '';
					amountStr = '';
					burnPrompt.close();
				} else {
					alert(`냥푼 소각에 실패했어: ${data.message}`);
				}
			})
			.catch((error) => {
				console.error('Error:', error);
				alert('냥푼 소각 중 오류가 발생했어!');
			});
	}

	let taintFeeStr = $state(taintFee?.toString());
	let setTaintFeePrompt: PromptFloat = $state()!;
	async function setTaintFee() {
		const fee = parseFloat(taintFeeStr);
		if (isNaN(fee) || fee < 0) {
			alert('유효한 테인트세를 입력해줘!');
			return;
		}

		await fetch('/api/v1/admin/economy/taintfee', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ fee })
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					setTaintFeePrompt.close();
				} else {
					alert(`테인트세 설정에 실패했어: ${data.message}`);
				}
			})
			.catch((error) => {
				alert('테인트세 설정 중 오류가 발생했어!');
			});
	}
</script>

<Container>
	<div><a href="/admin">뒤로 가기</a></div>
	<Title>경제 관리</Title>
	<button onclick={setTaintFeePrompt.open}>테인트세 설정</button>
	<button onclick={printPrompt.open}>냥푼 발행</button>
	<button onclick={burnPrompt.open}>냥푼 소각</button>
</Container>

<PromptFloat bind:this={printPrompt}>
	<div>발행할 냥푼 양</div>
	<input type="number" placeholder="발행할 냥푼 양" min="0" step="0.01" bind:value={amountStr} />
	<div>입금 계좌번호</div>
	<AccountInput bind:value={accountNumber} placeholder="계좌번호" />
	<button class="new-product" onclick={printCurrency}>발행하기</button>
</PromptFloat>
<PromptFloat bind:this={burnPrompt}>
	<div>소각할 냥푼 양</div>
	<input type="number" placeholder="소각할 냥푼 양" min="0" step="0.01" bind:value={amountStr} />
	<div>출금 계좌번호</div>
	<AccountInput bind:value={accountNumber} placeholder="계좌번호" />
	<button class="new-product" onclick={burnCurrency}>소각하기</button>
</PromptFloat>
<PromptFloat bind:this={setTaintFeePrompt}>
	<div>테인트 개당 거래세</div>
	<input
		type="number"
		placeholder="테인트 개당 거래세"
		min="0"
		step="0.01"
		bind:value={taintFeeStr}
	/>
	<button class="new-product" onclick={setTaintFee}>설정하기</button>
</PromptFloat>
