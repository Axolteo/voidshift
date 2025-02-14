<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Game from '$lib/Game.svelte';
	import PlayerTimer from '$lib/play/PlayerTimer.svelte';

	import { database } from '$lib/store';
	import { child, get, onValue, ref, set, update } from 'firebase/database';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	console.log($database);

	let domain = page.url.host;

	let screen = writable('create');
	let side = 'mixed';
	let userId = Math.floor(Math.random() * 9999) + '';
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
	const urlParams = page.url.searchParams;
	userId = urlParams.get('username')!;
	if (urlParams.get('username') == null) {
		userId = Math.floor(Math.random() * 9999) + '';
		page.url.searchParams.set('username', userId);
		goto(`?${page.url.searchParams.toString()}`);
	}
	let gameId = urlParams.get('game');

	function createGame() {
		gameId = (Math.random().toString(36) + '00000000000000000').slice(2, 5 + 2).toUpperCase();
		console.log(gameId);
		const gameRef = ref($database, 'games/' + gameId);

		let white = {};
		let black = {};
		let gameSide = side;
		if (side == 'mixed') {
			let rand = Math.floor(Math.random() * 2);
			if (rand == 0) {
				gameSide = 'white';
			} else {
				gameSide = 'black';
			}
		}
		if (gameSide == 'white') {
			white = {
				username: userId,
				time: time + Date.now(),
				lastTime: Date.now(),
				host: true
			};
			black = {
				username: 'waiting...',
				time: time + Date.now(),
				lastTime: Date.now(),
				host: false
			};
		} else if (gameSide == 'black') {
			white = {
				username: 'waiting...',
				time: time + Date.now(),
				lastTime: Date.now(),
				host: false
			};
			black = {
				username: userId,
				time: time + Date.now(),
				lastTime: Date.now(),
				host: true
			};
		}

		set(gameRef, {
			status: 'waiting',
			players: {
				white: white,
				black: black
			}
		});
		screen.set('send');
		page.url.searchParams.set('username', userId);
		page.url.searchParams.set('game', gameId + '');

		goto(`?${page.url.searchParams.toString()}`);
		gameReload++;
	}
	let moveDisplay: HTMLDivElement;
	let interceptedMove = false;

	let loadState: any;
	let whitePlayer = '';
	let blackPlayer = '';
	function gameMounted() {
		get(ref($database, 'games/' + gameId)).then((snapshot) => {
			if (snapshot.exists()) {
				game.move.setAll(snapshot.val().moves);
				game.setStatus(snapshot.val().status);
				console.log(snapshot.val().status);
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
					update(ref($database, 'games/' + gameId), {
						status: 'playing'
					});
					game.setPlayerSide('white');
				} else if (snapshot.val().players.black.username == 'waiting...') {
					update(ref($database, 'games/' + gameId + '/players/black'), {
						username: userId
					});
					update(ref($database, 'games/' + gameId), {
						status: 'playing'
					});
					game.setPlayerSide('black');
				} else {
					game.setPlayerSide('spectator');
				}
			}
		});
		onValue(ref($database, 'games/' + gameId), (snapshot) => {
			console.log('value changed');

			if (snapshot.exists() && game != null) {
				console.log(snapshot.val().status);
				whitePlayer = 'player' + snapshot.val().players.white.username;
				blackPlayer = 'player' + snapshot.val().players.black.username;

				if (snapshot.val().players.white.username == 'waiting...') {
					whitePlayer = 'waiting...';
				}
				if (snapshot.val().players.black.username == 'waiting...') {
					blackPlayer = 'waiting...';
				}

				const data = snapshot.val().lastMove?.move;
				console.log(snapshot.val().lastMove?.user + '\n' + userId);
				if (snapshot.val().lastMove != null && snapshot.val().lastMove.user != userId) {
					console.log(snapshot.val());
					game.move.run(data);
				}
				setTimeout(() => {
					game.setStatus(snapshot.val().status);
				}, 100);

				game.black.setDeadline(snapshot.val().players.black.time);
				game.white.setDeadline(snapshot.val().players.white.time);
				console.log(game.black.getDeadline(), game.white.getDeadline());
				timerUpdate();
			}
		});
	}
	let gameReload = 0;

	const scrollToBottom = async (node: HTMLDivElement) => {
		node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
	};

	function moveMade() {
		scrollToBottom(moveDisplay);

		let timer;
		let offset;
		let otherSide;
		if (game.getPlayerSide() == 'white') {
			otherSide = 'black';
		} else {
			otherSide = 'white';
		}
		get(ref($database, 'games/' + gameId)).then((snapshot) => {
			if (game.getPlayerSide() == 'white') {
				timer = Date.now() + game.white.getTime();
				offset = Date.now() - snapshot.val().players.white.lastTime;
			} else {
				timer = Date.now() + game.black.getTime();
				offset = Date.now() - snapshot.val().players.black.lastTime;
			}
			console.log(timer, offset);

			let updates: Record<string, any> = {};
			updates['gameState'] = game.getState();
			updates['lastMove'] = {
				move: game.move.last(),
				user: userId
			};
			updates['/moves'] = game.move.getAll();
			updates['/players/' + game.getPlayerSide() + '/time'] = timer;
			updates['/players/' + otherSide + '/lastTime'] = Date.now();
			updates['/players/' + otherSide + '/time'] = snapshot.val().players[otherSide].time + offset;
			if (game.getPlayerSide() == 'white') {
				game.black.setDeadline(snapshot.val().players[otherSide].time + offset);
			} else {
				game.white.setDeadline(snapshot.val().players[otherSide].time + offset);
			}

			update(ref($database, 'games/' + gameId), updates);

			console.log('sent move');
		});
	}
	let whiteTime: any;
	let blackTime: any;
	let currentTurn: any;
	let gameStatus = 'waiting';
	let gameIsOnline = writable(true);
	let gameInProgress = writable(gameId != null && gameStatus == 'playing');
	$: gameInProgress.set(gameId != null && gameStatus == 'playing');
	console.log(gameId);

	let moves: any[] = [];
	function winFound() {
		gameStatus = game.getStatus();
		gameInProgress.set(false);
		console.log('someone won');
		update(ref($database, 'games/' + gameId), {
			status: game.getStatus()
		});
	}
	function timerUpdate() {
		if (game == null) {
			return;
		} else {
			gameStatus = game.getStatus();
			moves = game.move.getAll();
			if (gameStatus == 'playing') {
				screen.set('game');
			}
			if (game?.white == null) {
				gameReload++;
				return;
			} else if (gameInProgress) {
				whiteTime = game.white.getTime();
				blackTime = game.black.getTime();
				if (game.move.count() % 2 == 0) {
					currentTurn = 'white';
				} else {
					currentTurn = 'black';
				}
				if (whiteTime < 0) {
					update(ref($database, 'games/' + gameId), {
						status: 'black win'
					});
				}
				if (blackTime < 0) {
					update(ref($database, 'games/' + gameId), {
						status: 'white win'
					});
				}
			}
		}
	}
