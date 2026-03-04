<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	const { children, data } = $props();
	const me = $derived(() => data.me);
	const isAdmin = $derived(() => data.isAdmin);
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

		button {
			font-family: 'SUIT Variable', sans-serif;
			background-color: #0070f3;
			color: white;
			border: none;
			padding: 0.5rem 1rem;
			border-radius: 4px;
			cursor: pointer;
			transition: background-color 0.2s ease;
		}

		button:hover {
			background-color: #005bb5;
		}

		a {
			color: inherit;
			text-decoration: none;
		}

		a:hover {
			text-decoration: underline;
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
		<a href="/" class="navigation-item">홈</a>
		<a href="/items" class="navigation-item">아이템</a>
		<a href="/maps" class="navigation-item">지도</a>
		{#if me()}
			<a href="/notifications" class="navigation-item">알림</a>
			<a href="/accounts" class="navigation-item">계좌</a>
			<a href="/products" class="navigation-item">시장</a>
			<a href="/inventory" class="navigation-item">인벤토리</a>
			{#if isAdmin()}
				<a href="/admin" class="navigation-item">관리자</a>
			{/if}
			<a href="/logout" class="navigation-item">로그아웃</a>
			<span class="navigation-item">{me().global_name}으로 로그인됨</span>
		{:else}
			<a href="/login" class="navigation-item">로그인</a>
		{/if}
	</div>
</div>
{@render children()}
<div class="footer">
	<a href="https://w.halv.kr/하">하 쩌모위키</a>
	<a href="https://github.com/zasoque/ha">하은행 레포지토리</a>
	<a href="/diff">변경사항 추적기</a>
	<a href="/policy">이용약관</a>
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

	@media (max-width: 600px) {
		.header {
			flex-direction: column;
			align-items: flex-start;
		}

		.navigation {
			margin-top: 0.5rem;
			display: flex;
			gap: 12px;
			flex-wrap: wrap;
		}

		.navigation a {
			margin-left: 0;
			margin-right: 1rem;
		}

		.footer {
			flex-direction: column;
		}

		.footer a {
			margin: 0.5rem 0;
		}
	}
</style>
