<script lang="ts">
	import { goto } from '$app/navigation';
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
	let playlists: Playlist<TrackItem>[] | null = null;
	let loadingPlaylists = false;
	let selectedPlaylist: string | null = null;

	onMount(() => {
		sdk = SpotifyApi.withUserAuthorization(PUBLIC_SPOTIFY_CLIENT_ID, PUBLIC_SPOTIFY_REDIRECT_URI, [
			'user-read-email',
			'playlist-modify-public',
			'playlist-modify-private'
		]);
	});

	const getPlaylists = async () => {
		if (!sdk) return;

		if (!user) user = await sdk.currentUser.profile();

		loadingPlaylists = true;

		playlists = [];
		let offset = 0;

		let playlistPage = await sdk.playlists.getUsersPlaylists(user.id, 50);

		while (playlistPage.items.length > 0) {
			playlists = playlists.concat(playlistPage.items);
			offset += playlistPage.items.length;
			playlistPage = await sdk.playlists.getUsersPlaylists(user.id, 50, offset);
		}

		loadingPlaylists = false;
	};
</script>

<div class="flex h-screen w-screen flex-col items-center justify-center">
	<h1>Cinderella</h1>
	<p>Turn your random ordered playlist into something that makes sense.</p>

	<div>
		<div class="flex gap-2">
			<Combobox
				disabled={!playlists}
				bind:value={selectedPlaylist}
				items={playlists ? playlists.map((p) => ({ label: p.name, value: p.id })) : []}
				itemName="playlist"
			/>
			<Button disabled={!selectedPlaylist} on:click={() => goto(`/${selectedPlaylist}`)}
				>Drop the shoe</Button
			>
		</div>
		<Button disabled={loadingPlaylists} on:click={getPlaylists} variant="link" size="sm">
			{loadingPlaylists ? 'Getting playlists...' : 'Get playlists'}
		</Button>
	</div>
</div>
