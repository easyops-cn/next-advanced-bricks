/**
 * @typedef {import('../raw-data-preview/raw-data-interfaces.js').VisualConfig} VisualConfig
 */

/**
 * @param {VisualConfig[] | undefined} candidates
 * @param {number} weight
 * @returns {VisualConfig | undefined}
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function findNearestCandidate(candidates, weight) {
  return candidates?.reduce((nearest, candidate) => {
    if (
      !nearest ||
      Math.abs(candidate.visualWeight - weight) <
        Math.abs(nearest.visualWeight - weight)
    ) {
      return candidate;
    }
    return nearest;
  });
}
