import { useEffect, useRef, useState } from "react";

import { SIGNATURE_PATHS, SIGNATURE_VIEWBOX } from "./paths";

const STROKE_MS = 280;
const GAP_MS = 140;

export function SignatureMark({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setDrawn(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setDrawn(true);
        observer.disconnect();
      },
      { threshold: 0.01 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const svg = ref.current;
    if (!svg || !drawn) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const paths = [...svg.querySelectorAll<SVGPathElement>(".signature-stroke")];

    for (const [i, path] of paths.entries()) {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
      path.style.opacity = "0";

      if (reduceMotion) {
        path.style.strokeDashoffset = "0";
        path.style.opacity = "1";
        continue;
      }

      const delay = i * GAP_MS;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          path.style.transition = [
            `stroke-dashoffset ${STROKE_MS}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
            `opacity 0ms linear ${delay}ms`,
          ].join(", ");
          path.style.opacity = "1";
          path.style.strokeDashoffset = "0";
        });
      });
    }
  }, [drawn]);

  return (
    <svg
      ref={ref}
      className={className}
      viewBox={SIGNATURE_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Anthiel :)"
      data-drawn={drawn ? "true" : "false"}
      preserveAspectRatio="xMidYMid meet"
    >
      {SIGNATURE_PATHS.map((d, i) => (
        <path key={i} className="signature-stroke" d={d} />
      ))}
    </svg>
  );
}
