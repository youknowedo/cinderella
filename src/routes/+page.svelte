<script lang="ts">
	import { PUBLIC_SPOTIFY_CLIENT_ID, PUBLIC_SPOTIFY_REDIRECT_URI } from '$env/static/public';
	import { Button } from '$lib/components/ui/button';
	import { SpotifyApi } from '@spotify/web-api-ts-sdk';
	import { onMount } from 'svelte';

	let sdk: SpotifyApi | null = null;

	onMount(() => {
		sdk = SpotifyApi.withUserAuthorization(PUBLIC_SPOTIFY_CLIENT_ID, PUBLIC_SPOTIFY_REDIRECT_URI, [
			'playlist-modify-public',
			'playlist-modify-private'
		]);
	});
</script>

<div class="flex h-screen w-screen flex-col items-center justify-center">
	<h1>Cinderella</h1>
	<p>Turn your random ordered playlist into something that makes sense.</p>

	<Button
		on:click={async () => {
			sdk = SpotifyApi.withUserAuthorization(
				PUBLIC_SPOTIFY_CLIENT_ID,
				PUBLIC_SPOTIFY_REDIRECT_URI,
				['playlist-modify-public', 'playlist-modify-private']
			);
			const user = await sdk.currentUser.profile();
			console.log(user);
		}}
	>
		Get Playlists
	</Button>
</div>
