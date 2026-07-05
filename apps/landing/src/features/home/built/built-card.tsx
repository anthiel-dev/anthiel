import {
  Card,
  CardFrame,
  CardFrameDescription,
  CardFrameHeader,
  CardFrameTitle,
  CardPanel,
} from "#components/ui/card";

export interface BuiltCardProps {
  title: string;
  description: string;
  href?: string;
  image?: string;
}

export function BuiltCard({ title, description, href, image }: BuiltCardProps) {
  return (
    <CardFrame className="w-full after:pointer-events-none after:absolute after:inset-[-4px] after:-z-1 after:rounded-[calc(var(--radius-xl)+6px)] after:border after:border-border/64">
      <CardFrameHeader className="static grid grid-rows-[auto_1fr] px-3 py-2">
        <CardFrameTitle className="font-heading text-sm font-medium">
          {href ? (
            <a className="before:absolute before:inset-0" href={href}>
              {title}
            </a>
          ) : (
            title
          )}
        </CardFrameTitle>
        <CardFrameDescription className="mt-2 line-clamp-2 sm:h-[2lh] text-xxs! text-white/60">
          {description}
        </CardFrameDescription>
      </CardFrameHeader>
      <Card className="relative h-[200px] w-full overflow-hidden p-0">
        <CardPanel className="relative h-full w-full px-0">
          {image ? (
            <img
              src={image}
              alt=""
              className="absolute right-0 bottom-0 h-[90%] w-[95%] rounded-tl-2xl object-cover object-top grayscale hover:grayscale-0 transition-all duration-300"
              draggable={false}
            />
          ) : (
            <div className="absolute right-0 bottom-0 h-[90%] w-[95%] rounded-tl-2xl bg-muted-foreground/20" />
          )}
        </CardPanel>
      </Card>
    </CardFrame>
  );
}
