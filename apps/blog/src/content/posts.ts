import type { ComponentType } from "react";

import { z } from "zod";

export const postFrontmatterSchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1),
  description: z.string().min(1),
  slug: z.string().min(1).optional(),
});

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;

export type BlogPost = {
  slug: string;
  locale: string;
  frontmatter: PostFrontmatter;
  Component: ComponentType;
};

type MdxModule = {
  default: ComponentType;
  frontmatter?: unknown;
};

const modules = import.meta.glob<MdxModule>("./blog/**/*.mdx", { eager: true });

function slugFromPath(path: string, frontmatter: PostFrontmatter): string {
  if (frontmatter.slug) return frontmatter.slug;
  const file = path.split("/").pop() ?? path;
  return file.replace(/\.mdx$/, "");
}

function localeFromPath(path: string): string {
  // ./blog/en/hello-world.mdx → en
  const match = path.match(/^\.\/blog\/([^/]+)\//);
  return match?.[1] ?? "en";
}

function loadPosts(): BlogPost[] {
  const posts: BlogPost[] = [];

  for (const [path, mod] of Object.entries(modules)) {
    const parsed = postFrontmatterSchema.safeParse(mod.frontmatter);
    if (!parsed.success) {
      console.warn(`[blog] Skipping ${path}: invalid frontmatter`, parsed.error.flatten());
      continue;
    }

    posts.push({
      slug: slugFromPath(path, parsed.data),
      locale: localeFromPath(path),
      frontmatter: parsed.data,
      Component: mod.default,
    });
  }

  return posts.sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date));
}

const allPosts = loadPosts();

export function getPosts(locale: string): BlogPost[] {
  return allPosts.filter((post) => post.locale === locale);
}

export function getPost(locale: string, slug: string): BlogPost | undefined {
  return allPosts.find((post) => post.locale === locale && post.slug === slug);
}
