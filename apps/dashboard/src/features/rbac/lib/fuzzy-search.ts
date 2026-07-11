import Fuse, { type IFuseOptions } from "fuse.js";

const DEFAULT_OPTIONS = {
  threshold: 0.35,
  ignoreLocation: true,
  includeScore: true,
  shouldSort: true,
  minMatchCharLength: 1,
} as const satisfies IFuseOptions<unknown>;

export function createFuzzySearcher<T extends object>(items: T[], keys: (keyof T & string)[]) {
  return new Fuse(items, {
    ...DEFAULT_OPTIONS,
    keys: keys.map((key) => ({
      name: key,
      getFn: (item: T) => {
        const value = item[key];
        return value == null ? "" : String(value);
      },
    })),
  });
}

export function fuzzySearch<T>(fuse: Fuse<T>, items: T[], query: string): T[] {
  const trimmed = query.trim();
  if (!trimmed) return items;
  return fuse.search(trimmed).map((result) => result.item);
}
