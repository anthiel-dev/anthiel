/** Intrinsic dimensions of `/team.png` — keep in sync with the asset. */
export const TEAM_IMAGE_WIDTH = 1672;
export const TEAM_IMAGE_HEIGHT = 941;
export const TEAM_IMAGE_SRC = "/team.png";
export const TEAM_IMAGE_PLACEHOLDER_SRC = "/team-placeholder.png";

/** Width at which the original pixel hotspots were calibrated (height = 320). */
const HOTSPOT_REF_WIDTH = (TEAM_IMAGE_WIDTH * 320) / TEAM_IMAGE_HEIGHT;

/** Convert a pixel offset from the reference frame to a container percentage. */
export function toPercentX(px: number) {
  return `${((px / HOTSPOT_REF_WIDTH) * 100).toFixed(2)}%`;
}

export function toPercentY(px: number) {
  return `${((px / 320) * 100).toFixed(2)}%`;
}

export function toPercentSize(px: number) {
  return `${((px / HOTSPOT_REF_WIDTH) * 100).toFixed(2)}%`;
}
