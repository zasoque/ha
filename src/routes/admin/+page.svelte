<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';

	const { data } = $props();
	const { isAdmin } = $derived(data);
</script>

<Container>
	<Title>관리자</Title>
	{#if isAdmin}
		<ul>
			<li><a href="/admin/economy">경제 관리</a></li>
			<li><a href="/admin/users">관리자 관리</a></li>
			<li><a href="/admin/people">국민 관리</a></li>
			<li><a href="/admin/laws">법령 관리</a></li>
			<li><a href="/admin/corporations">법인 관리</a></li>
			<li><a href="/admin/visas">사증 관리</a></li>
			<li><a href="/admin/inventory">인벤토리 관리</a></li>
			<li><a href="/admin/certificates">자격증 관리</a></li>
			<li><a href="/admin/maps">지도 관리</a></li>
		</ul>
	{:else}
		<p>관리자 권한이 없습니다.</p>
	{/if}
</Container>
