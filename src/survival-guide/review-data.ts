/**
 * STAGE A — NON-PRODUCTION REVIEW DATA ONLY.
 *
 * Every record in this file is a Stage A evidence-gathering placeholder,
 * not a published glossary entry. It is not imported by any application
 * code, component, route, or test outside this review process.
 *
 * STATUS: source access failed for all 26 core terms (see
 * docs/survival-guide-source-access-report.md). Every record below
 * therefore has `validationStatus: 'needs-review'`, an empty evidence
 * trail, and explicit placeholder text — nothing has been guessed,
 * paraphrased from memory, or inferred from acronym appearance.
 *
 * See docs/survival-guide-core-term-review.md for the human-readable
 * version of this same data, and docs/survival-guide-sme-review.md for
 * the sign-off checklist required before any record here may move toward
 * `verified`.
 */
import type { GlossaryCategory, ReviewRecord, SourceAccessOutcome } from './types';

const NO_SOURCE_ACCESSIBLE =
  'No approved source was accessible during Stage A (SharePoint access denied; no corporate SSO available in this environment). Not inferred from memory or context.';

/**
 * Terms whose only mandated source is one of the two named local files that
 * do not exist anywhere in this repository (see
 * docs/survival-guide-source-access-report.md) get `not-found` instead of
 * the default `access-denied`, since retrying SharePoint access would not
 * unblock them.
 */
const NOT_FOUND_TERMS = new Set(['Station Monitor', 'POR']);

function blankRecord(term: string, category: GlossaryCategory, isInitialism: boolean): ReviewRecord {
  const sourceStatus: SourceAccessOutcome = NOT_FOUND_TERMS.has(term) ? 'not-found' : 'access-denied';
  return {
    term,
    abbreviation: isInitialism ? term : undefined,
    aliases: [],
    verifiedFullName: undefined,
    category,
    proposedDefinition: NO_SOURCE_ACCESSIBLE,
    plainLanguageExplanation: 'Pending SME review — cannot be written until a source is confirmed accessible.',
    whyItMatters: 'Pending SME review.',
    whereItAppearsInDailyWork: [],
    relatedTerms: [],
    roleScope: [],
    processScope: [],
    stableOrProcedural: 'unclassified',
    validationStatus: 'needs-review',
    exactSourceFile: undefined,
    exactSharePointFolderOrSystem: undefined,
    exactSourceSectionOrPassage: undefined,
    sourceDate: undefined,
    sourceStatus,
    evidenceStatus: 'no-evidence',
    smeReviewRequired: true,
    conflictingInterpretations: [],
    limitations:
      'Stage A source retrieval (External_Systems_Catalog.md, Groups Instruction library, Yield Knowledge Base, DREAM-FE, Signal Management, Pilot Management, Wafer_Pattern_Intelligence_Agent_Instructions.md) was entirely blocked. This record cannot be verified until that access is restored.',
    smeQuestion: `What is the approved, current definition and (if applicable) acronym expansion of "${term}", and which SharePoint document/section is the source of record?`,
    privacyRisk: 'None identified in this placeholder — no operational data has been entered.',
    publicationRecommendation: 'do-not-publish',
    notes:
      sourceStatus === 'not-found'
        ? 'Blocked on an absent local file, not merely a SharePoint permission — see docs/survival-guide-source-register.md.'
        : 'Blocked on SharePoint/corporate-network access — see docs/survival-guide-source-access-report.md.',
  };
}

export const CORE_TERM_REVIEW_RECORDS: ReviewRecord[] = [
  // Yield and Defect
  blankRecord('EDI', 'yield-defect', true),
  blankRecord('Defect Count', 'yield-defect', false),
  blankRecord('NCDD', 'yield-defect', true),
  blankRecord('Baseline', 'yield-defect', false),
  blankRecord('GFA', 'yield-defect', true),
  blankRecord('CFA', 'yield-defect', true),
  blankRecord('Flyer', 'yield-defect', false),
  blankRecord('Excursion', 'yield-defect', false),

  // Tracer and Investigation
  blankRecord('Tracer', 'tracer-investigation', false),
  blankRecord('MGPC', 'tracer-investigation', true),
  blankRecord('OOC', 'tracer-investigation', true),
  blankRecord('High EDI', 'tracer-investigation', false),
  blankRecord('Commonality', 'tracer-investigation', false),
  blankRecord('Hitback', 'tracer-investigation', false),
  blankRecord('Root Cause', 'tracer-investigation', false),

  // Recovery and Tool Actions
  blankRecord('RFC', 'recovery-tool-actions', true),
  blankRecord('xRFC', 'recovery-tool-actions', false),
  blankRecord('DTP', 'recovery-tool-actions', true),
  blankRecord('GO', 'recovery-tool-actions', true),
  blankRecord('NO GO', 'recovery-tool-actions', false),
  blankRecord('GL', 'recovery-tool-actions', true),
  blankRecord('NGL', 'recovery-tool-actions', true),
  blankRecord('Station Monitor', 'recovery-tool-actions', false),

  // Daily Work and Process
  blankRecord('PD', 'pd-daily-work', true),
  blankRecord('Disposition', 'pd-daily-work', false),
  blankRecord('POR', 'pd-daily-work', true),
];

export const CORE_TERM_REVIEW_RECORDS_BY_TERM = new Map(CORE_TERM_REVIEW_RECORDS.map((r) => [r.term.toLowerCase(), r]));
