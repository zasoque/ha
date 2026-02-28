<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	const origin = $page.url.origin;

	onMount(async () => {
		try {
			const response = await fetch(`${origin}/api/v1/auth/logout`);

			if (response.ok) {
				window.location.href = `https://discord.com/oauth2/authorize?client_id=1477188442751500350&response_type=code&redirect_uri=${encodeURI(origin + '/api/v1/auth/login')}&scope=identify`;
			} else {
				console.error('Logout failed:', response.statusText);
			}
		} catch (error) {
			console.error('Error during logout:', error);
		}
	});
</script>
