import {
  FavorabilityTier,
  estimateHouseEdge,
  favorabilityTier,
} from '@/src/lib/houseEdge';
import { parseTableRules } from '@/src/lib/tableRules';

export type TableRankInfo = {
  houseEdge: number | null;
  tier: FavorabilityTier | null;
  isBest: boolean;
};

type RankableTable = {
  id: string;
  rulesJson: string | null;
};

/**
 * Absolute tier from each table's rules; unique lowest HE among
 * tables with rules gets isBest only when that tier is not unfavorable.
 * Ties → no exclusive best.
 */
export function rankTables(tables: RankableTable[]): Map<string, TableRankInfo> {
  const result = new Map<string, TableRankInfo>();
  const scored: { id: string; houseEdge: number; tier: FavorabilityTier }[] =
    [];

  for (const table of tables) {
    const rules = parseTableRules(table.rulesJson);
    if (!rules) {
      result.set(table.id, {
        houseEdge: null,
        tier: null,
        isBest: false,
      });
      continue;
    }
    const houseEdge = estimateHouseEdge(rules);
    const tier = favorabilityTier(houseEdge);
    scored.push({ id: table.id, houseEdge, tier });
    result.set(table.id, { houseEdge, tier, isBest: false });
  }

  if (scored.length === 0) return result;

  const minEdge = Math.min(...scored.map((row) => row.houseEdge));
  const winners = scored.filter((row) => row.houseEdge === minEdge);
  if (winners.length === 1 && winners[0].tier !== 'unfavorable') {
    const winner = winners[0];
    const current = result.get(winner.id);
    if (current) {
      result.set(winner.id, { ...current, isBest: true });
    }
  }

  return result;
}
