import { cn } from "#lib/utils";

export function SectionHeader({
  title,
  description,
  className,
  revealStagger,
}: {
  title: string;
  description?: string;
  className?: string;
  /** When set, title and description reveal separately (description = stagger + 1). */
  revealStagger?: number;
}) {
  const reveal = revealStagger !== undefined;

  return (
    <header className={cn(className)}>
      <h2
        className="text-base tracking-tight text-white/90"
        {...(reveal ? { "data-reveal-item": true, "data-stagger": revealStagger } : {})}
      >
        {title}
      </h2>
      {description ? (
        <p
          className="mt-0.5 text-xxs text-white/60"
          {...(reveal ? { "data-reveal-item": true, "data-stagger": revealStagger + 1 } : {})}
        >
          {description}
        </p>
      ) : null}
    </header>
  );
}
