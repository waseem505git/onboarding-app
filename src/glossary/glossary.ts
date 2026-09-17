/**
 * Lightweight, local, static glossary for the acronym/tool names that show
 * up as mission titles (mostly under "Systems installation & overview" and
 * a few module names like "POR layers Practice" / "WG Overview & tool
 * menagerie"). This intentionally:
 *  - never calls an external service (pure static data),
 *  - never invents an internal procedure or workflow step,
 *  - only gives a short, general-purpose description of what the term
 *    commonly refers to, plus a pointer to ask a trainer for area-specific
 *    detail.
 *
 * Add new terms here as needed. Terms not listed simply render no tooltip —
 * we never guess at a definition for something we don't know.
 */
export interface GlossaryEntry {
  /** The exact term as it should be matched (case-insensitive, whole word). */
  term: string;
  /** One short, general sentence. No invented internal procedures. */
  definition: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: 'ICE',
    definition:
      'An internal Defect Metrology tool used for defect classification and review workflows. Ask your trainer for area-specific usage.',
  },
  {
    term: 'KLARITY',
    definition:
      'A defect inspection and review tool used in Defect Metrology. Ask your trainer for area-specific usage.',
  },
  {
    term: 'RFC',
    definition: 'Request for Comment/Change — a formal review process used before a change is adopted.',
  },
  {
    term: 'POR',
    definition: 'Plan of Record — the currently agreed, documented approach or specification for a process.',
  },
  {
    term: 'WG',
    definition: 'Working Group — a team focused on a specific tool set or technical area.',
  },
  {
    term: 'EDI',
    definition: 'Electronic Data Interchange — used here for exchanging or reporting data between systems.',
  },
  {
    term: 'DETS',
    definition: 'An internal Defect Metrology tool/system. Ask your trainer for area-specific usage.',
  },
  {
    term: 'DART',
    definition: 'An internal Defect Metrology tool/system. Ask your trainer for area-specific usage.',
  },
  {
    term: 'JMP',
    definition: 'A statistical data-analysis application commonly used for exploring engineering data.',
  },
];

const GLOSSARY_BY_TERM = new Map(GLOSSARY.map((entry) => [entry.term.toLowerCase(), entry]));

/**
 * Finds every glossary entry whose term appears as a whole word inside the
 * given text (e.g. a mission title), case-insensitively, de-duplicated and
 * in glossary-definition order. Returns [] when nothing matches — this
 * function never fabricates a definition for an unrecognized term.
 */
export function findGlossaryMatches(text: string): GlossaryEntry[] {
  if (!text) return [];
  const found: GlossaryEntry[] = [];
  const seen = new Set<string>();
  for (const entry of GLOSSARY) {
    const pattern = new RegExp(`\\b${escapeRegExp(entry.term)}\\b`, 'i');
    if (pattern.test(text) && !seen.has(entry.term.toLowerCase())) {
      seen.add(entry.term.toLowerCase());
      found.push(entry);
    }
  }
  return found;
}

export function getGlossaryEntry(term: string): GlossaryEntry | undefined {
  return GLOSSARY_BY_TERM.get(term.toLowerCase());
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
