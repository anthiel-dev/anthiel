export type TeamProfile = {
  id: string;
  name: string;
  role: string;
  years: number;
  focus: string;
  bio: string;
  /** `object-position` into `/team.webp` for a face crop */
  portraitPosition: string;
};

export const teamProfiles: TeamProfile[] = [
  {
    id: "clive",
    name: "Clive",
    role: "Frontend Engineer",
    years: 5,
    focus: "Product UI",
    bio: "Ships the interfaces founders demo. Cares about motion that earns its keep — never decoration for its own sake.",
    portraitPosition: "18% 32%",
  },
  {
    id: "andika",
    name: "Andika",
    role: "DevOps Engineer",
    years: 15,
    focus: "Infra & reliability",
    bio: "Makes the path from laptop to production boring — in the best way. Fifteen years of keeping systems quiet under load.",
    portraitPosition: "40% 24%",
  },
  {
    id: "denis",
    name: "Denis",
    role: "Designer",
    years: 5,
    focus: "Brand & product",
    bio: "Gives the product a point of view before a single screen ships. Clarity over ornament.",
    portraitPosition: "57% 27%",
  },
  {
    id: "yogi",
    name: "Yogi",
    role: "Backend Engineer",
    years: 13,
    focus: "Systems & APIs",
    bio: "Models the hard parts so the rest of the stack can stay simple. Strong opinions, held lightly.",
    portraitPosition: "74% 19%",
  },
  {
    id: "berli",
    name: "Berli",
    role: "Software Engineer",
    years: 8,
    focus: "Product engineering",
    bio: "Connects product, code, and delivery when the brief is still forming. Comfortable in the ambiguity of 0 → 1.",
    portraitPosition: "58% 62%",
  },
];
