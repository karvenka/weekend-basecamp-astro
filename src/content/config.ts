import { defineCollection, z } from 'astro:content';
const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    author: z.string().default('Weekend Basecamp Team'),
    pubDate: z.date(),
    readTime: z.string().optional(),
    category: z.string().optional(),
    heroImage: z.string().optional(),
  }),
});
export const collections = { articles };
