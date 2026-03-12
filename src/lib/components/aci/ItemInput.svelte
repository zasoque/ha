<script lang="ts">
	import AutocompleteInput from '../AutocompleteInput.svelte';

	let { value = $bindable(), ...rest } = $props();

	async function search(query: string) {
		const { items } = await fetch(`/api/v1/items/search?q=${encodeURIComponent(query)}`).then(
			(res) => res.json()
		);

		const result = [];
		for (const item of items) {
			result.push({
				label: `${item.name} (#${item.id})`,
				value: item.id
			});
		}

		return result;
	}
</script>

<AutocompleteInput bind:value {search} {...rest} />
