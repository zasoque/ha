<script lang="ts">
	let { children } = $props();
	let show = $state(false);

	export function open() {
		show = true;
	}

	export function close() {
		show = false;
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
		}
	}

	function stopPropagation(event: Event) {
		event.stopPropagation();
	}
</script>

<svelte:window onkeydown={onkeydown} />

{#if show}
	<div
		class="dim"
		onclick={close}
		role="button"
		tabindex="-1"
		onkeydown={(e) => {
			if (e.key === 'Enter') close();
		}}
	>
		<div
			class="prompt"
			onclick={stopPropagation}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			onkeydown={stopPropagation}
		>
			{@render children()}
		</div>
	</div>
{/if}

<style>
	.dim {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.prompt {
		background-color: white;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
		max-width: 400px;
		display: flex;
		flex-direction: column;
	}

	:global {
		div {
			margin-bottom: 0.5rem;
		}

		input,
		select {
			padding: 0.5rem;
			font-size: 1rem;
			border: 1px solid #ccc;
			border-radius: 4px;
			margin-bottom: 1rem;
			box-sizing: border-box;
			background-color: white;
			font-family: inherit;
		}

		input[type='color'] {
			height: 2.5rem;
			width: 100%;
		}
	}
</style>
