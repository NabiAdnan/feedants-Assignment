import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { colors, spacing, radius } from '../theme/colors';

export default function PrizeMoneyInfoCard({ videoUrl, refundPolicyUrl }) {
  const handleWatchVideo = () => {
    if (videoUrl) {
      Linking.openURL(videoUrl).catch(() => {});
    }
  };

  const handleRefundPolicy = () => {
    if (refundPolicyUrl) {
      Linking.openURL(refundPolicyUrl).catch(() => {});
    }
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.leftSection} onPress={handleWatchVideo}>
        <View style={styles.playCircle}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
        <View style={styles.leftTextWrap}>
          <Text style={styles.title}>How will you receive prize money?</Text>
          <Text style={styles.subtitle}>Watch video to know more</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.infoRow} onPress={handleRefundPolicy}>
          <Text style={styles.shieldIcon}>🛡️</Text>
          <Text style={styles.infoText}>Refund policy</Text>
        </TouchableOpacity>

        <View style={styles.infoRow}>
          <Text style={styles.shieldIcon}>🛡️</Text>
          <Text style={styles.infoText}>
            Secure payments powered by <Text style={styles.razorpayText}>Razorpay</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.sm,
  },
  playCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  playIcon: {
    color: colors.primary,
    fontSize: 14,
    marginLeft: 2,
  },
  leftTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 16,
  },
  subtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  rightSection: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: spacing.xs,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shieldIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  infoText: {
    fontSize: 10,
    color: colors.textPrimary,
    fontWeight: '600',
    flexShrink: 1,
  },
  razorpayText: {
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#0C2340',
  },
});
