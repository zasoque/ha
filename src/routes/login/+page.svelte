<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	const origin = $page.url.origin;
	const redirectUri = encodeURIComponent(origin + '/api/v1/auth/login');

	onMount(async () => {
		window.location.href = `https://discord.com/oauth2/authorize?client_id=1477188442751500350&response_type=code&redirect_uri=${redirectUri}&scope=identify`;
	});
</script>
