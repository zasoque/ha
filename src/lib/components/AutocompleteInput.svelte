<script lang="ts">
	let { search, value = $bindable(), input, ...rest } = $props();

	if (!search) {
		search = async (query) => {
			// Mock search function
			const options = ['apple', 'banana', 'cherry', 'date', 'fig', 'grape'];
			return options.filter((option) => option.includes(query));
		};
	}

	let candidates = $state([]);
	async function oninput(e: InputEvent) {
		const target = e.target as HTMLInputElement;

		let options = [];
		(await search(value)).forEach((option: string) => {
			options.push(option);
		});
		candidates = options;
	}

	let selection = $state(0);
	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			selection = (selection + 1) % candidates.length;
		} else if (e.key === 'ArrowUp') {
			selection = (selection - 1 + candidates.length) % candidates.length;
		} else if (e.key === 'Enter' && candidates[selection]) {
			input.value = candidates[selection].value;
			value = candidates[selection].value;
			candidates = [];
		}

		// scroll into view
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			const candidateElements = document.querySelectorAll('.autocomplete-list .candidate');
			if (candidateElements[selection]) {
				(candidateElements[selection] as HTMLElement).scrollIntoView({ block: 'nearest' });
			}
		}
	}
</script>

<input
	bind:this={input}
	{oninput}
	{onkeydown}
	bind:value
	{...rest}
	onblur={() => setTimeout(() => (candidates = []), 100)}
/>
{#if candidates.length > 0}
	<div class="autocomplete-list">
		{#each candidates as candidate, index}
			<div
				onclick={() => {
					input.value = candidate.value;
					candidates = [];
				}}
				class:selected={selection === index}
				class="candidate"
				onmouseover={() => (selection = index)}
			>
				{candidate.label}
			</div>
		{/each}
	</div>
{/if}

<style>
	.autocomplete-list {
		position: absolute;
		background: white;
		border: 1px solid #ccc;
		width: max-content;
		max-height: 150px;
		overflow-y: auto;
		z-index: 1000;
	}

	.autocomplete-list .candidate {
		padding: 8px;
		margin: 0;
		cursor: pointer;
	}

	.autocomplete-list .candidate.selected {
		background-color: #007bff;
		color: white;
	}
</style>
