import { cn } from "#lib/utils";

export function FaqTypingIndicator({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 py-0.5", className)}
      aria-label="Assistant is typing"
      role="status"
    >
      <span className="faq-typing-dot" />
      <span className="faq-typing-dot" />
      <span className="faq-typing-dot" />
    </span>
  );
}
