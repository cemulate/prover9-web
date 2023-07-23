import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import arraybuffer from 'vite-plugin-arraybuffer';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [svelte(), arraybuffer()],
});
