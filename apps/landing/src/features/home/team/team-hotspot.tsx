import { useState, useRef, useCallback, type CSSProperties } from "react";

import type { TeamMember } from "./types";

interface TeamHotspotProps {
  member: TeamMember;
}

export function TeamHotspot({ member }: TeamHotspotProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [cardStyle, setCardStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const placement = member.tooltipPlacement ?? "top";

  const showCard = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const parent = triggerRef.current.closest(".team-photo-container");
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();

    const triggerCenterX = rect.left + rect.width / 2 - parentRect.left;

    if (placement === "bottom") {
      const triggerBottom = rect.bottom - parentRect.top;
      setCardStyle({
        left: `${triggerCenterX}px`,
        top: `${triggerBottom + 8}px`,
        transform: "translate(-50%, 0)",
      });
    } else {
      const triggerTop = rect.top - parentRect.top;
      setCardStyle({
        left: `${triggerCenterX}px`,
        top: `${triggerTop - 8}px`,
        transform: "translate(-50%, -100%)",
      });
    }

    setIsVisible(true);
  }, [placement]);

  const hideCard = useCallback(() => {
    timeoutRef.current = setTimeout(() => setIsVisible(false), 120);
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="team-hotspot absolute rounded-full cursor-pointer border hover:border-orange-400/60 border-dashed transition-[border-color] duration-150 ease-out animate-pulse bg-orange-400/20"
        style={{
          ...member.position,
          width: member.size,
          aspectRatio: "1",
        }}
        onMouseEnter={showCard}
        onMouseLeave={hideCard}
        onFocus={showCard}
        onBlur={hideCard}
        onClick={showCard}
        aria-label={`View ${member.name}'s details`}
      />

      <div
        className={`team-tooltip-card${placement === "bottom" ? " team-tooltip-card--bottom" : ""}`}
        data-visible={isVisible}
        data-placement={placement}
        style={cardStyle}
        onMouseEnter={() => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }}
        onMouseLeave={hideCard}
      >
        <div className="team-tooltip-inner">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 shrink-0">
            <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-xs font-semibold text-white truncate">{member.name}</span>
            <span className="text-xxxs text-white/70 truncate">{member.role}</span>
            <span className="text-xxxs text-orange-400 font-medium">
              {member.years}+ years exp.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
