<script lang="ts">
	import { browser } from '$app/environment';
	import { goto, invalidateAll } from '$app/navigation';
	import Combobox from '$lib/components/Combobox.svelte';
	import { Button } from '$lib/components/ui/button';
	import { loading, sdk, user } from '$lib/stores';
	import { type Playlist, type TrackItem } from '@spotify/web-api-ts-sdk';

	let selectedPlaylist: string | null = null;

	const getPlaylists = async () => {
		while (!$sdk) await new Promise((r) => setTimeout(r, 100));

		user.set(await $sdk.currentUser.profile());
		if (!$user) return [];

		let playlists: Playlist<TrackItem>[] = [];
		let offset = 0;

		let playlistPage = await $sdk.playlists.getUsersPlaylists($user.id, 50, offset);

		while (playlistPage.items.length > 0) {
			playlists = playlists.concat(playlistPage.items);
			offset += playlistPage.items.length;
			playlistPage = await $sdk.playlists.getUsersPlaylists($user.id, 50, offset);
		}

		return playlists;
	};
</script>

<div class="flex h-screen w-screen flex-col items-center justify-center text-center">
	<h2 class="mb-4 text-4xl">Cinderella</h2>
	<h1 class="xs:text-lg mb-8">
		Turn your random ordered playlist into something that makes sense.
	</h1>

	{#if $loading}
		<div>Loading...</div>
	{:else}
		<div class="flex gap-2">
			<Combobox {getPlaylists} bind:value={selectedPlaylist} />
			<Button disabled={!selectedPlaylist} on:click={() => goto(`/${selectedPlaylist}`)}>
				Drop the shoe
			</Button>
		</div>

		{#if browser && localStorage.getItem('spotify-sdk:AuthorizationCodeWithPKCEStrategy:token')}
			<Button class="mt-8" on:click={() => $sdk?.logOut() && invalidateAll()}>Logout</Button>
		{/if}
	{/if}
</div>
