<script lang="ts">
	import AutocompleteInput from '../AutocompleteInput.svelte';

	let { value, ...rest } = $props();

	async function search(query: string) {
		const { people } = await fetch(`/api/v1/people/search?q=${encodeURIComponent(query)}`).then(
			(res) => res.json()
		);

		if (!people) {
			return [];
		}

		const result = [];
		for (const person of people) {
			result.push({
				value: person.id,
				label: `${person.name} (${person.id})`
			});
		}

		return result;
	}
</script>

<AutocompleteInput bind:value {search} {...rest} />
