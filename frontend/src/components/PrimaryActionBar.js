import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme/colors';

/**
 * Bottom sticky CTA. `action` is the server-computed `viewState.primaryAction`
 * object ({ type, label, enabled }) - the button's text and whether it's
 * tappable is entirely driven by the backend's business rules, not
 * duplicated logic on the client.
 */
export default function PrimaryActionBar({ action, loading, onPress, isRegistered }) {
  if (!action) return null;

  const disabled = !action.enabled || loading;
  const showSubtext = isRegistered && (action.type === 'SUBMIT' || action.type === 'RESUBMIT');

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        style={[styles.btn, disabled && styles.btnDisabled]}
        disabled={disabled}
        onPress={onPress}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.contentWrap}>
            <Text style={styles.label}>{action.label}</Text>
            {showSubtext && <Text style={styles.subtext}>Registered</Text>}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnDisabled: { backgroundColor: colors.textMuted },
  contentWrap: { alignItems: 'center' },
  label: { color: '#fff', fontWeight: '800', fontSize: 15 },
  subtext: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600', marginTop: 1 },
});
