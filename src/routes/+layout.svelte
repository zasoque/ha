<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	const { children, data } = $props();
	const { me } = data;
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>하은행</title>
</svelte:head>

<div class="header">
	<div class="title">하은행</div>
	<div class="navigation">
		<a href="/">홈</a>
		{#if me}
			<a href="/accounts">계좌</a>
			<a href="/logout">로그아웃</a>
			{me.global_name}으로 로그인됨
		{:else}
			<a href="/login">로그인</a>
		{/if}
	</div>
</div>
{@render children()}
