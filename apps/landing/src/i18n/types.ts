export type FaqMessage = {
  id: string;
  question: string;
  /** Plain answer with `\n\n` paragraphs, `**bold**`, and `[[contact:Label]]` for mailto CTA. */
  answer: string;
};

export type WorkProjectMessage = {
  number: number;
  title: string;
  year: string;
  description: string;
  href?: string;
};

export type WorkGroupMessage = {
  id: string;
  label: string;
  projects: WorkProjectMessage[];
};

export type Messages = {
  meta: {
    title: string;
    description: string;
  };
  intro: {
    p1Prefix: string;
    p1Suffix: string;
    p2Before: string;
    p2After: string;
    sayHi: string;
  };
  work: {
    title: string;
    description: string;
    groups: WorkGroupMessage[];
  };
  faq: {
    title: string;
    description: string;
    answerLabel: string;
    items: FaqMessage[];
    experienceTemplate: string;
    established: {
      lessThanMonth: string;
      oneMonth: string;
      months: (n: number) => string;
      oneYear: string;
      years: (n: number) => string;
    };
  };
  contact: {
    title: string;
    description: string;
    emailLabel: string;
    placeholder: string;
    sendLabel: string;
    success: string;
    invalid: string;
    error: string;
    rateLimited: (minutes: number) => string;
    internalMessage: string;
  };
  a11y: {
    teamIllustration: string;
  };
};
