<script>
	export let page = 1;
	export let limit = 10;

	function previousPage() {
		if (page > 1) {
			page -= 1;
		}

		location.href = `?page=${page}&limit=${limit}`;
	}

	function nextPage() {
		page += 1;

		location.href = `?page=${page}&limit=${limit}`;
	}
</script>

<div class="pagination">
	<button onclick={previousPage} class="previous-page">&lt;</button>
	<span class="page-indicator">{page} &times; {limit}</span>
	<button onclick={nextPage} class="next-page">&gt;</button>
</div>

<style>
	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
	}

	.previous-page,
	.next-page {
		padding: 5px 10px;
		font-size: 16px;
		cursor: pointer;
	}

	.page-indicator {
		font-size: 16px;
	}
</style>
