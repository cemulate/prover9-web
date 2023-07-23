import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import rawHexLoader from './src/lib/raw-hex-loader.js';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [svelte(), rawHexLoader],
    worker: {
        plugins: [rawHexLoader],
    },
    base: '/prover9-web/',
});
