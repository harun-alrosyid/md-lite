import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
    plugins: [svelte()],
    resolve: {
        conditions: ['browser'],
    },
    test: {
        globals: true,
        environment: 'happy-dom',
        include: ['src/**/*.test.ts'],
        coverage: {
            provider: 'istanbul',
            include: ['src/**/*.ts', 'src/**/*.svelte'],
            exclude: [
                'src/main.ts',
                'src/vite-env.d.ts',
                'src/**/__mocks__/**',
                'src/**/*.test.ts',
            ],
            thresholds: {
                lines: 90,
                branches: 85,
                functions: 85,
                statements: 85,
            },
        },
        alias: {
            '@tauri-apps/api/core': new URL('./src/__mocks__/@tauri-apps/api/core.ts', import.meta.url).pathname,
            '@tauri-apps/plugin-dialog': new URL('./src/__mocks__/@tauri-apps/plugin-dialog.ts', import.meta.url).pathname,
            '@tauri-apps/api/window': new URL('./src/__mocks__/@tauri-apps/api/window.ts', import.meta.url).pathname,
        },
    },
});
