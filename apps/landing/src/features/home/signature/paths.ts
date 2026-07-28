/**
 * Kid-print strokes for "Anthiel" + ":)"
 * One continuous subpath per entry (no multi-M paths — avoids pre-draw dots).
 * Draw order: A → n → t → h → i → E → l → : → )
 */
export const SIGNATURE_VIEWBOX = "0 0 300 80";

export const SIGNATURE_PATHS = [
  // A peak
  "M 6 70 C 8 52, 12 28, 18 10 C 20 14, 26 36, 32 54 C 34 62, 38 68, 42 72",
  // A bar
  "M 12 48 C 18 44, 28 50, 36 46",
  // n stem
  "M 46 38 C 44 48, 48 58, 44 72",
  // n hump
  "M 46 42 C 52 30, 62 32, 66 44 C 68 54, 64 64, 70 72",
  // t stem
  "M 96 8 C 94 28, 98 48, 94 72",
  // t bar
  "M 86 30 C 92 26, 104 32, 114 26",
  // h stem
  "M 118 4 C 116 24, 120 46, 116 72",
  // h hump
  "M 118 40 C 124 28, 138 32, 142 46 C 144 56, 140 66, 146 74",
  // i stem
  "M 154 40 C 156 50, 152 60, 158 72",
  // i dot (tiny mark, not a full ring)
  "M 154 20 L 156 18",
  // E spine
  "M 174 14 C 172 30, 176 50, 172 72",
  // E top
  "M 174 14 C 182 12, 190 16, 198 12",
  // E mid
  "M 174 44 C 180 41, 188 46, 194 42",
  // E bottom
  "M 172 72 C 180 69, 190 74, 200 70",
  // l
  "M 218 4 C 214 24, 220 46, 216 72",
  // : top
  "M 246 28 L 248 26",
  // : bottom
  "M 248 46 L 250 44",
  // )
  "M 262 18 C 278 30, 278 56, 262 70",
] as const;
