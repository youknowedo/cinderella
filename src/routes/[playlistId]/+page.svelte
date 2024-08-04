<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Chart from '$lib/components/Chart.svelte';
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { methods, sortMethods, sortWithMethod, type SortMethod } from '$lib/methods';
	import { loading, sdk, user } from '$lib/stores';
	import type { Playlist, TrackItem } from '@spotify/web-api-ts-sdk';
	import Chevron from 'lucide-svelte/icons/chevron-left';
	import CircleAlert from 'lucide-svelte/icons/circle-alert';
	import { onMount } from 'svelte';

	let playlist: Playlist<TrackItem> | null = null;
	let isOwner = true;
	let selectedSortMethod: SortMethod = 'ascending';
	let tracks: { name: string; tempo: number; uri: string }[] | null = null;
	let originalTracks: { name: string; tempo: number; uri: string }[] | null = null;

	onMount(() =>
		(async () => {
			while (!$sdk) await new Promise((r) => setTimeout(r, 100));

			loading.set(true);

			if (!$user) user.set(await $sdk.currentUser.profile());
			if (!$user) return; // This should never happen

			playlist = await $sdk.playlists.getPlaylist($page.params.playlistId);
			isOwner = playlist.owner.id === $user.id;

			const tempos = await $sdk.tracks
				.audioFeatures(playlist.tracks.items.map((t) => t.track.id))
				.then((f) => f.map((t) => t.tempo));

			tracks = playlist.tracks.items.map((t, i) => ({
				name: t.track.name,
				tempo: tempos[i] ?? 0,
				uri: t.track.uri
			}));
			originalTracks = [...tracks];

			loading.set(false);
		})()
	);
</script>

<div class="container py-12">
	<div class="mb-4 flex items-center justify-between">
		{#if playlist}
			<button on:click={() => goto('/')} class="flex items-center justify-start gap-2">
				<Chevron class="h-8" />
				<h1 class="mb-1 text-left text-xl font-bold md:text-3xl">
					{playlist.name}
				</h1>
			</button>
			<Button
				variant="outline"
				on:click={() => window.open(`https://open.spotify.com/playlist/${playlist?.id}`, '_blank')}
			>
				View playlist
			</Button>
		{:else}
			<Skeleton class="h-9 w-96" />
			<Skeleton class="h-9 w-96" />
		{/if}
	</div>

	{#if !isOwner}
		<div class="mb-4">
			<Alert.Root variant="default">
				<CircleAlert class="h-4 w-4" />
				<Alert.Title>Heads up!</Alert.Title>
				<Alert.Description>
					You don't own this playlist. If you continue we'll make a new playlist for you.
				</Alert.Description>
			</Alert.Root>
		</div>
	{/if}

	<div class="mb-4 grid grid-cols-3 rounded-md bg-muted p-1 sm:grid-cols-5">
		{#each sortMethods as method}
			<button
				class="rounded-md py-2 duration-200
					{selectedSortMethod == method.value
					? 'bg-white text-black'
					: 'text-muted-foreground hover:text-black'}"
				on:click={() => (selectedSortMethod = method.value)}
			>
				{method.label}
			</button>
		{/each}
	</div>

	{#if !$loading && tracks}
		<Chart
			methodData={methods(tracks)[selectedSortMethod]()}
			playlistData={tracks.map((t, i) => {
				if (!$sdk) return { name: t.name, tempo: 0, track: i };

				return { name: t.name ?? '', tempo: t.tempo, track: i };
			})}
		/>
	{:else}
		<Skeleton class="h-[300px] w-full rounded-sm" />
	{/if}

	<div class="mt-4 flex justify-between">
		<div>
			<Button
				variant="default"
				disabled={!tracks}
				on:click={() => sortWithMethod(selectedSortMethod, tracks ?? [])}
			>
				Reorder Playlist
			</Button>
			<Button
				disabled={tracks == originalTracks}
				variant="destructive"
				on:click={() => (tracks = originalTracks)}
			>
				Reset
			</Button>
		</div>
		<Button
			disabled={tracks == originalTracks}
			on:click={async () => {
				if (!$sdk || !tracks || !$user || !playlist) return;

				if (!isOwner)
					playlist = await $sdk.playlists.createPlaylist($user.id, {
						name: `${playlist.name} - Reordered`,
						description: `Reordered by tempo`,
						public: false
					});
				$sdk.playlists.updatePlaylistItems(playlist.id, {
					uris: tracks.map((t) => t.uri)
				});

				goto(`/${playlist.id}`);
			}}
		>
			{isOwner ? 'Update' : 'Create'} playlist
		</Button>
	</div>
</div>
