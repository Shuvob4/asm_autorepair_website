import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://asmautomotive.com',
  output: 'static',
  integrations: [
    preact(),
    sitemap(),
  ],
});
