import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { SurvivalGuideView } from './SurvivalGuideView';
import { SME_CURATED_GLOSSARY_ENTRIES } from '../survival-guide/glossary-data';
import type { GlossaryEntry } from '../survival-guide/types';

function makeEntry(overrides: Partial<GlossaryEntry> = {}): GlossaryEntry {
  return {
    id: 'test-term',
    term: 'Test Term',
    aliases: [],
    category: 'yield-defect',
    definition: 'A definition used only for tests.',
    plainLanguage: '',
    whyItMatters: '',
    dailyWorkContext: [],
    whereYouWillSeeIt: [],
    relatedTerms: [],
    roleScope: [],
    processScope: [],
    stableOrProcedural: 'mixed',
    verificationStatus: 'SME-curated',
    sources: [
      {
        sourceType: 'sme-curated',
        fileName: 'defmet-survival-guide-v1.md',
        sitePath: 'local-source-materials/terminology/defmet-survival-guide-v1.md',
        accessOutcome: 'accessible-fully-read',
      },
    ],
    needsReview: false,
    ...overrides,
  };
}

describe('SurvivalGuideView', () => {
  it('always renders the SME-curated / not-authoritative disclaimer', () => {
    render(<SurvivalGuideView entries={[makeEntry()]} />);
    expect(screen.getByRole('note')).toHaveTextContent(/SME-curated, not SharePoint-verified/i);
    expect(screen.getByRole('note')).toHaveTextContent(/GO\/NO-GO/i);
  });

  it('renders a card per entry with its category and SME-curated badge', () => {
    render(<SurvivalGuideView entries={[makeEntry()]} />);
    expect(screen.getByRole('button', { name: /Test Term/i })).toBeInTheDocument();
    expect(screen.getByText('SME-curated')).toBeInTheDocument();
  });

  it('flags needsReview entries with a visible badge', () => {
    render(<SurvivalGuideView entries={[makeEntry({ needsReview: true })]} />);
    expect(screen.getAllByText('⚠ SME Review Required').length).toBeGreaterThan(0);
  });

  it('does not show the needs-review badge for entries that do not need it', () => {
    render(<SurvivalGuideView entries={[makeEntry({ needsReview: false })]} />);
    const card = screen.getByRole('button', { name: /Test Term/i });
    expect(within(card).queryByText('⚠ SME Review Required')).not.toBeInTheDocument();
  });

  it('always displays the full English expansion directly on the card when fullName is set', () => {
    render(<SurvivalGuideView entries={[makeEntry({ term: 'SS', fullName: 'Surface Scan' })]} />);
    const card = screen.getByRole('button', { name: /^SS/i });
    expect(within(card).getByText('Surface Scan')).toBeInTheDocument();
  });

  it('shows the "Full Name Pending SME Verification" placeholder when fullName is empty', () => {
    render(<SurvivalGuideView entries={[makeEntry({ term: 'MGPC', fullName: undefined })]} />);
    const card = screen.getByRole('button', { name: /^MGPC/i });
    expect(within(card).getByText('Full Name Pending SME Verification')).toBeInTheDocument();
  });

  it('filters by search query', () => {
    render(
      <SurvivalGuideView
        entries={[makeEntry({ id: 'a', term: 'Alpha' }), makeEntry({ id: 'b', term: 'Beta' })]}
      />,
    );
    fireEvent.change(screen.getByLabelText(/search terms/i), { target: { value: 'Alpha' } });
    expect(screen.getByRole('button', { name: /Alpha/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Beta/i })).not.toBeInTheDocument();
  });

  it('filters by category', () => {
    render(
      <SurvivalGuideView
        entries={[
          makeEntry({ id: 'a', term: 'Alpha', category: 'yield-defect' }),
          makeEntry({ id: 'b', term: 'Beta', category: 'systems' }),
        ]}
      />,
    );
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'systems' } });
    expect(screen.queryByRole('button', { name: /Alpha/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Beta/i })).toBeInTheDocument();
  });

  it('opens a detail view on click, showing definition and source', () => {
    render(<SurvivalGuideView entries={[makeEntry()]} />);
    fireEvent.click(screen.getByRole('button', { name: /Test Term/i }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('A definition used only for tests.')).toBeInTheDocument();
    expect(within(dialog).getByText(/defmet-survival-guide-v1\.md/)).toBeInTheDocument();
  });

  it('lets related-term chips jump to the referenced entry when it resolves', () => {
    render(
      <SurvivalGuideView
        entries={[
          makeEntry({ id: 'a', term: 'Alpha', relatedTerms: ['Beta'] }),
          makeEntry({ id: 'b', term: 'Beta' }),
        ]}
      />,
    );
    fireEvent.click(screen.getByText('Alpha').closest('button')!);
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Beta' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Beta');
  });

  it('renders every SME-curated production entry without crashing', () => {
    render(<SurvivalGuideView entries={SME_CURATED_GLOSSARY_ENTRIES} />);
    expect(screen.getByText(`${SME_CURATED_GLOSSARY_ENTRIES.length} of ${SME_CURATED_GLOSSARY_ENTRIES.length} terms`)).toBeInTheDocument();
  });

  it('every production entry is labeled SME-curated, never a bare "verified" claim', () => {
    for (const entry of SME_CURATED_GLOSSARY_ENTRIES) {
      expect(entry.verificationStatus).toBe('SME-curated');
    }
  });
});
