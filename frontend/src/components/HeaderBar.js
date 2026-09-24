import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme/colors';

export default function HeaderBar({ onBack, language, onToggleLanguage, user, onAuthPress }) {
  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.backRow} onPress={onBack} hitSlop={10}>
        <Text style={styles.arrow}>{'\u2190'}</Text>
        <Text style={styles.backText}>Go back</Text>
      </TouchableOpacity>

      <View style={styles.rightGroup}>
        <TouchableOpacity style={styles.authPill} onPress={onAuthPress}>
          <Text style={styles.authText}>
            {user ? `👤 ${user.name.split(' ')[0]}` : 'Log In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.langPill} onPress={onToggleLanguage}>
          <Text style={[styles.langText, language === 'ENG' && styles.langActive]}>ENG</Text>
          <Text style={[styles.langText, language !== 'ENG' && styles.langActive]}> | हिंदी</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backRow: { flexDirection: 'row', alignItems: 'center' },
  arrow: { fontSize: 18, color: colors.textPrimary, marginRight: spacing.sm },
  backText: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  rightGroup: { flexDirection: 'row', alignItems: 'center' },
  authPill: {
    backgroundColor: '#F0F3F6',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginRight: spacing.xs + 2,
  },
  authText: { fontSize: 12, color: colors.primary, fontWeight: '700' },
  langPill: {
    flexDirection: 'row',
    backgroundColor: colors.mint,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  langText: { fontSize: 12, color: colors.textSecondary },
  langActive: { color: colors.primary, fontWeight: '700' },
});
