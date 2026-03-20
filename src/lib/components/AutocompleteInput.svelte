<script lang="ts">
	interface Candidate {
		value: any;
		label: string;
	}

	interface Props {
		search?: (query: string) => Promise<Candidate[]>;
		value: any;
		input?: HTMLInputElement;
		[key: string]: any;
	}

	let {
		search = async (query: string) => {
			const options = ['apple', 'banana', 'cherry', 'date', 'fig', 'grape'];
			return options
				.filter((option) => option.includes(query))
				.map((option) => ({ value: option, label: option }));
		},
		value = $bindable(),
		input = $bindable(),
		...rest
	}: Props = $props();

	let candidates = $state<Candidate[]>([]);
	let selection = $state(0);

	async function oninput(e: Event) {
		const target = e.target as HTMLInputElement;
		const querySplit = target.value.split(',');
		const query = querySplit[querySplit.length - 1].trim();

		if (!query) {
			candidates = [];
			return;
		}

		candidates = await search(query);
		selection = 0;
	}

	function confirmValue(w) {
		const split = value.split(',');
		split[split.length - 1] = w;
		value = split.join(', ');
		if (input) input.value = value;
		candidates = [];
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			selection = (selection + 1) % candidates.length;
			e.preventDefault();
		} else if (e.key === 'ArrowUp') {
			selection = (selection - 1 + candidates.length) % candidates.length;
			e.preventDefault();
		} else if (e.key === 'Enter' && candidates[selection]) {
			const selected = candidates[selection];
			confirmValue(selected.value);
			e.preventDefault();
		}

		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			const candidateElements = document.querySelectorAll('.autocomplete-list .candidate');
			if (candidateElements[selection]) {
				(candidateElements[selection] as HTMLElement).scrollIntoView({ block: 'nearest' });
			}
		}
	}

	function selectCandidate(candidate: Candidate) {
		confirmValue(candidate.value);
	}
</script>

<div class="autocomplete-container">
	<input
		bind:this={input}
		{oninput}
		{onkeydown}
		bind:value
		{...rest}
		onblur={() => setTimeout(() => (candidates = []), 200)}
		autocomplete="off"
	/>
	{#if candidates.length > 0}
		<div class="autocomplete-list" role="listbox">
			{#each candidates as candidate, index}
				<div
					role="option"
					aria-selected={selection === index}
					tabindex="-1"
					onclick={() => selectCandidate(candidate)}
					onkeydown={(e) => {
						if (e.key === 'Enter') selectCandidate(candidate);
					}}
					class:selected={selection === index}
					class="candidate"
					onmouseover={() => (selection = index)}
					onfocus={() => (selection = index)}
				>
					{candidate.label}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.autocomplete-container {
		position: relative;
		display: inline-block;
		width: 100%;
	}

	.autocomplete-list {
		position: absolute;
		background: white;
		border: 1px solid #ccc;
		width: 100%;
		max-height: 150px;
		overflow-y: auto;
		z-index: 1000;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
