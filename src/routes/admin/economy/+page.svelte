<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Title from '$lib/components/Title.svelte';
</script>

<Container>
	<div><a href="/admin">뒤로 가기</a></div>
	<Title>경제 관리</Title>
	<ul>
		<li><a href="/admin/economy/transactions">거래 내역</a></li>
		<li><a href="/admin/economy/print">냥푼 발행</a></li>
	</ul>
</Container>

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

	a {
		color: black;
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}
</style>
