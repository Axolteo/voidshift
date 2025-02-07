<script lang="ts">
	import Game from '$lib/Game.svelte';

	import PlayerTimer from '$lib/play/PlayerTimer.svelte';

	let side = 'mixed';
	let time = 1;

	function chooseSide(choose: string) {
		side = choose;
	}

	function chooseTime(choose: number) {
		time = choose;
	}

	let gameView: Game;
</script>

<div class="w-full h-full flex flex-row gap-16">
	<div class="relative h-full w-full flex-col items-center justify-center hidden sm:flex pt-16">
		<div class="absolute w-full flex flex-row justify-between top-0 left-0">
			<PlayerTimer><img src="anonymous.svg" alt="pfp" /></PlayerTimer>
			<PlayerTimer><img src="anonymous.svg" alt="pfp" /></PlayerTimer>
		</div>
		<Game bind:this={gameView} />
	</div>
	<div
		class="relative h-full w-5/11 flex flex-col justify-between px-8 py-12 gap-12 items-center bg-secondary-surface rounded-lg overflow-y-scroll"
	>
		<div class="flex flex-col gap-6 w-full">
			<h1 class="text-3xl font-semibold">play</h1>
			<div class="flex flex-col gap-2">
				<h1 class="text-2xl font-semibold text-secondary-text">side</h1>
				<div class="flex flex-row gap-6 w-full">
					<button
						on:click={() => {
							chooseTime(1);
						}}
						class="bg-surface duration-200 {time == 1
							? 'selected'
							: ''} h-12 w-full flex items-center justify-center flex-row rounded-lg"
					>
						<img src="pieces/white piece.svg" alt="white" />
					</button>
					<button
						on:click={() => {
							chooseTime(5);
						}}
						class="bg-surface duration-200 {time == 5
							? 'selected'
							: ''} h-12 w-full flex items-center justify-center flex-row rounded-lg"
					>
						<img src="pieces/interracial piece.svg" alt="mixed" />
					</button>
					<button
						on:click={() => {
							chooseTime(10);
						}}
						class="bg-surface duration-200 {time == 10
							? 'selected'
							: ''} h-12 w-full flex items-center justify-center flex-row rounded-lg"
					>
						<img src="pieces/black piece.svg" alt="black" />
					</button>
				</div>
			</div>

			<div class="flex flex-col gap-2">
				<h1 class="text-2xl font-semibold text-secondary-text">time</h1>
				<div class="flex flex-row gap-6 w-full">
					<button
						on:click={() => {
							chooseSide('white');
						}}
						class="bg-surface duration-200 {side == 'white'
							? 'selected'
							: ''} h-12 w-full flex items-center justify-center flex-row rounded-lg"
					>
						1:00
					</button>
					<button
						on:click={() => {
							chooseSide('mixed');
						}}
						class="bg-surface duration-200 {side == 'mixed'
							? 'selected'
							: ''} h-12 w-full flex items-center justify-center flex-row rounded-lg"
					>
						5:00
					</button>
					<button
						on:click={() => {
							chooseSide('black');
						}}
						class="bg-surface duration-200 {side == 'black'
							? 'selected'
							: ''} h-12 w-full flex items-center justify-center flex-row rounded-lg"
					>
						10:00
					</button>
				</div>
			</div>
		</div>
		<button
			class="selected h-12 px-6 py-4 rounded-lg flex flex-col justify-center items-center"
			>create game</button
		>
	</div>
</div>
