<script>
	import '../app.css';
	import Navbar from '$lib/Navbar.svelte';

	let { children } = $props();
</script>

<div class="bg-surface w-screen h-screen absolute top-0 left-0 p-8 flex flex-col gap-8">
	<Navbar />
	{@render children()}
</div>
