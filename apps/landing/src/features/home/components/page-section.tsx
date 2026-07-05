import { cn } from "#lib/utils";

export function PageSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={cn("mt-8", className)}>{children}</section>;
}
