import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    build: {
        emptyOutDir: false, // Don't wipe the popup build
        rollupOptions: {
            input: {
                content: resolve(__dirname, 'src/content/index.tsx'),
            },
            output: {
                entryFileNames: 'assets/[name].js', // content.js
                assetFileNames: 'assets/[name].[ext]',
                format: 'iife', // Immediately Invoked Function Expression for content script isolation
                name: 'WebGenContent',
                extend: true,
                inlineDynamicImports: true, // Bundle everything into one file
            },
        },
        cssCodeSplit: false, // Force one CSS file
    },
    define: {
        'process.env.NODE_ENV': '"production"',
    },
});
