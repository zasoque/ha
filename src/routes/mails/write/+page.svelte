<script lang="ts">
	import Title from '$lib/components/Title.svelte';
	import PersonInput from '$lib/components/aci/PersonInput.svelte';

	let recipients = $state('');
	let subject = $state('');
	let body = $state('');

	async function send() {
		const errors = [];
		for (const recipient of recipients
			.split(',')
			.map((r) => r.trim())
			.filter((r) => r)) {
			await fetch('/api/v1/mails', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					recipient,
					subject,
					body
				})
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.success) {
						errors.push(`받는 사람 ${recipient}: 메일이 성공적으로 전송되었어.`);
						recipients = '';
						subject = '';
						body = '';
					} else {
						success = false;
						errors.push(`받는 사람 ${recipient}: ${data.message || '알 수 없는 오류'}`);
					}
				})
				.catch((err) => {
					success = false;
					errors.push(`받는 사람 ${recipient}: ${err.message || '네트워크 오류'}`);
				});
		}

		alert(errors.join('\n'));
	}
</script>

<div><a href="/mails">뒤로 가기</a></div>
<Title>메일 쓰기</Title>
<div>
	<PersonInput placeholder="받는 사람" class="recipients-input" bind:value={recipients} />
</div>
<div>
	<input type="text" placeholder="제목" class="input" bind:value={subject} />
</div>
<div>
	<textarea placeholder="내용" class="textarea" bind:value={body}></textarea>
</div>
<button class="button" onclick={send}>보내기</button>

<style>
	:global .recipients-input {
		width: 100%;
		padding: 0.5em;
		margin-bottom: 1em;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	.input,
	.textarea {
		width: 100%;
		padding: 0.5em;
		margin-bottom: 1em;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	.textarea {
		height: 200px;
		resize: vertical;
	}

	.button {
		display: inline-block;
		padding: 0.5em 1em;
		background-color: #007bff;
		color: white;
		text-decoration: none;
		border-radius: 4px;
		border: none;
		cursor: pointer;
	}
</style>
