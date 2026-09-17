import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths so the built dist/ folder works regardless of the
  // folder depth it's hosted at (e.g. a SharePoint document library path or
  // a static-hosting subfolder), without requiring server-side rewrites.
  // See docs/sharepoint-deployment.md.
  base: './',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
