import { ReactNode } from "react";

/**
 * AEO/GEO building blocks (2026). Answer engines (Google AI Overviews, ChatGPT
 * Search, Perplexity) lift the first 40-60 words of a section and "definition"
 * blocks whole. These components standardise the two highest-ROI patterns:
 *   - <AnswerBox>     a quotable direct answer + stat chips, placed high on the page
 *   - <DefinitionBox> a "What is X?" H2 + 2-sentence definition
 * Keep the copy tight and self-contained (no "as mentioned above" / dangling pronouns).
 */

interface AnswerBoxProps {
  /** 40-60 word direct answer to the page's primary query. Plain, quotable, standalone. */
  children: ReactNode;
  /** Optional stat chips, e.g. ["~30 seconds", "5 free designs", "3 views per cake"]. */
  stats?: string[];
  label?: string;
  className?: string;
}

export const AnswerBox = ({ children, stats, label = "Quick answer", className = "" }: AnswerBoxProps) => (
  <div
    className={`mx-auto max-w-3xl my-8 rounded-2xl border border-party-pink/25 bg-party-pink/5 p-5 md:p-6 text-left ${className}`}
  >
    <p className="text-xs font-semibold uppercase tracking-wide text-party-pink mb-2">{label}</p>
    <p className="text-base md:text-lg text-foreground/90 leading-relaxed">{children}</p>
    {stats && stats.length > 0 && (
      <div className="mt-4 flex flex-wrap gap-2">
        {stats.map((s) => (
          <span
            key={s}
            className="inline-flex items-center rounded-full bg-background/70 border border-border px-3 py-1 text-sm font-medium text-foreground"
          >
            {s}
          </span>
        ))}
      </div>
    )}
  </div>
);

interface DefinitionBoxProps {
  /** The thing being defined, e.g. "an AI cake generator". Used in the H2 "What is {term}?". */
  term: string;
  /** Full 2-sentence definition prose. Start with the term for a clean, liftable definition. */
  definition: ReactNode;
  className?: string;
}

export const DefinitionBox = ({ term, definition, className = "" }: DefinitionBoxProps) => (
  <section className={`mx-auto max-w-3xl my-10 px-1 ${className}`} aria-label={`What is ${term}`}>
    <h2 className="text-2xl md:text-3xl font-bold mb-3">What is {term}?</h2>
    <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{definition}</p>
  </section>
);
