export type WorkProject = {
  number: number;
  title: string;
  year: string;
  description: string;
  href?: string;
};

export type WorkGroup = {
  id: string;
  label: string;
  projects: WorkProject[];
};
