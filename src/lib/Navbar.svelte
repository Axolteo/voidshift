<script>
	import CircleUser from 'lucide-svelte/icons/circle-user';
</script>

<div class="fixed w-full h-24 top-0 left-0 navfade"></div>

<div class="fixed top-8 left-8 w-[calc(100vw-4rem)] h-16 flex flex-row justify-between">
	<a href="/" class="flex flex-row gap-6 items-center">
		<img src="voidshift.svg" class="w-12 h-12" alt="logo" />
		<p class="font-semibold text-xl">voidshift</p>
	</a>
	<div class="flex flex-row gap-8 items-center">
		<a class="font-semibold text-base" href="/play">play</a>
		<a class="font-semibold text-base" href="/about">about</a>
		<a class="font-semibold text-base" href="/learn">tutorial</a>
		<a class="font-semibold text-base" href="/settings">settings</a>
		<a class="font-semibold text-base" href="/account"><img src="anonymous.svg" alt="pfp" /></a>
	</div>
</div>
