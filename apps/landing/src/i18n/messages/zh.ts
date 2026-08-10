import type { Messages } from "../types";

export const zh: Messages = {
  meta: {
    title: "Anthiel",
    description:
      "位于巴淡（Batam）与雅加达的软件工程师团队。我们帮助创始人把产品从 0 做到 1，服务印尼与巴淡地区的软件开发需求。",
  },
  intro: {
    p1Prefix: "一支立足巴淡（Batam）",
    p1Suffix: "雅加达的软件工程师团队。",
    p2Before: "我们帮助创始人从",
    p2After: "，由精悍的资深工程团队全程交付。",
    sayHi: "来打个招呼",
  },
  work: {
    title: "作品",
    description: "我们交付过的项目，以及团队成员过往作品。",
    groups: [
      {
        id: "anthiel",
        label: "项目",
        projects: [
          {
            number: 1,
            title: "Batam Today",
            year: "2026",
            description:
              "巴淡本地新闻门户的全面重写——更快的性能、深色与浅色主题，以及面向新闻、广告、用户与页面定制的多角色后台。Anthiel 的首个项目，历时 3 个月。",
            href: "https://batamtoday.com/",
          },
        ],
      },
      {
        id: "past",
        label: "团队成员过往项目",
        projects: [
          {
            number: 2,
            title: "Arta Samudra",
            year: "2023",
            description:
              "可离线运行的珍珠在线拍卖平台。支持现场出价与线下销售并行，即使网络不稳也能继续拍卖。",
          },
          {
            number: 3,
            title: "DNI Skincenter",
            year: "2022",
            description: "巴厘岛美容诊所的电商网站。在线目录与结账，覆盖护肤护理与产品。",
          },
          {
            number: 4,
            title: "Virtual Tenant Representative",
            year: "2021",
            description: "面向房东的房地产 Web 应用，集中管理房源、租户与日常物业运营。",
          },
        ],
      },
    ],
  },
  faq: {
    title: "关于我们",
    description: "选择一个问题查看回答。",
    answerLabel: "回答",
    experienceTemplate: "我们相识已久，并在{ago}决定组建这个团队。",
    established: {
      lessThanMonth: "不到一个月前",
      oneMonth: "一个月前",
      months: (n) => `${n} 个月前`,
      oneYear: "一年前",
      years: (n) => `${n} 年前`,
    },
    items: [
      {
        id: "experience",
        question: "你们一起工作多久了？",
        answer: "",
      },
      {
        id: "process",
        question: "你们的流程是怎样的？",
        answer:
          "我们先理解问题，而不是立刻写代码。\n\n一起定义 MVP，拆成里程碑，获得你的确认后，再开始构建。",
      },
      {
        id: "timeline",
        question: "一个项目通常需要多久？",
        answer:
          "取决于范围，但大多数项目至少需要 **3 个月**。小型产品往往可以在这个时间内从想法走到上线。",
      },
      {
        id: "cost",
        question: "费用大概多少？",
        answer:
          "每个项目都不同。\n\n我们通常比传统代理商更实惠；如果预算有限，我们会一起找到合适的范围。",
      },
      {
        id: "why",
        question: "为什么选择 Anthiel？",
        answer:
          "你直接与真正构建产品的工程师合作。\n\n没有客户经理，没有层层转达。决策更快，沟通更清晰，软件也更好。",
      },
      {
        id: "start",
        question: "如何开始合作？",
        answer:
          "告诉我们你想做的产品，或想解决的问题。\n\n我们一起讨论想法、明确范围，并找到最好的推进方式。\n\n[[contact:立即联系我们]]",
      },
    ],
  },
  contact: {
    title: "联系我们",
    description: "你知道该怎么做。",
    emailLabel: "电子邮箱",
    placeholder: "you@company.com",
    sendLabel: "发送邮件",
    success: "谢谢 — 我们很快会与你联系。",
    invalid: "这不太像邮箱地址 — 再试一次？",
    error: "出了点问题。请稍后再试。",
    rateLimited: (minutes) => `已发送几条消息。请约 ${minutes} 分钟后再试。`,
    internalMessage: "Homepage email drop — please get in touch.",
  },
  a11y: {
    teamIllustration: "Anthiel 团队插图",
  },
};
