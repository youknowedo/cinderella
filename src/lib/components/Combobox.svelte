<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { cn } from '$lib/utils.js';
	import type { Playlist, TrackItem } from '@spotify/web-api-ts-sdk';
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';

	export let items: { label: string; value: string }[] = [];

	let open = false;
	export let value: string | null = null;
	export let getPlaylists: () => Promise<Playlist<TrackItem>[]>;
	let loadingPlaylists = false;

	$: selectedLabel = items.find((f) => f.value === value)?.label ?? `Select playlist...`;

	const closeAndFocusTrigger = (triggerId: string) => {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	};
</script>

<Popover.Root bind:open let:ids>
	<Popover.Trigger asChild let:builder>
		<Button
			on:click={() => {
				loadingPlaylists = true;
				getPlaylists().then((v) => {
					loadingPlaylists = false;
					items = v.map((playlist) => ({
						label: playlist.name,
						value: playlist.id
					}));
				});
			}}
			builders={[builder]}
			variant="outline"
			role="combobox"
			aria-expanded={open}
			class="w-[200px] justify-between"
		>
			{selectedLabel}
			<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-[200px] p-0">
		<Command.Root>
			<Command.Input placeholder="Search playlists..." />
			<Command.Empty>
				{loadingPlaylists ? 'Loading playlists...' : 'No playlists found.'}
			</Command.Empty>
			<Command.Group>
				{#each items as item}
					<Command.Item
						value={item.value}
						onSelect={(currentValue) => {
							value = currentValue;
							closeAndFocusTrigger(ids.trigger);
						}}
					>
						<Check class={cn('mr-2 h-4 w-4', value !== item.value && 'text-transparent')} />
						{item.label}
					</Command.Item>
				{/each}
			</Command.Group>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
