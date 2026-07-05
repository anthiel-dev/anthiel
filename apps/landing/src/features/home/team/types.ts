export type TeamTooltipPlacement = "top" | "bottom";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  years: number;
  photo: string;
  position: { left?: string; right?: string; top?: string; bottom?: string };
  size: string;
  tooltipPlacement?: TeamTooltipPlacement;
}
