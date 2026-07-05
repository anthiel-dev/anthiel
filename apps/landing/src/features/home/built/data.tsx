import type { BuiltCardProps } from "./built-card";

const caritempatImages = [
  "/caritempat/home.png",
  "/caritempat/restaurant.png",
  "/caritempat/search.png",
  "/caritempat/room.png",
] as const;

export const builtItems: BuiltCardProps[] = [
  {
    title: "Batam Today",
    description: "Local news and stories from Batam, Indonesia.",
    href: "https://batamtoday.com",
    image: caritempatImages[0],
  },
  {
    title: "Cari Tempat",
    description: "Discover and explore places around you.",
    href: "https://caritempat.com",
    image: caritempatImages[1],
  },
  {
    title: "Aksanova",
    description: "Digital products built for modern businesses.",
    href: "https://aksanova.com",
    image: caritempatImages[2],
  },
  {
    title: "DNI",
    description: "Software solutions for growing teams.",
    href: "https://dni.id",
    image: caritempatImages[3],
  },
];
