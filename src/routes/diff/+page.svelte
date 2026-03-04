<script>
	import Container from '$lib/components/Container.svelte';
	import { createTwoFilesPatch } from 'diff';

	let one = '';
	let two = '';

	function diff() {
		return createTwoFilesPatch('현행', '개정', one.trim(), two.trim(), '', '', {
			headerOptions: {
				includeUnderline: false
			}
		}).replace(/\\ No newline at end of file(\n|$)?/g, '');
	}
</script>

<Container>
	<textarea bind:value={one} placeholder="현행"></textarea>
	<textarea bind:value={two} placeholder="개정"></textarea>
	<textarea readonly value={diff()}></textarea>
</Container>

<style>
	textarea {
		width: 100%;
		display: block;
		resize: none;
		margin-bottom: 1rem;
		height: 200px;
		font-family: monospace;
	}
</style>
