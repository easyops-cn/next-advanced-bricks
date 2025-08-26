export default function findNearestCandidate<
  T extends { visualWeight: number },
>(candidates: T[] | undefined, weight: number): T | undefined {
  const candidate = candidates?.reduce((nearest, candidate) => {
    if (
      !nearest ||
      Math.abs(candidate.visualWeight - weight) <
        Math.abs(nearest.visualWeight - weight)
    ) {
      return candidate;
    }
    return nearest;
  });
  return candidate;
}
