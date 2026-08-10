import type { Messages } from "../types";

export const en: Messages = {
  meta: {
    title: "Anthiel",
    description:
      "A collective of software engineers based in Batam & Jakarta. We help founders go from 0 → 1.",
  },
  intro: {
    p1Prefix: "A collective of software engineers based in Batam",
    p1Suffix: "Jakarta, Indonesia.",
    p2Before: "We help founders go from",
    p2After: "with a small, senior engineering team.",
    sayHi: "Say hi to us",
  },
  work: {
    title: "Work",
    description: "Projects we've shipped, and past work from the team.",
    groups: [
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
            title: "Arta Samudra",
            year: "2023",
            description:
              "An online auction platform for selling pearls that also works offline. Supports live bidding alongside in-person sales so auctions can run with or without a reliable connection.",
          },
          {
            number: 3,
            title: "DNI Skincenter",
            year: "2022",
            description:
              "E-commerce web for a beauty clinic in Bali. Online catalog and checkout for skincare treatments and products.",
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
    ],
  },
  faq: {
    title: "More about us",
    description: "Select a question to see the answer.",
    answerLabel: "Answer",
    experienceTemplate: "We knew each other for a long time but decided to create a group {ago}.",
    established: {
      lessThanMonth: "less than a month ago",
      oneMonth: "a month ago",
      months: (n) => `${n} months ago`,
      oneYear: "a year ago",
      years: (n) => `${n} years ago`,
    },
    items: [
      {
        id: "experience",
        question: "How long have you been working together?",
        answer: "", // filled at runtime via experienceTemplate
      },
      {
        id: "process",
        question: "What's your process?",
        answer:
          "We start by understanding the problem, not writing code.\n\nTogether, we define the MVP, break it into milestones, get your approval, then start building.",
      },
      {
        id: "timeline",
        question: "How long does a project take?",
        answer:
          "It depends on the scope, but most projects take **at least 3 months**. Small products can often go from idea to production within that timeframe.",
      },
      {
        id: "cost",
        question: "How much does it cost?",
        answer:
          "Every project is different.\n\nWe're typically more affordable than traditional agencies, and if you're working within a budget, we'll help find the right scope.",
      },
      {
        id: "why",
        question: "Why Anthiel?",
        answer:
          "You work directly with the engineers building your product.\n\nNo account managers. No communication layers. Just faster decisions, clearer discussions, and better software.",
      },
      {
        id: "start",
        question: "How do we get started?",
        answer:
          "Tell us what you're building or the problem you're trying to solve.\n\nWe'll discuss the idea, define the scope, and figure out the best way forward together.\n\n[[contact:Contact us now]]",
      },
    ],
  },
  contact: {
    title: "Get in touch",
    description: "You know what to do.",
    emailLabel: "Email address",
    placeholder: "you@company.com",
    sendLabel: "Send email",
    success: "Thanks — we'll get in touch soon.",
    invalid: "That doesn't look like an email — try again?",
    error: "Something went wrong. Please try again in a moment.",
    rateLimited: (minutes) =>
      `A few messages already sent. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    internalMessage: "Homepage email drop — please get in touch.",
  },
  a11y: {
    teamIllustration: "Anthiel team illustration",
  },
};
