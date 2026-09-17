import { describe, expect, it } from 'vitest';
import { findGlossaryMatches, getGlossaryEntry, GLOSSARY } from './glossary';

describe('findGlossaryMatches', () => {
  it('matches a known acronym as a whole word, case-insensitively', () => {
    expect(findGlossaryMatches('ICE')).toHaveLength(1);
    expect(findGlossaryMatches('ice')).toHaveLength(1);
    expect(findGlossaryMatches('Please install ICE first')).toHaveLength(1);
  });

  it('does not match a term that is only a substring of another word', () => {
    // "RFC" should not match inside "AIRFCRAFT"-style embedded text.
    expect(findGlossaryMatches('AIRFCRAFT')).toHaveLength(0);
  });

  it('returns an empty array for text with no recognized terms', () => {
    expect(findGlossaryMatches('Some unrelated mission title')).toEqual([]);
  });

  it('returns an empty array for empty input', () => {
    expect(findGlossaryMatches('')).toEqual([]);
  });

  it('de-duplicates and preserves glossary order when multiple terms appear', () => {
    const matches = findGlossaryMatches('WG and RFC and WG again');
    expect(matches.map((m) => m.term)).toEqual(['RFC', 'WG']);
  });

  it('never returns a definition for a term not present in the static glossary', () => {
    expect(getGlossaryEntry('NOT_A_REAL_TERM')).toBeUndefined();
  });

  it('every glossary entry has a non-empty term and definition', () => {
    for (const entry of GLOSSARY) {
      expect(entry.term.trim().length).toBeGreaterThan(0);
      expect(entry.definition.trim().length).toBeGreaterThan(0);
    }
  });
});
