<script lang="ts">
	import AutocompleteInput from '../AutocompleteInput.svelte';

	const { ...rest } = $props();

	async function search(query: string) {
		const { accounts } = await fetch(`/api/v1/accounts/search?q=${encodeURIComponent(query)}`).then(
			(res) => res.json()
		);

		if (!accounts) {
			return [];
		}

		const result = [];
		for (const account of accounts) {
			const { person } = await fetch(`/api/v1/people/${account.user_id}`).then((res) => res.json());
			result.push({
				value: account.id,
				label: `${person.name} (@${account.id})`
			});
		}

		return result;
	}
</script>

<AutocompleteInput {search} {...rest} />
