/**
 * Ranking Engine
 *
 * Calculates a composite ranking score for tools.
 * All input values should be normalized to 0-1 range.
 *
 * Weights:
 *   usage    × 0.4
 *   retention × 0.2
 *   rating   × 0.2
 *   reviews  × 0.1
 *   updates  × 0.1
 */

export interface RankingInput {
  usage: number;
  retention: number;
  rating: number;
  reviews: number;
  updates: number;
}

export function calculateRankingScore(input: RankingInput): number {
  return (
    input.usage * 0.4 +
    input.retention * 0.2 +
    input.rating * 0.2 +
    input.reviews * 0.1 +
    input.updates * 0.1
  );
}
