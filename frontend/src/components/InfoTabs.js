import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme/colors';

const TABS = [
  { key: 'about', label: 'About Competition' },
  { key: 'judging', label: 'Judging Parameters' },
  { key: 'rules', label: 'Rules & Eligibility' },
];

export default function InfoTabs({ competition }) {
  const [active, setActive] = useState('about');
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <TouchableOpacity key={t.key} onPress={() => setActive(t.key)} style={styles.tabBtn}>
            <Text style={[styles.tabLabel, active === t.key && styles.tabLabelActive]}>{t.label}</Text>
            {active === t.key && <View style={styles.underline} />}
          </TouchableOpacity>
        ))}
      </View>

      {active === 'about' && (
        <View>
          <Text style={styles.body} numberOfLines={expanded ? undefined : 3}>
            {expanded ? competition.aboutFull : competition.aboutShort}
          </Text>
          <TouchableOpacity onPress={() => setExpanded((v) => !v)}>
            <Text style={styles.viewMore}>{expanded ? 'View less' : 'View more'} {expanded ? '\u2303' : '\u2304'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {active === 'judging' && (
        <View>
          {competition.judgingParameters?.map((p, i) => (
            <View key={i} style={styles.paramRow}>
              <Text style={styles.paramTitle}>{p.criterion} <Text style={styles.weight}>({p.weightage}%)</Text></Text>
              <Text style={styles.paramDesc}>{p.description}</Text>
            </View>
          ))}
        </View>
      )}

      {active === 'rules' && (
        <View>
          {competition.rulesAndEligibility?.map((r, i) => (
            <Text key={i} style={styles.ruleItem}>{'\u2022'} {r}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card, marginHorizontal: spacing.lg, marginTop: spacing.md,
    borderRadius: 16, padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  tabRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  tabBtn: { alignItems: 'center', flex: 1 },
  tabLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600', textAlign: 'center' },
  tabLabelActive: { color: colors.primary },
  underline: { height: 2, width: '80%', backgroundColor: colors.primary, marginTop: 6, borderRadius: 1 },
  body: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  viewMore: { fontSize: 12, color: colors.primary, fontWeight: '700', marginTop: spacing.sm, textAlign: 'center' },
  paramRow: { marginBottom: spacing.sm },
  paramTitle: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  weight: { color: colors.textMuted, fontWeight: '400' },
  paramDesc: { fontSize: 12, color: colors.textSecondary },
  ruleItem: { fontSize: 12, color: colors.textSecondary, marginBottom: 6, lineHeight: 18 },
});
