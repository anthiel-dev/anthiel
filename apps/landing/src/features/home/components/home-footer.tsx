import { Mail } from "lucide-react";

import { ProgressiveImage } from "#components/progressive-image";

import { SignatureMark } from "../signature/signature-mark";
import {
  TEAM_IMAGE_HEIGHT,
  TEAM_IMAGE_PLACEHOLDER_SRC,
  TEAM_IMAGE_SRC,
  TEAM_IMAGE_WIDTH,
} from "../team/constants";

export function HomeFooter({ showTeamPhoto = false }: { showTeamPhoto?: boolean }) {
  return (
    <footer
      className={showTeamPhoto ? "mt-12 px-6 sm:mt-16 sm:px-10" : "mt-20 px-6 sm:mt-28 sm:px-10"}
    >
      {showTeamPhoto ? (
        <figure
          className="relative m-0 mb-6 w-full overflow-hidden rounded-2xl sm:mb-8"
          style={{ aspectRatio: "2.35 / 1" }}
          data-reveal-item
          data-stagger={1}
        >
          <ProgressiveImage
            src={TEAM_IMAGE_SRC}
            placeholderSrc={TEAM_IMAGE_PLACEHOLDER_SRC}
            alt="Anthiel team illustration"
            className="h-full w-full object-cover object-center grayscale"
            width={TEAM_IMAGE_WIDTH}
            height={TEAM_IMAGE_HEIGHT}
            loading="lazy"
            fetchPriority="low"
            draggable={false}
          />
        </figure>
      ) : null}
      <div className="flex h-20 items-center justify-between">
        <SignatureMark className="signature-mark block h-7 w-[100px] shrink-0 -rotate-2 text-white/70 sm:h-8 sm:w-[112px]" />
        <a
          href="mailto:hi@an-thiel.com"
          className="group inline-flex items-center text-xxs text-white/50 transition-colors duration-150 ease-out hover:text-orange-500 active:scale-[0.97]"
        >
          <span className="inline-flex w-0 items-center overflow-hidden opacity-0 transition-[width,opacity,margin] duration-150 ease-out group-hover:mr-1 group-hover:w-3 group-hover:opacity-100">
            <Mail className="size-3 shrink-0" strokeWidth={1.5} aria-hidden />
          </span>
          hi@an-thiel.com
        </a>
      </div>
    </footer>
  );
}
