import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { cn } from "#lib/utils";

const HIDE_DELAY_MS = 900;
const MIN_THUMB_PX = 40;

export function PremiumScrollbar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef(0);

  const [thumbTop, setThumbTop] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(MIN_THUMB_PX);
  const [visible, setVisible] = useState(false);
  const [needed, setNeeded] = useState(false);

  useEffect(() => {
    function clearHideTimer() {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    }

    function scheduleHide() {
      clearHideTimer();
      hideTimerRef.current = setTimeout(() => {
        if (!draggingRef.current) setVisible(false);
      }, HIDE_DELAY_MS);
    }

    function update() {
      const scrollTop = window.scrollY;
      const viewport = window.innerHeight;
      const content = document.documentElement.scrollHeight;
      const maxScroll = content - viewport;
      const trackHeight = trackRef.current?.clientHeight ?? viewport;

      if (maxScroll <= 0) {
        setNeeded(false);
        setVisible(false);
        return;
      }

      setNeeded(true);
      const height = Math.max(MIN_THUMB_PX, (viewport / content) * trackHeight);
      const maxThumbTop = trackHeight - height;
      const top = maxScroll <= 0 ? 0 : (scrollTop / maxScroll) * maxThumbTop;

      setThumbHeight(height);
      setThumbTop(top);
    }

    function onScroll() {
      update();
      setVisible(true);
      scheduleHide();
    }

    function onPointerMove(event: PointerEvent) {
      if (!draggingRef.current || !trackRef.current) return;

      const track = trackRef.current;
      const rect = track.getBoundingClientRect();
      const trackHeight = track.clientHeight;
      const content = document.documentElement.scrollHeight;
      const viewport = window.innerHeight;
      const maxScroll = content - viewport;
      const height = Math.max(MIN_THUMB_PX, (viewport / content) * trackHeight);
      const maxThumbTop = trackHeight - height;
      const nextTop = Math.min(
        maxThumbTop,
        Math.max(0, event.clientY - rect.top - dragOffsetRef.current),
      );

      window.scrollTo({ top: maxThumbTop <= 0 ? 0 : (nextTop / maxThumbTop) * maxScroll });
    }

    function onPointerUp() {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      document.body.style.userSelect = "";
      scheduleHide();
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(document.documentElement);

    return () => {
      clearHideTimer();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      resizeObserver.disconnect();
    };
  }, []);

  function onThumbPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!trackRef.current) return;
    event.preventDefault();
    draggingRef.current = true;
    document.body.style.userSelect = "none";
    setVisible(true);
    dragOffsetRef.current = event.clientY - trackRef.current.getBoundingClientRect().top - thumbTop;
  }

  function onTrackPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!trackRef.current || event.target !== trackRef.current) return;

    const track = trackRef.current;
    const rect = track.getBoundingClientRect();
    const trackHeight = track.clientHeight;
    const content = document.documentElement.scrollHeight;
    const viewport = window.innerHeight;
    const maxScroll = content - viewport;
    const height = Math.max(MIN_THUMB_PX, (viewport / content) * trackHeight);
    const maxThumbTop = trackHeight - height;
    const clickTop = Math.min(maxThumbTop, Math.max(0, event.clientY - rect.top - height / 2));

    window.scrollTo({
      top: maxThumbTop <= 0 ? 0 : (clickTop / maxThumbTop) * maxScroll,
      behavior: "smooth",
    });
    setVisible(true);
  }

  if (!needed) return null;

  return (
    <div
      ref={trackRef}
      aria-hidden
      className={cn(
        "premium-scrollbar fixed top-3 right-1.5 bottom-3 z-[60] w-1.5 rounded-full",
        "transition-opacity duration-300 ease-out",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      onPointerDown={onTrackPointerDown}
    >
      <div
        className="absolute inset-x-0 rounded-full bg-white/25 backdrop-blur-[2px] transition-[background-color] duration-150 ease-out hover:bg-white/40 active:bg-white/50"
        style={{ top: thumbTop, height: thumbHeight }}
        onPointerDown={onThumbPointerDown}
      />
    </div>
  );
}
