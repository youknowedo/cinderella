<script lang="ts">
	import { PUBLIC_SPOTIFY_CLIENT_ID, PUBLIC_SPOTIFY_REDIRECT_URI } from '$env/static/public';
	import { loading, sdk } from '$lib/stores';
	import { SpotifyApi } from '@spotify/web-api-ts-sdk';
	import { onMount } from 'svelte';
	import '../app.css';

	onMount(() => {
		loading.set(true);
		sdk.set(
			SpotifyApi.withUserAuthorization(PUBLIC_SPOTIFY_CLIENT_ID, PUBLIC_SPOTIFY_REDIRECT_URI, [
				'user-read-email',
				'playlist-modify-public',
				'playlist-modify-private',
				'playlist-read-collaborative',
				'playlist-read-private'
			])
		);
		loading.set(false);
	});
</script>

<slot></slot>
