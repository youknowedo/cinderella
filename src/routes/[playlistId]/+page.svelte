<script lang="ts">
	import { page } from '$app/stores';
	import { PUBLIC_SPOTIFY_CLIENT_ID, PUBLIC_SPOTIFY_REDIRECT_URI } from '$env/static/public';
	import Chart from '$lib/components/Chart.svelte';
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import {
		SpotifyApi,
		type Playlist,
		type PlaylistedTrack,
		type Track,
		type User
	} from '@spotify/web-api-ts-sdk';
	import CircleAlert from 'lucide-svelte/icons/circle-alert';
	import { stringify } from 'postcss';
	import { onMount } from 'svelte';

	type SortMethod = 'ascending' | 'descending' | 'mountain' | 'valley' | 'cinderella';

	const sortMethods: { label: string; value: SortMethod }[] = [
		{ label: 'Ascending', value: 'ascending' },
		{ label: 'Descending', value: 'descending' },
		{ label: 'Mountain', value: 'mountain' },
		{ label: 'Valley', value: 'valley' },
		{ label: 'Cinderella', value: 'cinderella' }
	];

	let loading = true;
	let sdk: SpotifyApi | null = null;
	let user: User | null = null;
	let playlist: Playlist<Track> | null = null;
	let isOwner = false;
	let selectedSortMethod: SortMethod = 'ascending';
	let tracks: { name: string; tempo: number }[] | null = null;
	let originalTracks: { name: string; tempo: number }[] | null = null;

	onMount(() =>
		(async () => {
			sdk = SpotifyApi.withUserAuthorization(
				PUBLIC_SPOTIFY_CLIENT_ID,
				PUBLIC_SPOTIFY_REDIRECT_URI,
				['user-read-email', 'playlist-modify-public', 'playlist-modify-private']
			);

			user = await sdk.currentUser.profile();
			playlist = await sdk.playlists.getPlaylist($page.params.playlistId);
			isOwner = playlist.owner.id === user.id;

			const tempos = await sdk.tracks
				.audioFeatures(playlist.tracks.items.map((t) => t.track.id))
				.then((f) => f.map((t) => t.tempo));

			tracks = playlist.tracks.items.map((t, i) => ({
				name: t.track.name,
				tempo: tempos[i]
			}));
			originalTracks = [...tracks];

			loading = false;
		})()
	);

	const methodData = {
		ascending: () => {
			if (!playlist || !tracks) return [];

			const totalTracks = tracks.length;

			return tracks.map((_, index) => ({
				scale: index / (totalTracks - 1),
				track: index + 1
			}));
		},
		descending: () => {
			if (!playlist || !tracks) return [];

			const totalTracks = tracks.length;

			return tracks.map((_, index) => ({
				scale: 1 - index / (totalTracks - 1),
				track: index + 1
			}));
		},
		mountain: () => {
			if (!playlist) return [];
			console.log('mountain');

			let totalTracks = playlist.tracks.items.length;

			const t = playlist.tracks.items.map((_, index) => {
				const x = index / (totalTracks - 1);
				return {
					scale: -4 * x * x + 4 * x,
					track: index + 1
				};
			});
			console.log(t);
			return t;
		},
		valley: () => {
			if (!playlist) return [];
			console.log('mountain');

			let totalTracks = playlist.tracks.items.length;

			const t = playlist.tracks.items.map((_, index) => {
				const x = index / (totalTracks - 1);
				return {
					scale: 4 * x * x - 4 * x + 1,
					track: index + 1
				};
			});
			console.log(t);
			return t;
		},
		cinderella: () => {
			if (!playlist) return [];

			let totalTracks = playlist.tracks.items.length;

			return playlist.tracks.items.map((_, index) => {
				const x = index / (totalTracks - 1);
				return {
					scale: 16 * x * x * x - 24 * x * x + 9 * x,
					track: index + 1
				};
			});
		}
	};

	const sortPlaylist = async () => {
		if (!sdk || !playlist || !tracks) return;

		switch (selectedSortMethod) {
			case 'ascending':
				tracks = tracks.sort((a, b) => a.tempo - b.tempo);
				break;
			case 'descending':
				tracks = tracks.sort((a, b) => b.tempo - a.tempo);
				break;
			// same sort method for mountain, valley and cinderella
			case 'mountain':
			case 'valley':
			case 'cinderella':
				const minTempo = Math.min(...tracks.map((t) => t.tempo));
				const maxTempo = Math.max(...tracks.map((t) => t.tempo));

				const scale = (tempo: number) => (tempo - minTempo) / (maxTempo - minTempo);
				const availableTracks = tracks.map((track) => ({
					...track,
					scale: scale(track.tempo)
				}));
				const referenceTempos = methodData[selectedSortMethod]().map((point) => point.scale);
				console.log('Reference: ', referenceTempos);

				let currentDiff = 0;

				for (let i = 0; i < referenceTempos.length; i++) {
					let closestTrack = availableTracks[0];

					for (const track of availableTracks) {
						const diff = Math.abs(track.scale - referenceTempos[i] + currentDiff);
						if (diff < Math.abs(closestTrack.scale - referenceTempos[i] + currentDiff)) {
							closestTrack = track;
						}
					}

					currentDiff = closestTrack.scale - referenceTempos[i];
					if (currentDiff > 5) currentDiff = 5;
					if (currentDiff < -5) currentDiff = -5;

					tracks[i] = closestTrack;
					availableTracks.splice(availableTracks.indexOf(closestTrack), 1);
				}

				break;
		}
	};
</script>

{#if sdk && user && playlist}
	<div class="container py-20">
		<h1 class="mb-4 text-3xl font-bold">{playlist.name}</h1>

		<div class="mb-4">
			<Alert.Root variant="default">
				<CircleAlert class="h-4 w-4" />
				<Alert.Title>Heads up!</Alert.Title>
				<Alert.Description>
					You don't own this playlist. If you continue we'll make a new playlist for you.
				</Alert.Description>
			</Alert.Root>
		</div>

		{#if !loading}
			<div
				class="mb-4 grid rounded-md bg-muted p-1"
				style="grid-template-columns: repeat({sortMethods.length}, minmax(0, 1fr));"
			>
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

			{#if methodData && tracks}
				<Chart
					methodData={methodData[selectedSortMethod]()}
					playlistData={tracks.map((t, i) => {
						if (!sdk) return { name: t.name, tempo: 0, track: i };

						return { name: t.name ?? '', tempo: t.tempo, track: i };
					})}
				/>

				<Button on:click={sortPlaylist}>Reorder Playlist</Button>
				<Button
					variant="secondary"
					on:click={() => (tracks = originalTracks && [...originalTracks])}>Reset</Button
				>
			{/if}
		{/if}
	</div>
{/if}
