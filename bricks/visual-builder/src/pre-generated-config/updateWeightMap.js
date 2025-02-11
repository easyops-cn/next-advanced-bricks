/**
 * @param {Map<string, number>} weightMap
 * @param {Map<string, number[]>} availableWeights
 * @param {string} key
 * @param {1 | -1} direction
 * @returns {Map<string, number>}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function updateWeightMap(weightMap, availableWeights, key, direction) {
  return new Map(
    [...weightMap].map(([k, v]) => {
      if (k === key) {
        const weights = availableWeights.get(k);
        const index = weights.indexOf(v);
        const nextIndex = Math.max(
          0,
          Math.min(index + direction, weights.length - 1)
        );
        return [k, weights[nextIndex]];
      }
      return [k, v];
    })
  );
}
