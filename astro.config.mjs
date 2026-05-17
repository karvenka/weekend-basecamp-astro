import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeExternalLinks from 'rehype-external-links';

/** Rehype plugin: add loading="lazy" to all <img> tags in markdown */
function rehypeLazyImages() {
  return (tree) => {
    const visit = (node) => {
      if (node.type === 'element' && node.tagName === 'img') {
        node.properties = node.properties || {};
        node.properties.loading = 'lazy';
      }
      if (node.children) {
        node.children.forEach(visit);
      }
    };
    visit(tree);
  };
}

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
      rehypeLazyImages,
    ],
  },
});
