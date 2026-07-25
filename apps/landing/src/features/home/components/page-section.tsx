import { cn } from "#lib/utils";

export function PageSection({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-8", className)}>
      {children}
    </section>
  );
}
