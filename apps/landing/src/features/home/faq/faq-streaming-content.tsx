import { useEffect, useRef, useState, type ReactNode } from "react";

import { TYPEWRITER_CHAR_MS } from "./data";

interface FaqStreamingContentProps {
  text: string;
  finalContent: ReactNode;
  enabled: boolean;
  onComplete: () => void;
  onProgress?: () => void;
}

export function FaqStreamingContent({
  text,
  finalContent,
  enabled,
  onComplete,
  onProgress,
}: FaqStreamingContentProps) {
  const [visibleLength, setVisibleLength] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const onCompleteRef = useRef(onComplete);
  const onProgressRef = useRef(onProgress);

  onCompleteRef.current = onComplete;
  onProgressRef.current = onProgress;

  useEffect(() => {
    if (!enabled) {
      setVisibleLength(text.length);
      setIsComplete(true);
      onCompleteRef.current();
      return;
    }

    setVisibleLength(0);
    setIsComplete(false);

    let index = 0;
    const intervalId = window.setInterval(() => {
      index += 1;
      setVisibleLength(index);
      onProgressRef.current?.();

      if (index >= text.length) {
        window.clearInterval(intervalId);
        setIsComplete(true);
        onCompleteRef.current();
      }
    }, TYPEWRITER_CHAR_MS);

    return () => window.clearInterval(intervalId);
  }, [enabled, text]);

  if (isComplete) {
    return <>{finalContent}</>;
  }

  const displayedText = text.slice(0, visibleLength);

  return (
    <span className="whitespace-pre-line">
      {displayedText}
      <span className="faq-typewriter-cursor" aria-hidden="true" />
    </span>
  );
}
