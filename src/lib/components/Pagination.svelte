<script>
	export let page = 1;
	export let limit = 10;

	function firstPage() {
		location.href = `?page=${1}&limit=${limit}`;
	}

	function previousPage() {
		if (page > 1) {
			page -= 1;
		}

		location.href = `?page=${page}&limit=${limit}`;
	}

	function nextPage() {
		location.href = `?page=${page + 1}&limit=${limit}`;
	}
</script>

<div class="pagination">
	<button onclick={firstPage} class="button">1</button>
	<button onclick={previousPage} class="button">&lt;</button>
	<span class="page-indicator">{page} &times; {limit}</span>
	<button onclick={nextPage} class="button">&gt;</button>
</div>

<style>
	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
	}

	.button {
		padding: 5px 10px;
		font-size: 16px;
		cursor: pointer;
	}

	.page-indicator {
		font-size: 16px;
	}
</style>
