/**
 * Deterministic, dependency-free stable ID generation.
 * Same (category, title) input always produces the same base ID so that
 * progress stays attached to the correct task across re-imports, as long as
 * the row's category + title text don't change.
 */

// Small FNV-1a style hash — deterministic, fast, no external dependency.
function hash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // Unsigned, base36 for compactness.
  return (h >>> 0).toString(36);
}

export function normalizeForId(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Builds the base (pre-disambiguation) stable id for a task. */
export function buildBaseTaskId(category: string, title: string): string {
  const key = `${normalizeForId(category)}::${normalizeForId(title)}`;
  return `task-${hash(key)}`;
}

/**
 * Builds a stable module id from its phase + title. Modules are never
 * persisted, so this only needs to be stable within a single render/compute
 * pass and across re-imports for the same (phase, title) pair — it does not
 * need disambiguation the way task ids do, because (phase, title) pairs are
 * already unique by construction in buildModules().
 */
export function buildModuleId(phase: string, moduleTitle: string): string {
  const key = `${normalizeForId(phase)}::${normalizeForId(moduleTitle)}`;
  return `module-${hash(key)}`;
}

/**
 * Given a list of base ids (in row order), returns final ids where duplicates
 * receive a stable numeric suffix (-2, -3, ...) so every task keeps a unique id
 * even when the workbook has duplicate/near-duplicate labels.
 */
export function disambiguateIds(baseIds: string[]): string[] {
  const seenCount = new Map<string, number>();
  return baseIds.map((base) => {
    const count = (seenCount.get(base) ?? 0) + 1;
    seenCount.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  });
}
