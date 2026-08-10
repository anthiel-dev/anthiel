import type { CSSProperties } from "react";

/** Deterministic layout so SSR and client match — no Math.random. */
const RAIN_DROPS = Array.from({ length: 14 }, (_, i) => {
  const left = (i * 47 + 11) % 100;
  const delay = ((i * 41) % 100) / 18;
  const duration = 1.05 + (i % 5) * 0.22;
  const length = 10 + (i % 4) * 4;
  const drift = ((i * 13) % 9) - 4;
  const opacity = 0.08 + (i % 4) * 0.03;

  return {
    left: `${left}%`,
    delay: `${delay}s`,
    duration: `${duration}s`,
    length: `${length}px`,
    drift: `${drift}px`,
    opacity: String(opacity),
  };
});

function rainVars(drop: (typeof RAIN_DROPS)[number]): CSSProperties {
  return {
    "--rain-left": drop.left,
    "--rain-delay": drop.delay,
    "--rain-dur": drop.duration,
    "--rain-len": drop.length,
    "--rain-drift": drop.drift,
    "--rain-op": drop.opacity,
  } as CSSProperties;
}

/** Soft rain + bottom splashes + occasional comet streaks — decorative. */
export function Atmosphere() {
  return (
    <div className="atmosphere" aria-hidden>
      <div className="rain-field">
        {RAIN_DROPS.map((drop, index) => (
          <span key={`drop-${index}`} className="raindrop" style={rainVars(drop)} />
        ))}
      </div>
      <div className="rain-splash-field">
        {RAIN_DROPS.map((drop, index) => (
          <span key={`splash-${index}`} className="rain-splash" style={rainVars(drop)} />
        ))}
      </div>
      <div className="comet-sky">
        <span className="comet comet--a" />
        <span className="comet comet--b" />
        <span className="comet comet--c" />
      </div>
    </div>
  );
}
