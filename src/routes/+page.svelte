<script lang="ts">
	import Container from '$lib/components/Container.svelte';

	const { data } = $props();
	const { username, residence, land } = data;
</script>

<Container>
	<div>하은행에 온 것을 환영해.</div>
	{#if username}
		<div>
			{#if username === 'Unknown'}
				너의 정보는 아직 하은행에 등록되지 않았어.
			{:else}
				너의 이름은 {username}(이)야.
			{/if}
		</div>
	{/if}
	{#if land?.name && residence?.id}
		<div>
			그리고 너는 {land.name}
			{residence.name}(#{residence.id})에 살고 있구나.
		</div>
	{/if}
</Container>
