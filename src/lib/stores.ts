import type { SpotifyApi, User } from '@spotify/web-api-ts-sdk';
import { writable } from 'svelte/store';

export const sdk = writable<SpotifyApi | null>(null);
export const user = writable<User | null>(null);

export const loading = writable<boolean>(false);
