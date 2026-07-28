import { useState } from "react";

import { cn } from "#lib/utils";

import type { TeamProfile } from "./profiles";

import { TEAM_IMAGE_PLACEHOLDER_SRC, TEAM_IMAGE_SRC } from "./constants";

interface TeamStudioPortraitProps {
  profile: TeamProfile;
  className?: string;
}

export function TeamStudioPortrait({ profile, className }: TeamStudioPortraitProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={cn(
        "team-studio-portrait relative overflow-hidden rounded-xl bg-white/[0.03]",
        className,
      )}
    >
      <img
        src={TEAM_IMAGE_PLACEHOLDER_SRC}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl saturate-50"
        style={{ objectPosition: profile.portraitPosition }}
        draggable={false}
        decoding="async"
      />
      <img
        src={TEAM_IMAGE_SRC}
        alt=""
        aria-hidden
        className={cn(
          "team-studio-portrait-img relative h-full w-full object-cover grayscale-[0.35]",
          loaded ? "opacity-100" : "opacity-0",
        )}
        style={{ objectPosition: profile.portraitPosition }}
        draggable={false}
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
