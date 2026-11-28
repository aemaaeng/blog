import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"
import { slugify } from "./lib/slug"

// 글은 Obsidian에서 쓰는 content/ 폴더를 그대로 읽는다. index.md는 홈 소개글이라 따로 읽는다.
const posts = defineCollection({
  loader: glob({
    base: "./content",
    pattern: ["*.md", "!index.md"],
    generateId: ({ entry }) => slugify(entry),
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
})

const home = defineCollection({
  loader: glob({ base: "./content", pattern: "index.md" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
})

export const collections = { posts, home }
