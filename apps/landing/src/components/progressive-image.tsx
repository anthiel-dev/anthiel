import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "#lib/utils";

type ProgressiveImageProps = Omit<React.ComponentProps<"img">, "src" | "placeholder"> & {
  src: string;
  placeholderSrc: string;
  onLoadingComplete?: () => void;
};

export function ProgressiveImage(props: ProgressiveImageProps) {
  // Remount on src change so load state resets without an effect syncing props → state.
  return <ProgressiveImageInner key={props.src} {...props} />;
}

function ProgressiveImageInner({
  src,
  placeholderSrc,
  alt,
  className,
  onLoad,
  onLoadingComplete,
  loading,
  fetchPriority,
  width,
  height,
  ...props
}: ProgressiveImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const hasNotifiedRef = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const resolvedLoading = loading ?? (fetchPriority === "high" ? "eager" : "lazy");

  const markLoaded = useCallback(() => {
    setLoaded(true);
    if (hasNotifiedRef.current) return;
    hasNotifiedRef.current = true;
    onLoadingComplete?.();
  }, [onLoadingComplete]);

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      markLoaded();
    }
  }, [markLoaded]);

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <img
        src={placeholderSrc}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full scale-105 object-cover blur-xl saturate-50"
        draggable={false}
        decoding="async"
        loading={resolvedLoading}
      />
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={resolvedLoading}
        fetchPriority={fetchPriority}
        decoding="async"
        onLoad={(event) => {
          markLoaded();
          onLoad?.(event);
        }}
        className={cn(
          "relative h-full w-full object-cover motion-safe:transition-[opacity,filter] motion-safe:duration-500 motion-safe:ease-out",
          loaded ? "opacity-100 blur-0" : "opacity-0 blur-sm",
        )}
        {...props}
      />
    </div>
  );
}
