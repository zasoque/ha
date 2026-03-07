<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
</script>

<Container>
	<Title>관리자</Title>
	<ul>
		<li><a href="/admin/economy">경제 관리</a></li>
		<li><a href="/admin/users">관리자 관리</a></li>
		<li><a href="/admin/people">국민 관리</a></li>
		<li><a href="/admin/corporations">법인 관리</a></li>
		<li><a href="/admin/visas">사증 관리</a></li>
		<li><a href="/admin/inventory">인벤토리 관리</a></li>
		<li><a href="/admin/maps">지도 관리</a></li>
	</ul>
</Container>
