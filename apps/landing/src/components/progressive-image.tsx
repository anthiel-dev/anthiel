import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "#lib/utils";

type ProgressiveImageProps = Omit<React.ComponentProps<"img">, "src" | "placeholder"> & {
  src: string;
  placeholderSrc: string;
  onLoadingComplete?: () => void;
};

export function ProgressiveImage({
  src,
  placeholderSrc,
  alt,
  className,
  onLoad,
  onLoadingComplete,
  ...props
}: ProgressiveImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const hasNotifiedRef = useRef(false);
  const [loaded, setLoaded] = useState(false);

  const markLoaded = useCallback(() => {
    setLoaded(true);
    if (hasNotifiedRef.current) return;
    hasNotifiedRef.current = true;
    onLoadingComplete?.();
  }, [onLoadingComplete]);

  useEffect(() => {
    hasNotifiedRef.current = false;
    setLoaded(false);

    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      markLoaded();
    }
  }, [src, markLoaded]);

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <img
        src={placeholderSrc}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full scale-105 object-cover blur-xl saturate-50"
        draggable={false}
        decoding="async"
      />
      <img
        ref={imgRef}
        src={src}
        alt={alt}
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
