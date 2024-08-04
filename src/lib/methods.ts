export type SortMethod = 'ascending' | 'descending' | 'mountain' | 'valley' | 'cinderella';

export const sortMethods: { label: string; value: SortMethod }[] = [
	{ label: 'Ascending', value: 'ascending' },
	{ label: 'Descending', value: 'descending' },
	{ label: 'Mountain', value: 'mountain' },
	{ label: 'Valley', value: 'valley' },
	{ label: 'Cinderella', value: 'cinderella' }
];

export const methods = (tracks: { name: string; tempo: number; uri: string }[]) => ({
	ascending: () => {
		const totalTracks = tracks.length;

		return tracks.map((_, index) => ({
			scale: index / (totalTracks - 1),
			track: index + 1
		}));
	},
	descending: () => {
		const totalTracks = tracks.length;

		return tracks.map((_, index) => ({
			scale: 1 - index / (totalTracks - 1),
			track: index + 1
		}));
	},
	mountain: () => {
		console.log('mountain');

		const totalTracks = tracks.length;

		const t = tracks.map((_, index) => {
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
		console.log('mountain');

		const totalTracks = tracks.length;

		const t = tracks.map((_, index) => {
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
		const totalTracks = tracks.length;

		return tracks.map((_, index) => {
			const x = index / (totalTracks - 1);
			return {
				scale: 16 * x * x * x - 24 * x * x + 9 * x,
				track: index + 1
			};
		});
	}
});

export const sortWithMethod = async (
	selectedSortMethod: SortMethod,
	tracks: { name: string; tempo: number; uri: string }[]
) => {
	switch (selectedSortMethod) {
		case 'ascending':
			tracks = tracks.sort((a, b) => a.tempo - b.tempo);
			break;
		case 'descending':
			tracks = tracks.sort((a, b) => b.tempo - a.tempo);
			break;
		// same sort method for mountain & valley
		case 'mountain':
		case 'valley': {
			const sortedTracks = tracks.sort((a, b) =>
				selectedSortMethod == 'valley' ? a.tempo - b.tempo : b.tempo - a.tempo
			);

			tracks = [];
			sortedTracks.forEach((track, i) => {
				if (i % 2 === 0) {
					tracks!.push(track);
				} else {
					tracks!.unshift(track);
				}
			});
			break;
		}
		case 'cinderella': {
			const minTempo = Math.min(...tracks.map((t) => t.tempo));
			const maxTempo = Math.max(...tracks.map((t) => t.tempo));

			const scale = (tempo: number) => (tempo - minTempo) / (maxTempo - minTempo);
			const availableTracks = tracks.map((track) => ({
				...track,
				scale: scale(track.tempo)
			}));
			const referenceTempos = methods(tracks)
				[selectedSortMethod]()
				.map((point) => point.scale);
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
	}
};
