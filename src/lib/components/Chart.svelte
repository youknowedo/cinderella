<script lang="ts">
	import { Axis, Chart, Highlight, Points, Spline, Svg, Tooltip, TooltipItem } from 'layerchart';

	export let methodData: { scale: number; track: number }[];
	export let playlistData: { name: string; tempo: number; track: number }[];
</script>

<div class="grid-stack relative grid h-[300px] rounded border p-4">
	<!-- Sales chart-->
	<Chart
		data={methodData}
		x="track"
		y="scale"
		yDomain={[0, null]}
		yNice
		padding={{ top: 24, bottom: 24, left: 24, right: 24 }}
	>
		<Svg>
			<Axis
				placement="left"
				rule
				format="percentRound"
				label="scale"
				labelPlacement="start"
				labelProps={{ class: 'fill-primary' }}
			/>
			<Axis placement="bottom" format="none" rule />
			<Spline class="stroke-primary stroke-2" />
		</Svg>
	</Chart>

	{#if playlistData}
		<div class="absolute h-full w-full p-4">
			<Chart
				data={playlistData}
				x="track"
				y="tempo"
				padding={{ top: 24, bottom: 24, left: 24, right: 24 }}
				tooltip={{ mode: 'bisect-x' }}
			>
				<Svg>
					<Axis
						placement="right"
						rule
						format="metric"
						label="tempo [bpm]"
						labelPlacement="start"
						labelProps={{ class: 'fill-secondary' }}
					/>
					<Points class="fill-primary/10 stroke-primary" />
					<Highlight points lines />
				</Svg>

				<Tooltip header={(data) => data.name} let:data>
					<TooltipItem label="BPM" value={data.tempo} />
				</Tooltip>
			</Chart>
		</div>
	{/if}
</div>
