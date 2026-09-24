import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme/colors';

const MEDAL = ['\uD83E\uDD47', '\uD83E\uDD48', '\uD83E\uDD49'];

export default function RewardsCard({ rewards, disclaimer }) {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Rewards <Text style={styles.sub}>(All Positions)</Text></Text>
      {rewards?.map((r, i) => (
        <View key={r.position} style={styles.row}>
          <Text style={styles.medal}>{MEDAL[i] || '\u2B50'}</Text>
          <Text style={styles.label}>{r.label}</Text>
          <Text style={styles.amount}>₹ {r.amount}</Text>
        </View>
      ))}
      {disclaimer ? (
        <View style={styles.disclaimerRow}>
          <Text style={styles.disclaimerIcon}>{'\u2139'}</Text>
          <Text style={styles.disclaimerText}>{disclaimer}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card, marginHorizontal: spacing.lg, marginTop: spacing.md,
    borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  heading: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  sub: { fontSize: 12, color: colors.textMuted, fontWeight: '400' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  medal: { fontSize: 16, width: 28 },
  label: { flex: 1, fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
  amount: { fontSize: 13, color: colors.primary, fontWeight: '700' },
  disclaimerRow: {
    flexDirection: 'row', backgroundColor: colors.mint, borderRadius: radius.sm,
    padding: spacing.sm, marginTop: spacing.sm, alignItems: 'flex-start',
  },
  disclaimerIcon: { marginRight: spacing.xs },
  disclaimerText: { flex: 1, fontSize: 11, color: colors.textSecondary },
});
