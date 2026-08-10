import { ArrowRight, Mail } from "lucide-react";
import { Fragment, type ReactNode } from "react";

const CONTACT_EMAIL = "hi@an-thiel.com";

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\[\[contact:[^\]]+\]\])/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let part = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <Fragment key={`${keyPrefix}-t-${part++}`}>{text.slice(lastIndex, match.index)}</Fragment>,
      );
    }

    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${part++}`} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      const label = token.slice("[[contact:".length, -2);
      nodes.push(
        <a
          key={`${keyPrefix}-c-${part++}`}
          href={`mailto:${CONTACT_EMAIL}`}
          className="group inline-flex items-center gap-1.5 text-orange-500 transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          <span className="relative size-3 shrink-0" aria-hidden>
            <Mail
              className="absolute inset-0 size-3 transition-[opacity,transform] duration-150 ease-out group-hover:scale-75 group-hover:opacity-0"
              strokeWidth={1.5}
            />
            <ArrowRight
              className="absolute inset-0 size-3 translate-x-[-3px] opacity-0 transition-[opacity,transform] duration-150 ease-out group-hover:translate-x-0 group-hover:opacity-100"
              strokeWidth={1.5}
            />
          </span>
          {label}
        </a>,
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(<Fragment key={`${keyPrefix}-t-${part++}`}>{text.slice(lastIndex)}</Fragment>);
  }

  return nodes;
}

/** Render FAQ answer markup: paragraphs, **bold**, and [[contact:Label]]. */
export function RichText({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/);

  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <Fragment key={index}>
          {index > 0 ? (
            <>
              <br />
              <br />
            </>
          ) : null}
          {renderInline(paragraph, `p${index}`)}
        </Fragment>
      ))}
    </>
  );
}

/** Strip markup for JSON-LD / stream text. */
export function plainFaqText(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[\[contact:([^\]]+)\]\]/g, "$1")
    .trim();
}
