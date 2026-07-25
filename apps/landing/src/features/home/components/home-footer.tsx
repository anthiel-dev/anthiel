import { Mail } from "lucide-react";

export function HomeFooter() {
  return (
    <footer className="mt-20 flex h-20 items-center justify-between px-6 sm:mt-28 sm:px-10">
      <p className="font-heading text-sm font-semibold tracking-tight text-white/80">Anthiel.</p>
      <a
        href="mailto:hi@an-thiel.com"
        className="group inline-flex items-center text-xxs text-white/50 transition-colors duration-150 ease-out hover:text-orange-500 active:scale-[0.97]"
      >
        <span className="inline-flex w-0 items-center overflow-hidden opacity-0 transition-[width,opacity,margin] duration-150 ease-out group-hover:mr-1 group-hover:w-3 group-hover:opacity-100">
          <Mail className="size-3 shrink-0" strokeWidth={1.5} aria-hidden />
        </span>
        hi@an-thiel.com
      </a>
    </footer>
  );
}
