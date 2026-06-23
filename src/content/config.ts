import { defineCollection, z } from 'astro:content';

// Services Collection
const servicesCollection = defineCollection({
  type: 'content', // Markdown with frontmatter
  schema: z.object({
    title: z.string().min(1).max(100),
    summary: z.string().min(1).max(150),
    description: z.string().min(20),
    benefits: z.array(z.string().min(1)).min(3).max(6),
    icon: z.string().optional(),
    image: z.string().optional(),
    order: z.number().int().positive(),
    startingPrice: z.number().positive().optional(),
  }),
});

// Posts Collection
const postsCollection = defineCollection({
  type: 'content', // Markdown with frontmatter
  schema: z.object({
    title: z.string().min(1).max(120),
    publishedDate: z.coerce.date(),
    excerpt: z.string().max(160).optional(),
    featuredImage: z.string().url().or(z.string().startsWith('/')),
    author: z.string().default('ASM AUTO Repair'),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  services: servicesCollection,
  posts: postsCollection,
};
