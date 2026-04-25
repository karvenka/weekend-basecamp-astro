import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeExternalLinks from 'rehype-external-links';

export default defineConfig({
  site: 'https://weekendbasecamp.com',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/blogs/'),
    }),
  ],

  markdown: {
    rehypePlugins: [
      [rehypeExternalLinks, {
        target: '_blank',
        rel: ['noopener', 'noreferrer'],
      }],
    ],
  },
});