</script>

<div class="w-full lg:h-full flex flex-col items-center lg:items-start lg:flex-row gap-16">
	<div
		class="relative h-full w-full flex-col items-center justify-normal flex lg:justify-between lg:gap-0 gap-16"
	>
		<div class="w-full flex flex-col justify-center lg:flex-row gap-6 lg:gap-0 lg:justify-between top-0 left-0">
			<PlayerTimer time={whiteTime} username={whitePlayer} hasTurn={currentTurn == 'white'}
				><img src="anonymous.svg" alt="pfp" /></PlayerTimer
			>
			<PlayerTimer time={blackTime} username={blackPlayer} hasTurn={currentTurn == 'black'}
				><img src="anonymous.svg" alt="pfp" /></PlayerTimer
			>
		</div>
		{#key gameReload}
			<Game
				bind:game
				on:timerUpdate={timerUpdate}
				bind:this={gameComponent}
				on:gameMounted={gameMounted}
				on:moveMade={moveMade}
				on:winFound={winFound}
				isOnline={$gameIsOnline}
			/>
		{/key}
		<div></div>
	</div>
	{#if $screen == 'create'}
		<div
			class="relative w-full min-w-92 max-w-128 max-h-172 lg:h-full lg:w-5/11 flex flex-col justify-between flex-start px-8 py-12 gap-20 items-center bg-secondary-surface rounded-lg lg:overflow-y-scroll"
		>
			<div class="flex flex-col gap-8 w-full">
				<h1 class="text-2xl font-semibold text-text w-full">create game</h1>
				<button
					on:click={createGame}
					class="bottom-8 selected w-full h-12 px-6 py-4 rounded-lg flex flex-col justify-center items-center"
					>play!</button
				>
				<div class="flex flex-col gap-3 w-full">
					<h1 class="text-xl font-semibold text-secondary-text">side</h1>
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
					<h1 class="text-xl font-semibold text-secondary-text">time</h1>
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
			</div>
		</div>
	{/if}
	{#if $screen == 'game'}
		<div
			class="relative w-full min-w-92 max-w-128 max-h-172 lg:h-full lg:w-5/11 flex flex-col bg-secondary-surface rounded-lg"
		>
			<div
				class="w-full backdrop-blur-3xl rounded-t-lg py-5 h-16 bg-transparent-surface flex flex-col justify-center items-center"
			>
				<h1 class="font-semibold text-xl"><span class="{whitePlayer.includes(userId) ? 'text-accent-strong' : ''}">{whitePlayer}</span> vs <span class="{blackPlayer.includes(userId) ? 'text-accent-strong' : ''}">{blackPlayer}</span></h1>
			</div>
			<div
				class="h-full min-h-32 pb-16 flex flex-col px-8 overflow-y-scroll"
				bind:this={moveDisplay}
			>
				{#each { length: Math.ceil(moves?.length / 2) } as _, index}
					<div class="h-14 text-secondary-text flex gap-6 flex-row items-center">
						<div
							class="font-semibold text-text h-14 w-14 flex flex-col items-center justify-center"
						>
							{index + 1}.
						</div>
						<div class="h-14 w-full flex flex-row items-center">
							{game.move.encode(moves[index * 2])}
						</div>
						<div class="h-14 w-full flex flex-row items-center">
							{game.move.encode(moves[index * 2 + 1])}
						</div>
					</div>
				{/each}
			</div>
			<div
				class="text-lg backdrop-blur-3xl flex flex-row justify-center gap-1 items-center rounded-b-lg bg-transparent-surface w-full h-24"
			>
				<span class="font-semibold text-accent-strong"
					>{Math.ceil((6 - (game.move.count() % 6)) / 2)}</span
				>
				move{Math.ceil((6 - (game.move.count() % 6)) / 2) == 1 ? '' : 's'} until swap
			</div>
		</div>
	{/if}
	{#if $screen == 'send'}
		<div
			class="relative w-full min-w-92 max-w-128 max-h-172 lg:h-full lg:w-5/11 flex flex-col justify-between flex-start px-8 py-12 gap-20 items-center bg-secondary-surface lg:gap-0 rounded-lg lg:overflow-y-scroll"
		>
			<div class="flex flex-col gap-8 w-full">
				<h1 class="text-2xl font-semibold text-text w-full">invite others</h1>

				<div class="flex flex-col gap-3 w-full">
					<h1 class="text-xl font-semibold text-secondary-text">game link</h1>
					<input
						spellcheck="false"
						class="outline-0 bg-surface rounded-lg h-12 w-full p-4"
						value={domain +
							'/play?game=' +
							gameId +
							'&username=' +
							Math.floor(Math.random() * 9999)}
					/>
				</div>

				<div class="flex flex-col gap-3 w-full">
					<h1 class="text-xl font-semibold text-secondary-text">code</h1>
					<input class="outline-0 bg-surface rounded-lg h-12 w-full p-4" value={gameId} />
				</div>
			</div>
			<h1>waiting for opponent...</h1>
		</div>
	{/if}
</div>
