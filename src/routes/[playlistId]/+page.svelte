<script lang="ts">
	import { page } from '$app/stores';
	import { PUBLIC_SPOTIFY_CLIENT_ID, PUBLIC_SPOTIFY_REDIRECT_URI } from '$env/static/public';
	import * as Alert from '$lib/components/ui/alert';
	import { SpotifyApi, type Playlist, type Track, type User } from '@spotify/web-api-ts-sdk';
	import { Axis, Chart, Highlight, Spline, Svg, Tooltip, TooltipItem } from 'layerchart';
	import CircleAlert from 'lucide-svelte/icons/circle-alert';
	import { onMount } from 'svelte';

	type SortMethod = 'ascending' | 'descending' | 'mountain' | 'valley' | 'cinderella';

	const sortMethods: { label: string; value: SortMethod }[] = [
		{ label: 'Ascending', value: 'ascending' },
		{ label: 'Descending', value: 'descending' },
		{ label: 'Mountain', value: 'mountain' },
		{ label: 'Valley', value: 'valley' },
		{ label: 'Cinderella', value: 'cinderella' }
	];
	const chartData = [
		{
			year: 1980,
			efficiency: 24.3,
			sales: 8949000
		},
		{
			year: 1985,
			efficiency: 27.6,
			sales: 10979000
		},
		{
			year: 1990,
			efficiency: 28,
			sales: 9303000
		},
		{
			year: 1991,
			efficiency: 28.4,
			sales: 8185000
		},
		{
			year: 1992,
			efficiency: 27.9,
			sales: 8213000
		},
		{
			year: 1993,
			efficiency: 28.4,
			sales: 8518000
		},
		{
			year: 1994,
			efficiency: 28.3,
			sales: 8991000
		},
		{
			year: 1995,
			efficiency: 28.6,
			sales: 8620000
		},
		{
			year: 1996,
			efficiency: 28.5,
			sales: 8479000
		},
		{
			year: 1997,
			efficiency: 28.7,
			sales: 8217000
		},
		{
			year: 1998,
			efficiency: 28.8,
			sales: 8085000
		},
		{
			year: 1999,
			efficiency: 28.3,
			sales: 8638000
		},
		{
			year: 2000,
			efficiency: 28.5,
			sales: 8778000
		},
		{
			year: 2001,
			efficiency: 28.8,
			sales: 8352000
		},
		{
			year: 2002,
			efficiency: 29,
			sales: 8042000
		},
		{
			year: 2003,
			efficiency: 29.5,
			sales: 7556000
		},
		{
			year: 2004,
			efficiency: 29.5,
			sales: 7483000
		},
		{
			year: 2005,
			efficiency: 30.3,
			sales: 7660000
		},
		{
			year: 2006,
			efficiency: 30.1,
			sales: 7762000
		},
		{
			year: 2007,
			efficiency: 31.2,
			sales: 7562000
		},
		{
			year: 2008,
			efficiency: 31.5,
			sales: 6769000
		},
		{
			year: 2009,
			efficiency: 32.9,
			sales: 5402000
		},
		{
			year: 2010,
			efficiency: 33.9,
			sales: 5636000
		},
		{
			year: 2011,
			efficiency: 33.1,
			sales: 6093000
		},
		{
			year: 2012,
			efficiency: 35.3,
			sales: 7245000
		},
		{
			year: 2013,
			efficiency: 36.4,
			sales: 7586000
		},
		{
			year: 2014,
			efficiency: 36.5,
			sales: 7708000
		},
		{
			year: 2015,
			efficiency: 37.2,
			sales: 7517000
		},
		{
			year: 2016,
			efficiency: 37.7,
			sales: 6873000
		},
		{
			year: 2017,
			efficiency: 39.4,
			sales: 6081000
		}
	];

	let sdk: SpotifyApi | null = null;
	let user: User | null = null;
	let playlist: Playlist<Track> | null = null;
	let isOwner = false;
	let selectedSortMethod: SortMethod | null = null;

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
		})()
	);
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

		<div class="grid-stack relative grid h-[300px] rounded border p-4">
			<!-- Sales chart-->
			<div class="absolute h-full w-full p-4">
				<Chart
					data={chartData}
					x="year"
					y="sales"
					yDomain={[0, null]}
					yNice
					padding={{ top: 24, bottom: 24, left: 24, right: 24 }}
				>
					<Svg>
						<Axis
							placement="left"
							rule
							format="metric"
							label="↑ sales (M)"
							labelPlacement="start"
							labelProps={{ class: 'fill-primary' }}
						/>
						<Axis placement="bottom" format="none" rule />
						<Spline class="stroke-primary stroke-2" />
						<Highlight lines points />
					</Svg>
				</Chart>
			</div>

			<Chart
				data={chartData}
				x="year"
				y="efficiency"
				padding={{ top: 24, bottom: 24, left: 24, right: 24 }}
				tooltip={{ mode: 'bisect-x' }}
			>
				<Svg>
					<Axis
						placement="right"
						rule
						label="efficiency (mpg) ↑"
						labelPlacement="start"
						labelProps={{ class: 'fill-secondary' }}
					/>
					<Spline class="stroke-secondary stroke-2" />
					<!-- Difficult to add points for both charts without using a remaped scale for one value -->
					<Highlight lines />
				</Svg>

				<Tooltip header={(data) => data.year} let:data>
					<TooltipItem label="sales" value={data.sales} format="currencyRound" />
					<TooltipItem label="efficiency" value={data.efficiency} />
				</Tooltip>
			</Chart>
		</div>
	</div>
{/if}
