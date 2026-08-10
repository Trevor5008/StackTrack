import { ActivityIndicator, Text, View } from 'react-native';

import { SessionTableCard } from '@/src/components/SessionTableCard';
import { rankTables } from '@/src/lib/tableRanking';
import { colors } from '@/src/theme';
import { SessionTable } from '@/src/types/liveSession';

import { styles } from './SessionTablesList.styles';

type SessionTablesListProps = {
  currency: string;
  loading: boolean;
  tables: SessionTable[];
  cashOut: number;
  title?: string;
};

export function SessionTablesList({
  currency,
  loading,
  tables,
  cashOut,
  title = 'Tables',
}: SessionTablesListProps) {
  const ranks = rankTables(tables);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : tables.length === 0 ? (
        <Text style={styles.empty}>
          No per-table breakdown for this session.
        </Text>
      ) : (
        <View style={styles.list}>
          {tables.map((table) => (
            <SessionTableCard
              key={table.id}
              mode="summary"
              table={table}
              currency={currency}
              rank={ranks.get(table.id)}
              remainingBudget={cashOut}
            />
          ))}
        </View>
      )}
    </View>
  );
}
