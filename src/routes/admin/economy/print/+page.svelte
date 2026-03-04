<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
	import PromptFloat from '$lib/components/PromptFloat.svelte';

	let accountNumber = $state('');
	let amountStr = $state('');

	async function newCurrency() {
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
					alert('냥푼이 성공적으로 발행됐어!');
					accountNumber = '';
					amountStr = '';
					transferPrompt.close();
				} else {
					alert(`냥푼 발행에 실패했어: ${data.message}`);
				}
			})
			.catch((error) => {
				console.error('Error:', error);
				alert('냥푼 발행 중 오류가 발생했어!');
			});
	}

	let transferPrompt;
</script>

<Container>
	<div><a href="/admin/economy">뒤로 가기</a></div>
	<Title>냥푼 발행</Title>
	<div class="description">
		이 페이지에서 냥푼을 발행할 수 있어. 발행한 냥푼은 즉시 해당 계좌로 입금돼.
	</div>
	<div class="description">
		냥푼을 발행할 때는 신중하게 생각해줘. 과도한 발행은 인플레이션을 초래할 수 있어!
	</div>
	<button class="new-product" onclick={transferPrompt.open}>냥푼 발행하기</button>
</Container>
<PromptFloat bind:this={transferPrompt}>
	<div>발행할 냥푼 양</div>
	<input type="number" placeholder="발행할 냥푼 양" min="0" step="0.01" bind:value={amountStr} />
	<div>입금 계좌번호</div>
	<input type="text" placeholder="계좌번호" bind:value={accountNumber} />
	<button class="new-product" onclick={newCurrency}>발행하기</button>
</PromptFloat>

<style>
	.description {
		margin-bottom: 1rem;
		color: #555;
	}

	input {
		display: block;
		margin-bottom: 1rem;
		padding: 0.5rem;
		width: 100%;
		max-width: 400px;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	.new-product {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 4px;
		background-color: #007bff;
		color: white;
		cursor: pointer;
	}

	.new-product:hover {
		background-color: #0056b3;
	}
</style>
