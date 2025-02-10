<script lang="ts">
	import { page } from '$app/stores';
	import Game from '$lib/Game.svelte';
	import PlayerTimer from '$lib/play/PlayerTimer.svelte';

	import { database } from '$lib/store';
	import { child, get, onValue, ref, set, update } from 'firebase/database';
	import { onMount } from 'svelte';
	console.log($database);

	let screen = 'create';
	let side = 'mixed';
	let time = 5 * 60000;

	function chooseSide(choose: string) {
		side = choose;
	}

	function chooseTime(choose: number) {
		time = choose;
		console.log('time changed to' + choose);
	}

	let game: Game['game'];

	let gameComponent: Game;
	let window: Window;
	const urlParams = $page.url.searchParams;
	let userId = urlParams.get('username')!;
	let gameId = urlParams.get('game');

	function createGame() {
		gameId = (Math.random().toString(36) + '00000000000000000').slice(2, 5 + 2).toUpperCase();
		console.log(gameId);
		const gameRef = ref($database, 'games/' + gameId);

		let white = {};
		let black = {};

		if (side == 'mixed') {
			let rand = Math.floor(Math.random() * 2);
			if (rand == 0) {
				side = 'white';
			} else {
				side = 'black';
			}
		}
		if (side == 'white') {
			white = {
				username: userId,
				time: time + Date.now(),
				host: true
			};
			black = {
				username: 'waiting...',
				time: time + Date.now(),
				host: false
			};
		} else if (side == 'black') {
			white = {
				username: 'waiting...',
				time: time + Date.now(),
				host: false
			};
			black = {
				username: userId,
				time: time + Date.now(),
				host: true
			};
		}

		set(gameRef, {
			players: {
				white: white,
				black: black
			}
		});
	}

	let interceptedMove = false;

	let loadState: any;

	function gameMounted() {
		get(ref($database, 'games/' + gameId)).then((snapshot) => {
			if (snapshot.exists()) {
				game.setState(snapshot.val().gameState);
				loadState = snapshot.val().lastMove;
				game.white.setDeadline(snapshot.val().players.white.time);
				game.black.setDeadline(snapshot.val().players.black.time);
				timerUpdate();

				if (snapshot.val().players.white.username == userId) {
					game.setPlayerSide('white');
				} else if (snapshot.val().players.black.username == userId) {
					game.setPlayerSide('black');
				} else if (snapshot.val().players.white.username == 'waiting...') {
					update(ref($database, 'games/' + gameId + '/players/white'), {
						username: userId
					});
					game.setPlayerSide('white');
				} else if (snapshot.val().players.black.username == 'waiting...') {
					update(ref($database, 'games/' + gameId + '/players/black'), {
						username: userId
					});
					game.setPlayerSide('black');
				} else {
					game.setPlayerSide('spectator');
				}
			}
		});
		onValue(ref($database, 'games/' + gameId), (snapshot) => {
			if (snapshot.exists() && loadState != null) {
				const data = snapshot.val().lastMove.move;
				console.log(snapshot.val().lastMove.user + '\n' + userId);
				if (snapshot.val().lastMove.user != userId) {
					interceptedMove = true;
					console.log(snapshot.val());
					game.move.run(data);
					game.white.setDeadline(snapshot.val().players.white.time);
					game.black.setDeadline(snapshot.val().players.black.time);

					timerUpdate();
				}
			}
		});
	}

	function moveMade() {
		console.log(interceptedMove);
		if (!interceptedMove) {
			let timer;
			if (game.getPlayerSide() == 'white') {
				timer = Date.now() + game.white.getTime();
			} else {
				timer = Date.now() + game.black.getTime();
			}
			console.log(timer);

			let updates: Record<string, any> = {};
			updates['gameState'] = game.getState();
			updates['lastMove'] = {
				move: game.move.last(),
				user: userId
			};
			updates['moves'] = game.move.getAll();
			updates['/players/' + game.getPlayerSide() + '/time'] = timer;
			update(ref($database, 'games/' + gameId), updates);
			console.log('sent move');
		}
		interceptedMove = false;
		console.log('new move intercept ', interceptedMove);
	}
	let whiteTime: any;
	let blackTime: any;
	let currentTurn: any;
	function timerUpdate() {
		whiteTime = game.white.getTime();
		blackTime = game.black.getTime();
		if (game.move.count() % 2 == 0) {
			currentTurn = 'white';
		} else {
			currentTurn = 'black';
		}
	}
