<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	const { children, data } = $props();
	const { me } = data;
</script>

<svelte:head>
	<link
		href="https://cdn.jsdelivr.net/gh/sun-typeface/SUIT@2/fonts/variable/woff2/SUIT-Variable.css"
		rel="stylesheet"
	/>
	<style>
		body {
			margin: 0;
			font-family: 'SUIT Variable', sans-serif;

			--max-width: 960px;
		}
	</style>
	<link rel="icon" href={favicon} />
	<title>하은행</title>
</svelte:head>

<div class="header">
	<div class="title">
		<a href="/"><img src={favicon} alt="하은행 로고" width="32" height="32" class="title-icon" /></a
		>
	</div>
	<div class="navigation">
		<a href="/">홈</a>
		{#if me}
			<a href="/accounts" class="navigation-item">계좌</a>
			<a href="/logout" class="navigation-item">로그아웃</a>
			<span class="navigation-item">{me.global_name}으로 로그인됨</span>
		{:else}
			<a href="/login">로그인</a>
		{/if}
	</div>
</div>
{@render children()}
<div class="footer">
	<a href="https://w.halv.kr/하은행">하은행 쩌모위키</a>
	<a href="https://github.com/zasoque/ha">하은행 레포지토리</a>
</div>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 2rem;
		background-color: #f8f8f8;
		border-bottom: 1px solid #e0e0e0;
		margin-bottom: 2rem;
	}

	.title {
		font-size: 1.5rem;
		font-weight: bold;
	}

	.title-icon {
		margin-right: 0.5rem;
		vertical-align: middle;
	}

	.navigation a {
		margin-left: 1rem;
		text-decoration: none;
		color: #333;
	}

	.navigation a:hover {
		text-decoration: underline;
	}

	.navigation-item {
		margin-left: 1rem;
		color: #666;
		font-size: 0.9rem;
	}

	.footer {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 1rem 0;
		background-color: #f8f8f8;
		border-top: 1px solid #e0e0e0;
		margin-top: 2rem;
	}

	.footer a {
		margin: 0 1rem;
		text-decoration: none;
		color: #333;
	}

	.footer a:hover {
		text-decoration: underline;
	}
</style>
