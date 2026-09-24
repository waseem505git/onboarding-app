/**
 * Survival Guide data types.
 *
 * `ReviewRecord` remains the Stage A evidence-review shape (see
 * docs/survival-guide-core-term-review.md,
 * docs/survival-guide-source-register.md) and is still not imported by any
 * UI — it is a richer audit record, not a published shape.
 *
 * `GlossaryEntry` (and its supporting types) is the published shape and,
 * as of Stage B Step 4, IS imported by production UI:
 *   - src/components/SurvivalGuideView.tsx (via
 *     src/survival-guide/glossary-data.ts's `SME_CURATED_GLOSSARY_ENTRIES`)
 *   - src/App.tsx (the "Survival Guide" tab)
 *
 * This UI integration is explicitly SME-curated-only: every rendered entry
 * must carry `verificationStatus: 'SME-curated'` (never silently treated as
 * `'verified'`), and the UI must display a persistent disclaimer per
 * docs/survival-guide-content-governance.md and
 * docs/survival-guide-safety-validation-report.md. It remains unrelated to
 * src/domain/**, src/persistence/**, src/achievements/**, and the existing
 * src/glossary/glossary.ts tooltip glossary, none of which are touched by
 * this module.
 */

export type GlossaryCategory =
  | 'yield-defect'
  | 'tracer-investigation'
  | 'recovery-tool-actions'
  | 'pd-daily-work'
  | 'process-manufacturing'
  | 'measurement-analysis'
  | 'systems';

/**
 * Strict validation statuses per the Stage A specification. Note this is a
 * superset of the Stage A source-material's original list — it adds
 * `rejected-insufficient-evidence` for terms that must be dropped from the
 * candidate inventory rather than merely marked needs-review, and
 * `SME-curated` (Stage B) for entries sourced from an explicitly-provided,
 * human-curated local document that is NOT SharePoint-verified. An
 * `SME-curated` entry must never be silently upgraded to `verified` — that
 * still requires the full evidentiary trail in `docs/survival-guide-sme-review.md`.
 */
export type VerificationStatus =
  | 'verified'
  | 'context-dependent'
  | 'historical'
  | 'conflicting'
  | 'needs-review'
  | 'rejected-insufficient-evidence'
  | 'SME-curated';

/** FE = Front End, BE = Back End, SSAFI = Sort/Substrate/Assembly/Final Inspection track. */
export type RoleScope = 'FE' | 'BE' | 'SSAFI' | 'general';

export type ProcessScope = 'layer' | 'segment' | 'process' | 'CEID' | 'module' | 'general';

export type GlossarySourceType =
  | 'sharepoint'
  | 'signal-management'
  | 'pilot-management'
  | 'knowledge-base'
  | 'wafer-pattern-intelligence'
  | 'group-instruction'
  | 'external'
  /** A manually-provided, human-curated local document — see docs/survival-guide-stage-b-validation-report.md. Distinct from `external`/`sharepoint`: never implies SharePoint verification. */
  | 'sme-curated';

/** Whether a requested source was actually opened/read, per the Stage A access rules. */
export type SourceAccessOutcome =
  | 'accessible-fully-read'
  | 'accessible-partially-read'
  | 'access-denied'
  | 'not-found'
  | 'ambiguous-path'
  | 'not-attempted';

/**
 * How much of a term's evidence trail is actually populated, independent of
 * whether the source itself was reachable. A term can only ever have
 * `evidenceStatus: 'full-evidence'` if `sourceStatus` is
 * `'accessible-fully-read'` (or `'accessible-partially-read'` for
 * `'partial-evidence'`) — this is a Stage A/B gate, not a UI concern.
 */
export type EvidenceStatus = 'no-evidence' | 'partial-evidence' | 'full-evidence';

export interface GlossarySource {
  sourceType: GlossarySourceType;
  fileName?: string;
  sourceSystem?: string;
  /** The exact path or URL requested — must match what was actually attempted. */
  sitePath: string;
  section?: string;
  lastVerified?: string;
  /** Only present when explicitly available from the source itself. */
  lastModified?: string;
  accessOutcome: SourceAccessOutcome;
}

export interface GlossaryEntry {
  id: string;
  term: string;
  abbreviation?: string;
  aliases: string[];
  /** Only set when an approved source explicitly documents the expansion. */
  fullName?: string;
  category: GlossaryCategory;
  definition: string;
  plainLanguage: string;
  whyItMatters: string;
  dailyWorkContext: string[];
  whereYouWillSeeIt: string[];
  relatedTerms: string[];
  roleScope: RoleScope[];
  processScope: ProcessScope[];
  stableOrProcedural: 'stable' | 'procedural' | 'mixed';
  verificationStatus: VerificationStatus;
  sources: GlossarySource[];
  reviewedBy?: string;
  reviewedOn?: string;
  needsReview: boolean;
}

/**
 * A Stage A evidence record — richer than `GlossaryEntry`, since it must
 * carry the audit trail (conflicts, limitations, SME questions, privacy
 * risk, publication recommendation) that a published entry would not need
 * to display in the UI but that a reviewer must see.
 */
export interface ReviewRecord {
  term: string;
  abbreviation?: string;
  aliases: string[];
  /** Only set when an approved source explicitly documents the expansion. */
  verifiedFullName?: string;
  category: GlossaryCategory;
  proposedDefinition: string;
  plainLanguageExplanation: string;
  whyItMatters: string;
  whereItAppearsInDailyWork: string[];
  relatedTerms: string[];
  roleScope: RoleScope[];
  processScope: ProcessScope[];
  stableOrProcedural: 'stable' | 'procedural' | 'mixed' | 'unclassified';
  validationStatus: VerificationStatus;
  /** Exact file/folder/system the definition would come from, once accessible. */
  exactSourceFile?: string;
  exactSharePointFolderOrSystem?: string;
  exactSourceSectionOrPassage?: string;
  sourceDate?: string;
  /**
   * Aggregate access outcome for this term's mandated source(s), per
   * docs/survival-guide-source-access-report.md. This is a per-term summary
   * of the same access-attempt evidence, not a separate access attempt.
   */
  sourceStatus: SourceAccessOutcome;
  /** How much of the evidence trail is actually populated (see `EvidenceStatus`). */
  evidenceStatus: EvidenceStatus;
  /**
   * Whether this term must pass the checklist in
   * docs/survival-guide-sme-review.md before `validationStatus` can move away
   * from `'needs-review'`. Always `true` while `evidenceStatus` is not
   * `'full-evidence'`.
   */
  smeReviewRequired: boolean;
  conflictingInterpretations: string[];
  limitations: string;
  smeQuestion: string;
  privacyRisk: string;
  publicationRecommendation: 'do-not-publish' | 'publish-with-sme-review' | 'not-applicable-yet';
  /** Freeform Stage A reviewer notes — never a substitute for the structured fields above. */
  notes?: string;
}

export const SCHEMA_VERSION = 1;
