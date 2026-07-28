import type { WorkGroup } from "./types";

export const workGroups: WorkGroup[] = [
  {
    id: "anthiel",
    label: "Projects",
    projects: [
      {
        number: 1,
        title: "Batam Today",
        year: "2026",
        description:
          "A full rewrite of a news portal — faster performance, dark and light themes, and a multi-role dashboard for news, ads, users, and page customization. Anthiel's first project, built in 3 months.",
        href: "https://batamtoday.com/",
      },
    ],
  },
  {
    id: "past",
    label: "Team members' past projects",
    projects: [
      {
        number: 2,
        title: "DNI Skincenter",
        year: "2022",
        description:
          "E-commerce web for a beauty clinic in Bali. Online catalog and checkout for skincare treatments and products.",
      },
      {
        number: 3,
        title: "Arta Samudra",
        year: "2023",
        description:
          "An online auction platform for selling pearls that also works offline. Supports live bidding alongside in-person sales so auctions can run with or without a reliable connection.",
      },
      {
        number: 4,
        title: "Virtual Tenant Representative",
        year: "2021",
        description:
          "A real estate web app for landlords to manage their estate properties — listings, tenants, and day-to-day property operations in one place.",
      },
    ],
  },
];
