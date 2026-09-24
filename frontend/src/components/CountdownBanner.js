import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme/colors';
import { getCountdownParts } from '../utils/dateUtils';

/**
 * Renders the "Registration closes in 01d:06h:28m:32s" style banner.
 * `serverNowOffsetMs` is (serverTime - deviceTime) captured once on load,
 * so the ticking countdown stays accurate even if the device clock is
 * wrong, without polling the server every second.
 */
export default function CountdownBanner({ countdownTarget, serverNowOffsetMs, onExpire }) {
  const [, forceTick] = useState(0);
  const expiredFired = useRef(false);

  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (!countdownTarget) return null;

  const nowMs = Date.now() + serverNowOffsetMs;
  const parts = getCountdownParts(countdownTarget.target, nowMs);

  if (parts.isExpired && !expiredFired.current) {
    expiredFired.current = true;
    onExpire?.();
  }

  return (
    <View style={styles.banner}>
      <Text style={styles.icon}>{'\u23F3'}</Text>
      <Text style={styles.label}>{countdownTarget.label}</Text>
      <Text style={styles.value}>{parts.label}</Text>
      <Text style={styles.hurry}>{'\u23F1'} Hurry up!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mint,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    flexWrap: 'wrap',
  },
  icon: { marginRight: spacing.xs },
  label: { fontSize: 13, color: colors.textSecondary, marginRight: spacing.sm },
  value: { fontSize: 14, fontWeight: '700', color: colors.primary, flex: 1 },
  hurry: { fontSize: 12, color: colors.primary, fontWeight: '600' },
});
