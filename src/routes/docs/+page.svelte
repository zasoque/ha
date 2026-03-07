<script lang="ts">
	import { onMount } from 'svelte';
	import SwaggerUI from 'swagger-ui-dist/swagger-ui-bundle.js';
	import 'swagger-ui-dist/swagger-ui.css';

	onMount(() => {
		SwaggerUI({
			url: '/api/v1/docs',
			dom_id: '#swagger'
		});
	});
</script>

<div id="swagger"></div>
