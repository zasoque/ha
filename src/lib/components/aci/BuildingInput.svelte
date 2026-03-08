<script lang="ts">
	import AutocompleteInput from '../AutocompleteInput.svelte';

	let { value, ...rest } = $props();

	async function search(query: string) {
		const { buildings } = await fetch(
			`/api/v1/maps/buildings/search?q=${encodeURIComponent(query)}`
		).then((res) => res.json());

		const result = [];
		for (const building of buildings) {
			result.push({
				label: `${building.name} (#${building.id})`,
				value: building.id
			});
		}

		return result;
	}
</script>

<AutocompleteInput bind:value {search} {...rest} />
