import { Mail } from "lucide-react";

export function FaqContactLine({ stagger }: { stagger?: number }) {
  return (
    <p
      className="mt-10 text-xxs text-white/50"
      {...(stagger !== undefined ? { "data-reveal-item": true, "data-stagger": stagger } : {})}
    >
      Still curious?{" "}
      <a
        href="mailto:hi@an-thiel.com"
        className="group inline-flex items-center text-white/70 transition-colors duration-150 ease-out hover:text-orange-500 active:scale-[0.97]"
      >
        <span className="inline-flex w-0 items-center overflow-hidden opacity-0 transition-[width,opacity,margin] duration-150 ease-out group-hover:mr-1 group-hover:w-3 group-hover:opacity-100">
          <Mail className="size-3 shrink-0" strokeWidth={1.5} aria-hidden />
        </span>
        hi@an-thiel.com
      </a>
    </p>
  );
}
