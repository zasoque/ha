<script>
	import Container from '$lib/components/Container.svelte';
	import { createTwoFilesPatch } from 'diff';

	let one = '';
	let two = '';

	function diff() {
		return createTwoFilesPatch('이전', '이후', one, two);
	}
</script>

<Container>
	<textarea bind:value={one}></textarea>
	<textarea bind:value={two}></textarea>
	<textarea readonly value={diff()}></textarea>
</Container>

<style>
	textarea {
		width: 100%;
		display: block;
		resize: none;
		margin-bottom: 1rem;
		height: 200px;
	}
</style>
