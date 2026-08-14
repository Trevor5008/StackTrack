import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { RankBadge } from '@/src/components/RankBadge';
import { TextField } from '@/src/components/TextField';
import { formatCurrency, formatTableCardTitle } from '@/src/lib/format';
import { formatHouseEdge } from '@/src/lib/houseEdge';
import { computeElapsedMs, formatElapsed } from '@/src/lib/liveTimer';
import {
  estimateBasicStrategyRoR,
  formatRoR,
  isTableViable,
} from '@/src/lib/riskOfRuin';
import {
  formatTableRulesSummary,
  parseTableRules,
} from '@/src/lib/tableRules';
import { TableRankInfo } from '@/src/lib/tableRanking';
import { colors } from '@/src/theme';
import { ActiveTable, SessionTable } from '@/src/types/liveSession';

import { styles } from './SessionTableCard.styles';

type LiveSessionTableCardProps = {
  mode: 'live';
  table: ActiveTable;
  currency: string;
  rank?: TableRankInfo;
  sessionBankroll: number;
  riskTolerance: number;
  onPlay: () => void;
  onPause: () => void;
  onChangeName: (name: string) => void;
  onOpenRules: () => void;
  onDelete: () => void;
};

type SummarySessionTableCardProps = {
  mode: 'summary';
  table: SessionTable;
  currency: string;
  rank?: TableRankInfo;
  /** Session chips still yours (cash-out after end; budget + nets while live). */
  sessionBankroll: number;
};

export type SessionTableCardProps =
  | LiveSessionTableCardProps
  | SummarySessionTableCardProps;

export function SessionTableCard(props: SessionTableCardProps) {
  if (props.mode === 'summary') {
    return <SummaryTableCard {...props} />;
  }
  return <LiveTableCard {...props} />;
}

function SummaryTableCard({
  table,
  currency,
  rank,
  sessionBankroll,
}: SummarySessionTableCardProps) {
  const rules = parseTableRules(table.rulesJson);
  const { title, subtitle } = formatTableCardTitle(
    rules,
    currency,
    table.name,
  );
  const ror = estimateBasicStrategyRoR({
    sessionBankroll,
    bettingUnit: table.bettingUnit,
    rules,
  });

  return (
    <View style={[styles.card, rank?.isBest && styles.cardBest]}>
      <View style={styles.row}>
        <RankBadge
          houseEdge={rank?.houseEdge}
          tier={rank?.tier}
          isBest={rank?.isBest}
        />
        <View style={styles.main}>
          <Text style={styles.name}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {rank?.isBest ? (
            <Text style={styles.bestRules}>Best rules</Text>
          ) : null}
          {table.elapsedMs > 0 ? (
            <Text style={styles.meta}>{formatElapsed(table.elapsedMs)}</Text>
          ) : null}
          {ror ? (
            <Text style={styles.meta}>
              Unit {formatCurrency(table.bettingUnit ?? 0, currency)} · RoR{' '}
              {formatRoR(ror.rorPct)}
            </Text>
          ) : (
            <Text style={styles.meta}>RoR unknown</Text>
          )}
          <Text style={styles.meta}>
            {rules
              ? `${formatTableRulesSummary(rules)}${
                  rank?.houseEdge != null
                    ? ` · ${formatHouseEdge(rank.houseEdge)} HE`
                    : ''
                }`
              : 'No rules set'}
          </Text>
        </View>
        <Text
          style={[
            styles.pnl,
            {
              color:
                table.netResult >= 0 ? colors.positive : colors.negative,
            },
          ]}
        >
          {formatCurrency(table.netResult, currency, true)}
        </Text>
      </View>
    </View>
  );
}