</script>

<div class="w-full lg:h-full flex flex-col lg:flex-row gap-16">
	<div class="relative h-full w-full flex-col items-center justify-normal flex gap-16">
		<div class="w-full flex flex-row justify-between top-0 left-0">
			<PlayerTimer time={whiteTime} username="white" hasTurn={currentTurn == 'white'}
				><img src="anonymous.svg" alt="pfp" /></PlayerTimer
			>
			<PlayerTimer time={blackTime} username="black" hasTurn={currentTurn == 'black'}
				><img src="anonymous.svg" alt="pfp" /></PlayerTimer
			>
		</div>
		<Game
			bind:game
			on:timerUpdate={timerUpdate}
			bind:this={gameComponent}
			on:gameMounted={gameMounted}
			on:moveMade={moveMade}
		/>
	</div>
	{#if screen == 'create'}
		<div
			class="relative w-full lg:h-full lg:w-5/11 flex flex-col justify-between px-8 py-12 gap-20 items-center bg-secondary-surface rounded-lg lg:overflow-y-scroll"
		>
			<div class="flex flex-col gap-3 w-full">
				<h1 class="text-2xl font-semibold text-secondary-text">side</h1>
				<div class="flex flex-row gap-6 w-full">
					<button
						on:click={() => {
							chooseSide('white');
						}}
						class="bg-surface duration-200 {side == 'white'
							? 'selected'
							: ''} h-12 w-full flex items-center justify-center flex-row rounded-lg"
					>
						<img src="pieces/white piece.svg" alt="white" />
					</button>
					<button
						on:click={() => {
							chooseSide('mixed');
						}}
						class="bg-surface duration-200 {side == 'mixed'
							? 'selected'
							: ''} h-12 w-full flex items-center justify-center flex-row rounded-lg"
					>
						<img src="pieces/interracial piece.svg" alt="mixed" />
					</button>
					<button
						on:click={() => {
							chooseSide('black');
						}}
						class="bg-surface duration-200 {side == 'black'
							? 'selected'
							: ''} h-12 w-full flex items-center justify-center flex-row rounded-lg"
					>
						<img src="pieces/black piece.svg" alt="black" />
					</button>
				</div>
			</div>

			<div class="flex flex-col gap-3 w-full">
				<h1 class="text-2xl font-semibold text-secondary-text">time</h1>
				<div class="flex flex-row gap-6 w-full">
					<button
						on:click={() => {
							chooseTime(1 * 60000);
						}}
						class="bg-surface duration-200 {time == 1 * 60000
							? 'selected'
							: ''} h-12 w-full flex items-center justify-center flex-row rounded-lg"
					>
						1:00
					</button>
					<button
						on:click={() => {
							chooseTime(5 * 60000);
						}}
						class="bg-surface duration-200 {time == 5 * 60000
							? 'selected'
							: ''} h-12 w-full flex items-center justify-center flex-row rounded-lg"
					>
						5:00
					</button>
					<button
						on:click={() => {
							chooseTime(10 * 60000);
						}}
						class="bg-surface duration-200 {time == 10 * 60000
							? 'selected'
							: ''} h-12 w-full flex items-center justify-center flex-row rounded-lg"
					>
						10:00
					</button>
				</div>
			</div>
			<button
				on:click={createGame}
				class="bottom-8 bg-surface h-12 px-6 py-4 rounded-lg flex flex-col justify-center items-center"
				>create game</button
			>
		</div>
	{/if}
	{#if screen == 'game'}
		<div
			class="relative w-full lg:h-full lg:w-5/11 flex flex-col justify-between px-8 py-12 gap-20 items-center bg-secondary-surface rounded-lg lg:overflow-y-scroll"
		>
			<button
				on:click={createGame}
				class="bottom-8 bg-surface h-12 px-6 py-4 rounded-lg flex flex-col justify-center items-center"
				>create game</button
			>
		</div>
	{/if}
</div>
