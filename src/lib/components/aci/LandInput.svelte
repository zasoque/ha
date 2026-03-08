<script lang="ts">
	import AutocompleteInput from '../AutocompleteInput.svelte';

	let { value, ...rest } = $props();

	async function search(query: string) {
		const { lands } = await fetch(`/api/v1/maps/lands/search?q=${encodeURIComponent(query)}`).then(
			(res) => res.json()
		);

		const result = [];
		for (const land of lands) {
			result.push({
				label: `${land.name} (#${land.id})`,
				value: land.id
			});
		}

		return result;
	}
</script>

<AutocompleteInput bind:value {search} {...rest} />
