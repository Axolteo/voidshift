<script>
	import '../app.css';
	import Navbar from '$lib/Navbar.svelte';

	let { children } = $props();

	import { onNavigate } from '$app/navigation';

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<div
	class="bg-surface w-screen h-dvh fixed top-0 left-0 p-16 flex flex-col gap-8 overflow-y-scroll pt-32"
>
	{@render children()}
	<Navbar />
</div>
