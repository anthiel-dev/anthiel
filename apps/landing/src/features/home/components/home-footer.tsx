import { Mail } from "lucide-react";

export function HomeFooter() {
  return (
    <footer className="mt-20 flex h-20 items-center justify-between px-6 sm:mt-28 sm:px-10">
      <p className="font-heading text-sm font-semibold tracking-tight text-white/80">anthiel.</p>
      <a
        href="mailto:hello@an-thiel.com"
        className="inline-flex items-center gap-1.5 text-xxs text-white/50 transition-colors duration-150 ease-out hover:text-white/80 active:scale-[0.97]"
      >
        <Mail className="size-3" strokeWidth={1.5} aria-hidden />
        hello@an-thiel.com
      </a>
    </footer>
  );
}
