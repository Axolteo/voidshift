<script lang="ts">
	import Game from '$lib/Game.svelte';

	import Swords from 'lucide-svelte/icons/swords';
	import Bot from 'lucide-svelte/icons/bot';
	import BookText from 'lucide-svelte/icons/book-text';
	import GraduationCap from 'lucide-svelte/icons/graduation-cap';
</script>

<div class="w-full h-full flex flex-row gap-6">
	<div class="h-full w-full flex flex-col py-4 gap-12">
		<div class="flex flex-col gap-1">
			<h1 class="text-3xl font-semibold">voidshift</h1>
			<h2 class="text-xl text-secondary-text">connect four but with quite a literal twist</h2>
		</div>
		<div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
			<a href="/play"
				><button
					class="hover:cursor-pointer w-full outline-none shadow bg-accent-strong flex flex-row items-center justify-center gap-4 h-16 rounded-lg text-xl"
					><Swords />
					<p>create a game</p></button
				></a
			>
			<a href="/play"
				><button
					class="hover:cursor-pointer w-full outline-none shadow bg-accent-strong flex flex-row items-center justify-center gap-4 h-16 rounded-lg text-xl"
					><BookText />
					<p>learn to play</p></button
				></a
			>
			<a href="/play"
				><button
					class="hover:cursor-pointer w-full outline-none shadow bg-accent-strong flex flex-row items-center justify-center gap-4 h-16 rounded-lg text-xl"
					><Bot />
					<p>play vs a bot</p></button
				></a
			>
			<a href="/play"
				><button
					class="hover:cursor-pointer w-full outline-none shadow bg-accent-strong flex flex-row items-center justify-center gap-4 h-16 rounded-lg text-xl"
					><GraduationCap />
					<p>analyze positions</p></button
				></a
			>
		</div>
	</div>
	<div class="h-full w-full flex-col items-center justify-center hidden sm:flex pl">
		<Game />
	</div>
</div>
