<script lang="ts">
	import Game from '$lib/Game.svelte';

	import House from 'lucide-svelte/icons/house';
	import Bot from 'lucide-svelte/icons/bot';
	import BookText from 'lucide-svelte/icons/book-text';
	import GraduationCap from 'lucide-svelte/icons/graduation-cap';
</script>

<div class="w-full h-full flex flex-row gap-16">
	<div class="h-full w-full flex flex-col py-4 gap-12">
		<div class="flex flex-col gap-1">
			<h1 class="text-3xl font-semibold">404 - page not found</h1>
			<h2 class="text-xl text-secondary-text">message me on discord if this is a mistake!</h2>
		</div>
		<div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
			<a href="/"
				><button
					class="hover:cursor-pointer px-8 outline-none shadow bg-accent-strong flex flex-row items-center justify-center gap-4 h-16 rounded-lg text-xl"
					><House />
					<p>back to home</p></button
				></a
			>
		</div>
	</div>
	<div class="h-full w-full flex-col items-center justify-center hidden sm:flex pl">
		<Game />
	</div>
</div>
