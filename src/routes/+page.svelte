<script>
	import Game from '$lib/Game.svelte';
	/**
	 * @type {any}
	 */
	let moveLog;
	/**
	 * @type {import("svelte").SvelteComponent<{ moveLog?: any[] | undefined; getGameState?: (() => void) | undefined; }, { [evt: string]: CustomEvent<any>; }, {}> & { $$bindings?: string | undefined; } & { getGameState: () => void; }}
	 */
	let game;
</script>

<div class="h-screen w-screen p-16">
	<div class="flex flex-row justify-center gap-12">
		<Game bind:moveLog bind:this={game} />

		<div class="w-64 grid grid-cols-2 gap-6 bg-slate-100 p-6 auto-rows-min  rounded-md">
			{#each moveLog as loggedMove}
				<p>
					{(loggedMove.from.segment + 10).toString(36)}{loggedMove.from.ring}{(
						loggedMove.to.segment + 10
					).toString(36)}{loggedMove.to.ring}
				</p>
			{/each}
		</div>
	</div>
</div>
