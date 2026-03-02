<script>
	import { createTwoFilesPatch } from 'diff';

	let one = '';
	let two = '';

	function diff() {
		return createTwoFilesPatch('이전', '이후', one, two);
	}
</script>

<div class="container">
	<textarea bind:value={one}></textarea>
	<textarea bind:value={two}></textarea>
	<textarea readonly value={diff()}></textarea>
</div>

<style>
	.container {
		max-width: var(--max-width);
		margin: 0 auto;
		padding: 2rem;
	}

	textarea {
		width: 100%;
		display: block;
		resize: none;
		margin-bottom: 1rem;
		height: 200px;
	}
</style>
