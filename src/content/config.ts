import { defineCollection, z } from 'astro:content';
const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    author: z.string().default('Weekend Basecamp Team'),
    pubDate: z.date(),
    readTime: z.string().optional(),
    category: z.enum(['Guides', 'Destinations', 'Seasonal', 'Roundups', 'Couples', 'Friends', 'Everyone']).optional(),
    heroImage: z.string().optional(),
    thumbnail: z.string().optional(),
    thumbnailBg: z.string().optional(),
    tags: z.array(z.string()).optional(),
    relatedArticles: z.array(z.string()).optional(),
    metaDescription: z.string().optional(),
  }),
});
export const collections = { articles };
