<script lang="ts">
	import { onMount } from 'svelte';

	onMount(async () => {
		await fetch(`/api/v1/auth/logout`)
			.then((response) => {
				window.location.href = '/';
			})
			.catch((error) => {
				console.error('Error during logout:', error);
			});
	});
</script>
