/** Intrinsic dimensions of `/team.webp` — keep in sync with the asset. */
export const TEAM_IMAGE_WIDTH = 1200;
export const TEAM_IMAGE_HEIGHT = 676;
export const TEAM_IMAGE_SRC = "/team.webp";
export const TEAM_IMAGE_PLACEHOLDER_SRC = "/team-placeholder.png";

/** Original art frame used when hotspot px offsets were authored (1672×941). */
const HOTSPOT_SOURCE_WIDTH = 1672;
const HOTSPOT_SOURCE_HEIGHT = 941;

/** Width at which the original pixel hotspots were calibrated (height = 320). */
const HOTSPOT_REF_WIDTH = (HOTSPOT_SOURCE_WIDTH * 320) / HOTSPOT_SOURCE_HEIGHT;

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
