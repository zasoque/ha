<script lang="ts">
	export let stock;
	export let ongive: () => void;
</script>

<div class="stock">
	<div class="name">
		{stock.item.name} <span class="item-id">#{stock.item_id}</span>
		{#if stock.quantity}
			&times; <span class="quantity">{stock.quantity}</span>
		{/if}
	</div>
	<div class="description">{stock.item.description}</div>
	<div class="action"><button onclick={ongive}>주기</button></div>
</div>

<style>
	.stock {
		border: 1px solid #ccc;
		padding: 0.5rem;
		border-radius: 4px;
		width: 200px;
		display: flex;
		flex-direction: column;
	}

	.name {
		font-weight: bold;
		margin-bottom: 0.25rem;
	}

	.item-id {
		color: #888;
		font-size: 0.75rem;
	}

	.quantity {
		color: #007bff;
		font-weight: bold;
	}

	.description {
		font-size: 0.875rem;
		margin-bottom: 0.5rem;
		flex: 1;
	}

	.action {
		text-align: right;
	}

	button {
		padding: 0.25rem 0.5rem;
		font-size: 0.875rem;
		border: none;
		background-color: #007bff;
		color: white;
		border-radius: 4px;
		cursor: pointer;
	}

	button:hover {
		background-color: #0056b3;
	}
</style>
