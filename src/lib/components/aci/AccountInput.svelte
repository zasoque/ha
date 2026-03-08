<script lang="ts">
	import AutocompleteInput from '../AutocompleteInput.svelte';

	let { value = $bindable(), ...rest } = $props();

	async function search(query: string) {
		const { accounts } = await fetch(`/api/v1/accounts/search?q=${encodeURIComponent(query)}`).then(
			(res) => res.json()
		);

		if (!accounts) {
			return [];
		}

		const result = [];
		for (const account of accounts) {
			result.push({
				value: account.id,
				label: `${account.user.name} (@${account.id})`
			});
		}

		return result;
	}
</script>

<AutocompleteInput bind:value {search} {...rest} />
