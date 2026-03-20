<script lang="ts">
	import Title from '$lib/components/Title.svelte';

	const { data } = $props();
	const { mail, sender, recipient } = $derived(data);

	async function read() {
		await fetch(`/api/v1/mails/${mail.id}/read`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ is_read: !mail.is_read })
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					location.reload();
				} else {
					alert(data.message || '알 수 없는 오류');
				}
			})
			.catch((err) => {
				alert(err.message || '네트워크 오류');
			});
	}
</script>

<div><a href="/mails">뒤로 가기</a></div>
<Title>{mail.subject}</Title>
<div>
	<div><strong>보낸 사람:</strong> {sender.name} ({sender.id})</div>
	<div><strong>받는 사람:</strong> {recipient.name} ({recipient.id})</div>
	<div><strong>날짜:</strong> {new Date(mail.created_at).toLocaleString()}</div>
	<div><strong>읽음 상태:</strong> {mail.is_read ? '읽음' : '안읽음'}</div>
</div>
<button onclick={read}>{mail.is_read ? '안읽음으로 표시' : '읽음으로 표시'}</button>
<div class="body">
	{#each mail.body.split('\n') as line}
		<div>{line}</div>
	{/each}
</div>

<style>
	.body {
		margin-top: 1em;
		white-space: pre-wrap;
	}
</style>
