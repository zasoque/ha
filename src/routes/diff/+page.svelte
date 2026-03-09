<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import { createTwoFilesPatch } from 'diff';

	let one = $state('');
	let two = $state('');

	function getDiff() {
		const patch = createTwoFilesPatch('현행', '개정', one.trim(), two.trim(), '', '');
		return patch.replace(/\\ No newline at end of file(\n|$)?/g, '');
	}
</script>

<Container>
	<textarea bind:value={one} placeholder="현행"></textarea>
	<textarea bind:value={two} placeholder="개정"></textarea>
	<textarea readonly value={getDiff()}></textarea>
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
