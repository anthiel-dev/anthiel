import { useEffect, useState } from "react";

const FADE_DISTANCE_PX = 64;

export function ScrollEdgeFades() {
  const [topOpacity, setTopOpacity] = useState(0);
  const [bottomOpacity, setBottomOpacity] = useState(0);

  useEffect(() => {
    function update() {
      const scrollTop = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      if (maxScroll <= 0) {
        setTopOpacity(0);
        setBottomOpacity(0);
        return;
      }

      setTopOpacity(Math.min(1, scrollTop / FADE_DISTANCE_PX));
      setBottomOpacity(Math.min(1, (maxScroll - scrollTop) / FADE_DISTANCE_PX));
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(document.documentElement);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-50 h-20 bg-gradient-to-b from-background to-transparent transition-opacity duration-200 ease-out sm:h-24"
        style={{ opacity: topOpacity }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 h-20 bg-gradient-to-t from-background to-transparent transition-opacity duration-200 ease-out sm:h-24"
        style={{ opacity: bottomOpacity }}
      />
    </>
  );
}
