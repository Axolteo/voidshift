<script>
	  import { CircleUser } from 'lucide-svelte';
</script>

<div class="w-full h-16 flex flex-row justify-between">
	<div class="flex flex-row gap-6 items-center">
		<img src="voidshift.svg" class="w-12 h-12" alt="logo" />
		<p class="font-semibold text-xl">voidshift</p>
	</div>
	<div class="flex flex-row gap-8 items-center">
		<navlink class="font-semibold text-base">play</navlink>
		<navlink class="font-semibold text-base">about</navlink>
		<navlink class="font-semibold text-base">tutorial</navlink>
		<navlink class="font-semibold text-base">settings</navlink>
        <navlink class="font-semibold text-base"><CircleUser /></navlink>
	</div>
</div>
