<script>
	import { CircleUser } from 'lucide-svelte';
</script>

<div class="fixed w-full h-24 top-0 left-0 navfade"></div>

<div class="fixed top-8 left-8 w-full h-16 flex flex-row justify-between">
	<div class="flex flex-row gap-6 items-center">
		<img src="voidshift.svg" class="w-12 h-12" alt="logo" />
		<p class="font-semibold text-xl">voidshift</p>
	</div>
	<div class="flex flex-row gap-8 items-center">
		<navlink class="font-semibold text-base">play</navlink>
		<navlink class="font-semibold text-base">about</navlink>
		<navlink class="font-semibold text-base">tutorial</navlink>
		<navlink class="font-semibold text-base">settings</navlink>
		<navlink class="font-semibold text-base pr-14"><CircleUser /></navlink>
	</div>
</div>
