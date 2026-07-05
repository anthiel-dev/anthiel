import { useState } from "react";

import { ProgressiveImage } from "#components/progressive-image";
import { cn } from "#lib/utils";

import {
  TEAM_IMAGE_HEIGHT,
  TEAM_IMAGE_PLACEHOLDER_SRC,
  TEAM_IMAGE_SRC,
  TEAM_IMAGE_WIDTH,
} from "../team/constants";
import { team } from "../team/data";
import { TeamHotspot } from "../team/team-hotspot";
import { PageSection } from "./page-section";
import { SectionHeader } from "./section-header";

export function TeamSection() {
  const [imageReady, setImageReady] = useState(false);

  return (
    <PageSection>
      <SectionHeader
        title="Meet the team"
        description="Hover on each character's head to see their details"
        className="mb-4"
        revealStagger={4}
      />
      <figure
        className="team-photo-container relative m-0 -mx-10 w-[calc(100%+5rem)]"
        style={{ aspectRatio: `${TEAM_IMAGE_WIDTH} / ${TEAM_IMAGE_HEIGHT}` }}
        data-reveal-item
        data-stagger="5"
      >
        <ProgressiveImage
          src={TEAM_IMAGE_SRC}
          placeholderSrc={TEAM_IMAGE_PLACEHOLDER_SRC}
          alt="Anthiel team illustration"
          className="rounded-2xl grayscale-75"
          draggable={false}
          fetchPriority="high"
          onLoadingComplete={() => setImageReady(true)}
        />
        <div
          className={cn(
            "absolute inset-0 z-10 overflow-visible motion-safe:transition-opacity motion-safe:duration-500 motion-safe:ease-out",
            imageReady ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          aria-hidden={!imageReady}
        >
          {team.map((member) => (
            <TeamHotspot key={member.id} member={member} />
          ))}
        </div>
      </figure>
    </PageSection>
  );
}
