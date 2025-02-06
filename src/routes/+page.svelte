<script lang="ts">
	import Game from '$lib/Game.svelte';

	import { Swords, Bot, BookText, GraduationCap } from 'lucide-svelte';
</script>

<div class="w-full h-full flex flex-row mb-16">
	<div class="h-full w-full flex flex-col px-8 py-12 gap-12">
		<div class="flex flex-col gap-1">
			<h1 class="text-3xl font-semibold">voidshift</h1>
			<h2 class="text-xl text-secondary-text">connect four but with quite a literal twist</h2>
		</div>
		<div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
			<button
				class="outline-none shadow bg-accent-strong flex flex-row items-center justify-center gap-4 h-16 rounded-lg font-semibold text-xl"
				><Swords />
				<p>create a game</p></button
			>
			<button
				class="outline-none shadow bg-accent-strong flex flex-row items-center justify-center gap-4 h-16 rounded-lg font-semibold text-xl"
				><BookText />
				<p>learn the game</p></button
			>
			<button
				class="outline-none shadow bg-accent-strong flex flex-row items-center justify-center gap-4 h-16 rounded-lg font-semibold text-xl"
				><Bot />
				<p>play vs a bot</p></button
			>
			<button
				class="outline-none shadow bg-accent-strong flex flex-row items-center justify-center gap-4 h-16 rounded-lg font-semibold text-xl"
				><GraduationCap />
				<p>analyze positions</p></button
			>
		</div>
	</div>
	<div class="h-full w-full flex flex-col items-center justify-center hidden sm:inline">
		<Game />
	</div>
</div>