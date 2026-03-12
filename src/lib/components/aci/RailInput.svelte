<script lang="ts">
	import AutocompleteInput from '../AutocompleteInput.svelte';

	let { value = $bindable(), ...rest } = $props();

	async function search(query: string) {
		const { rails } = await fetch(`/api/v1/maps/rails/search?q=${encodeURIComponent(query)}`).then(
			(res) => res.json()
		);

		const result = [];
		for (const rail of rails) {
			result.push({
				label: `${rail.name} (#${rail.id})`,
				value: rail.id
			});
		}

		return result;
	}
</script>

<AutocompleteInput bind:value {search} {...rest} />
