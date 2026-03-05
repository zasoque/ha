<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
</script>

<Container>
	<div>
		<a href="/admin">뒤로 가기</a>
		<Title>지도 관리</Title>
		<ul>
			<li><a href="/admin/maps/lands">토지 관리</a></li>
			<li><a href="/admin/maps/buildings">건물 관리</a></li>
			<li><a href="/admin/maps/roads">도로 관리</a></li>
			<li><a href="/admin/maps/rails">철도 관리</a></li>
		</ul>
	</div></Container
>
