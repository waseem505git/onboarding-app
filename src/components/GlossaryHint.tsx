import { useId, useState } from 'react';
import { findGlossaryMatches } from '../glossary/glossary';
import { IconInfo } from './icons';

interface GlossaryHintProps {
  /** Text to scan for known acronyms/tool names (e.g. a mission title). */
  text: string;
}

/**
 * Renders a small info icon after any glossary-recognized term found in
 * `text`, with a short definition shown on hover, keyboard focus, or tap.
 * Renders nothing when no term in `text` is in the local glossary — this
 * never invents an explanation for an unrecognized term.
 */
export function GlossaryHint({ text }: GlossaryHintProps) {
  const matches = findGlossaryMatches(text);
  if (matches.length === 0) return null;
  return (
    <span className="glossary-hints">
      {matches.map((entry) => (
        <GlossaryTermTooltip key={entry.term} term={entry.term} definition={entry.definition} />
      ))}
    </span>
  );
}

function GlossaryTermTooltip({ term, definition }: { term: string; definition: string }) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  return (
    <span className="glossary-term">
      <button
        type="button"
        className="glossary-info-btn"
        aria-label={`What is ${term}?`}
        aria-describedby={open ? tooltipId : undefined}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
      >
        <IconInfo size={13} />
      </button>
      {open && (
        <span role="tooltip" id={tooltipId} className="glossary-tooltip">
          <strong>{term}</strong>: {definition}
        </span>
      )}
    </span>
  );
}
