import type { TeamMember } from "./types";

import { toPercentSize, toPercentX, toPercentY } from "./constants";

export const team: TeamMember[] = [
  {
    id: "clive",
    name: "Clive",
    role: "Frontend Engineer",
    years: 5,
    photo: "/team.png",
    position: { left: toPercentX(80), top: toPercentY(78) },
    size: toPercentSize(50),
  },
  {
    id: "andika",
    name: "Andika",
    role: "DevOps Engineer",
    years: 15,
    photo: "/team.png",
    position: { left: toPercentX(202), top: toPercentY(52) },
    size: toPercentSize(50),
    tooltipPlacement: "bottom",
  },
  {
    id: "denis",
    name: "Denis",
    role: "Designer",
    years: 5,
    photo: "/team.png",
    position: { left: toPercentX(300), top: toPercentY(60) },
    size: toPercentSize(50),
    tooltipPlacement: "bottom",
  },
  {
    id: "yogi",
    name: "Yogi",
    role: "Backend Engineer",
    years: 13,
    photo: "/team.png",
    position: { right: toPercentX(118), top: toPercentY(32) },
    size: toPercentSize(55),
    tooltipPlacement: "bottom",
  },
  {
    id: "berli",
    name: "Berli",
    role: "Software Engineer",
    years: 8,
    photo: "/team.png",
    position: { right: toPercentX(208), bottom: toPercentY(97) },
    size: toPercentSize(55),
  },
];
