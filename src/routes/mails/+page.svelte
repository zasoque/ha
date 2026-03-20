<script lang="ts">
	import Title from '$lib/components/Title.svelte';
	import Pagination from '$lib/components/Pagination.svelte';

	const { data } = $props();
	const { mails, page, limit } = $derived(data);
</script>

<Title>메일</Title>
<a href="/mails/write" class="button">메일 쓰기</a>
<div class="mails">
	<table>
		<thead>
			<tr>
				<th>읽음</th>
				<th>제목</th>
				<th>보낸 사람</th>
				<th>날짜</th>
			</tr>
		</thead>
		<tbody>
			{#each mails as mail}
				<tr>
					<td>{mail.is_read ? '읽음' : '안읽음'}</td>
					<td class:bold={!mail.is_read}><a href={`/mails/${mail.id}`}>{mail.subject}</a></td>
					<td>{mail.senderObject.name}</td>
					<td>{new Date(mail.created_at).toLocaleString()}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
<Pagination {page} {limit} />

<style>
	.button {
		display: inline-block;
		padding: 0.5em 1em;
		margin-bottom: 1em;
		background-color: #007bff;
		color: white;
		text-decoration: none;
		border-radius: 4px;
	}

	.bold {
		font-weight: bold;
	}
</style>
