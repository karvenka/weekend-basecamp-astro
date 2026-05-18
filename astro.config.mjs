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
      serialize(item) {
        // Leavenworth pages — recently updated
        if (item.url.includes('/leavenworth')) {
          item.lastmod = new Date('2026-05-18');
        }
        // Persona pages
        else if (item.url.includes('/for/')) {
          item.lastmod = new Date('2026-05-17');
        }
        // Homepage
        else if (item.url === 'https://weekendbasecamp.com/' || item.url === 'https://weekendbasecamp.com') {
          item.lastmod = new Date('2026-05-18');
        }
        // Guides
        else if (item.url.includes('/guides/')) {
          item.lastmod = new Date('2026-05-16');
        }
        // Everything else
        else {
          item.lastmod = new Date('2026-05-16');
        }
        return item;
      },
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