// Live table card component w/ crud
// Create and delete actions are only available for paused tables
// Create action is to set table rules
// Delete action is to delete the table
// Edit action is to edit the table rules
// Play action is to play the table
// Pause action is to pause the table
function LiveTableCard({
  table,
  currency,
  rank,
  sessionBankroll,
  riskTolerance,
  onPlay,
  onPause,
  onChangeName,
  onOpenRules,
  onDelete,
}: LiveSessionTableCardProps) {
  const [expanded, setExpanded] = useState(false);
  const rules = parseTableRules(table.rulesJson);
  const { title, subtitle } = formatTableCardTitle(
    rules,
    currency,
    table.name,
  );
  const tableElapsed = computeElapsedMs({
    accumulatedMs: table.accumulatedMs,
    isPaused: table.isPaused,
    segmentStartedAt: table.segmentStartedAt,
  });
  // Estimate the basic strategy RoR
  const ror = estimateBasicStrategyRoR({
    sessionBankroll,
    bettingUnit: table.bettingUnit,
    rules,
  });
  // Check if the table is viable
  const viable =
    ror != null ? isTableViable(ror.rorPct, riskTolerance) : null;

  // Return/render the live table card component
  return (
    <View style={[styles.card, rank?.isBest && styles.cardBest]}>
      <Pressable
        onPress={() => setExpanded((current) => !current)}
        style={styles.row}
      >
        <RankBadge
          houseEdge={rank?.houseEdge}
          tier={rank?.tier}
          isBest={rank?.isBest}
        />
        <View style={styles.main}>
          <Text style={styles.name}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {rank?.isBest ? (
            <Text style={styles.bestRules}>Best rules</Text>
          ) : null}
          <Text style={styles.meta}>
            {formatElapsed(tableElapsed)}
            {table.isPaused ? ' · Paused' : ' · Playing'}
            {!table.isPaused && table.stake > 0
              ? ` · Stake ${formatCurrency(table.stake, currency)}`
              : ''}
          </Text>
          <Text
            style={[
              styles.pnlInline,
              {
                color:
                  table.netResult >= 0 ? colors.positive : colors.negative,
              },
            ]}
          >
            {formatCurrency(table.netResult, currency, true)}
          </Text>
          {/* Display the RoR if it is available and viable */}
          {ror ? (
            <Text
              style={[
                styles.rorLine,
                {
                  color: viable ? colors.positive : colors.negative,
                },
              ]}
            >
              RoR {formatRoR(ror.rorPct)}
              {viable ? ' · Viable' : ' · Not viable'}
            </Text>
          ) : (
            // Display RoR unknown if it is not available
            <Text style={styles.rorUnknown}>RoR unknown</Text>
          )}
        </View>
        <Text style={styles.chevron}>{expanded ? '▾' : '▸'}</Text>
      </Pressable>

      <View style={styles.actions}>
        {table.isPaused ? (
          <Pressable
            onPress={onPlay}
            style={({ pressed }) => [
              styles.playButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.playButtonText}>Play</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={onPause}
            style={({ pressed }) => [
              styles.pauseButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.pauseButtonText}>Pause</Text>
          </Pressable>
        )}
      </View>

      {expanded ? (
        <View style={styles.expanded}>
          <TextField
            label="Table name"
            value={table.name}
            onChangeText={onChangeName}
          />
          <Text style={styles.readOnly}>
            Table P/L: {formatCurrency(table.netResult, currency, true)}
          </Text>
          {/* Edit table rules button */}
          <Pressable
            onPress={onOpenRules}
            style={({ pressed }) => [
              styles.rulesButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.rulesButtonTitle}>
              {rules ? 'Edit table rules' : 'Set table rules'}
            </Text>
            {rules ? (
              <Text style={styles.rulesButtonSubtitle}>
                {formatTableRulesSummary(rules)}
              </Text>
            ) : null}
          </Pressable>
          {/* Delete table button (only paused tables can be deleted)*/}
          <Pressable
            onPress={onDelete}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.pressed,
            ]}
            disabled={!table.isPaused}
          >
            <Text style={styles.deleteButtonText}>Delete table</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
