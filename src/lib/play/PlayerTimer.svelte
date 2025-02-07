<script lang="ts">
	export let time = 0;
	export let username = 'anonymous';

	function msToTime(ms: string | number | Date) {
		return new Date(ms).toISOString().slice(14, 21); // "03:25:45.000"
	}
</script>

<div class="px-6 py-4 bg-secondary-surface rounded-lg flex flex-row gap-6">
	<div class="flex flex-row gap-4">
		<slot />
		<p class="text-xl font-semibold text-text">{username}</p>
	</div>
	<p class="text-xl text-secondary-text">{msToTime(time)}</p>
</div>
