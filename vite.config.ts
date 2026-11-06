/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/nba/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'NBA',
        short_name: 'NBA',
        lang: 'ja',
        display: 'standalone',
        theme_color: '#07061a',
        background_color: '#07061a',
        start_url: '/nba/',
        scope: '/nba/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/site(\.web)?\.api\.espn\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'espn-api',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 3600 },
              plugins: [
                {
                  // Stamp when the response was saved so the page can show "◯分前の情報" offline.
                  cacheWillUpdate: async ({ response }) => {
                    if (!response || response.status !== 200) return null;
                    const headers = new Headers(response.headers);
                    headers.set('x-cached-at', String(Date.now()));
                    return new Response(await response.blob(), {
                      status: response.status,
                      statusText: response.statusText,
                      headers,
                    });
                  },
                  // Cross-origin headers stay hidden from the page, so mark the JSON body instead.
                  cachedResponseWillBeUsed: async ({ cachedResponse }) => {
                    if (!cachedResponse) return null;
                    const savedAt = Number(cachedResponse.headers.get('x-cached-at'));
                    try {
                      const body = await cachedResponse.clone().json();
                      if (body && typeof body === 'object' && !Array.isArray(body) && savedAt > 0) {
                        body.nbaCachedAt = savedAt;
                        return new Response(JSON.stringify(body), {
                          status: 200,
                          headers: { 'content-type': 'application/json' },
                        });
                      }
                    } catch {
                      // not JSON; serve as-is
                    }
                    return cachedResponse;
                  },
                },
              ],
            },
          },
          {
            urlPattern: /^https:\/\/a\.espncdn\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'espn-img',
              expiration: { maxEntries: 300, maxAgeSeconds: 30 * 24 * 3600 },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['tests/unit/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
  },
});
