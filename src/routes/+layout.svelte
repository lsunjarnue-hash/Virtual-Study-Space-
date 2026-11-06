<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import Footer from '#lib/components/Footer.svelte';
	import Navbar from '#lib/components/Navbar.svelte';
	import { audio } from '#lib/state/audio.svelte.ts';
	import { preferences } from '#lib/state/preferences.svelte.ts';
	import { study } from '#lib/state/study.svelte.ts';
	import type { LayoutProps } from './$types';
	import { onMount } from 'svelte';

	let { children }: LayoutProps = $props();

	onMount(() => {
		preferences.init();
		audio.init();
		study.init();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app-shell">
	<Navbar />
	<main>
		{@render children()}
	</main>
	<Footer />
</div>

<style>
	.app-shell {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
	}

	main {
		flex: 1;
	}
</style>
