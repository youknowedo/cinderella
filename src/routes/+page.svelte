<script lang="ts">
	import { browser } from '$app/environment';
	import { goto, invalidateAll } from '$app/navigation';
	import { PUBLIC_SPOTIFY_CLIENT_ID, PUBLIC_SPOTIFY_REDIRECT_URI } from '$env/static/public';
	import Combobox from '$lib/components/Combobox.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		SpotifyApi,
		type Page,
		type Playlist,
		type TrackItem,
		type User
	} from '@spotify/web-api-ts-sdk';
	import { onMount } from 'svelte';

	let sdk: SpotifyApi | null = null;
	let user: User | null = null;
	let selectedPlaylist: string | null = null;

	onMount(() => {
		sdk = SpotifyApi.withUserAuthorization(PUBLIC_SPOTIFY_CLIENT_ID, PUBLIC_SPOTIFY_REDIRECT_URI, [
			'user-read-email',
			'playlist-modify-public',
			'playlist-modify-private',
			'playlist-read-collaborative',
			'playlist-read-private'
		]);
	});

	const getPlaylists = async () => {
		if (!sdk) return [];

		if (!user) user = await sdk.currentUser.profile();

		let playlists: Playlist<TrackItem>[] = [];
		let offset = 0;

		let playlistPage = await sdk.playlists.getUsersPlaylists(user.id, 50, offset);

		while (playlistPage.items.length > 0) {
			playlists = playlists.concat(playlistPage.items);
			offset += playlistPage.items.length;
			playlistPage = await sdk.playlists.getUsersPlaylists(user.id, 50, offset);
		}

		return playlists;
	};
</script>

<div class="flex h-screen w-screen flex-col items-center justify-center">
	<h2 class="mb-4 text-4xl">Cinderella</h2>
	<h1 class="mb-8 text-lg">Turn your random ordered playlist into something that makes sense.</h1>

	<div class="flex gap-2">
		<Combobox {getPlaylists} bind:value={selectedPlaylist} />
		<Button disabled={!selectedPlaylist} on:click={() => goto(`/${selectedPlaylist}`)}>
			Drop the shoe
		</Button>
	</div>

	{#if browser && localStorage.getItem('spotify-sdk:AuthorizationCodeWithPKCEStrategy:token')}
		<Button class="mt-8" on:click={() => sdk?.logOut() && invalidateAll()}>Logout</Button>
	{/if}
</div>
