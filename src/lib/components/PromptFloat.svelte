<script>
	export let show = false;
</script>

{#if show}
	<div class="dim">
		<div class="prompt">
			<slot />
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

	:global input {
		padding: 0.5rem;
		font-size: 1rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		margin-bottom: 1rem;
		margin-top: 0.5rem;
	}
</style>
