<script>
	import { CircleUser } from 'lucide-svelte';
</script>

<div class="fixed w-full h-24 top-0 left-0 navfade"></div>

<div class="fixed top-8 left-8 w-full h-16 flex flex-row justify-between">
	<div class="flex flex-row gap-6 items-center">
		<img src="voidshift.svg" class="w-12 h-12" alt="logo" />
		<a class="font-semibold text-xl" href="/">voidshift</a>
	</div>
	<div class="flex flex-row gap-8 items-center">
		<a class="font-semibold text-base" href="/play">play</a>
		<a class="font-semibold text-base" href="/about">about</a>
		<a class="font-semibold text-base" href="/learn">tutorial</a>
		<a class="font-semibold text-base" href="/settings">settings</a>
		<a class="font-semibold text-base pr-14" href="/account"><CircleUser /></a>
	</div>
</div>
