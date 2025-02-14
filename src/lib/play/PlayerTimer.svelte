<script lang="ts">
	export let time = 0;
	export let username = 'anonymous';
	export let hasTurn = false;

	function msToTime(ms: number) {
		if (isNaN(ms)) {
			ms = 0;
		}
		if (ms < 0) {
			ms = 0;
		}
		return new Date(ms).toISOString().slice(14, 21); // "03:25:45.000"
	}
</script>

<div class="px-6 py-4 {hasTurn ? 'bg-ternary-surface' : 'bg-secondary-surface'} rounded-lg flex flex-row justify-between">
	<div class="flex flex-row gap-4">
		<slot />
		<p class="text-xl font-semibold text-text w-32 truncate">{username}</p>
	</div>
	<p class="text-xl text-secondary-text">{msToTime(time)}</p>
</div>
