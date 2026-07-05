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
  revealStagger?: number;
}) {
  return (
    <header
      className={cn(className)}
      {...(revealStagger !== undefined
        ? { "data-reveal-item": true, "data-stagger": revealStagger }
        : {})}
    >
      <h2 className="text-sm text-white/90">{title}</h2>
      {description ? <p className="mt-0.5 text-xxs text-white/60">{description}</p> : null}
    </header>
  );
}
