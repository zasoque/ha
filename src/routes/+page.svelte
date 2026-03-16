<script lang="ts">
	const { data } = $props();
</script>

<div>하이파이브에 온 것을 환영해.</div>
{#if data.username}
	<div>
		{#if data.username === 'Unknown'}
			너의 정보는 아직 하이파이브에 등록되지 않았어.
		{:else}
			너의 이름은 {data.username}이고, 너의 ID는 {data.id}야.
		{/if}
	</div>
{/if}
{#if data.land?.name && data.residence?.id}
	<div>
		그리고 너는 {data.land.name}
		{data.residence.name}(#{data.residence.id})에 살고 있구나.
	</div>
{/if}
