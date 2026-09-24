import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, radius } from '../theme/colors';

export default function ReferralCard({ referralLink, earnAmount }) {
  if (!referralLink) return null;

  const copy = async () => {
    await Clipboard.setStringAsync(referralLink);
    Alert.alert('Copied', 'Referral link copied to clipboard');
  };

  return (
    <View style={styles.card}>
      <Text style={styles.icon}>{'\uD83D\uDCE3'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Refer & Earn more discount</Text>
        <View style={styles.linkRow}>
          <Text style={styles.link} numberOfLines={1}>{referralLink}</Text>
          <TouchableOpacity onPress={copy} style={styles.copyBtn}>
            <Text style={styles.copyText}>Copy Link</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <TouchableOpacity style={styles.referBtn}>
          <Text style={styles.referText}>Refer Now</Text>
        </TouchableOpacity>
        <Text style={styles.earnText}>You earn ₹{earnAmount} for every signup</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.mint, marginHorizontal: spacing.lg, marginTop: spacing.md,
    borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
  },
  icon: { fontSize: 20, marginRight: spacing.sm },
  title: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  linkRow: { flexDirection: 'row', alignItems: 'center' },
  link: { flex: 1, fontSize: 11, color: colors.textSecondary },
  copyBtn: { borderWidth: 1, borderColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4, marginLeft: spacing.sm },
  copyText: { fontSize: 10, color: colors.primary, fontWeight: '700' },
  referBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 8 },
  referText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  earnText: { fontSize: 10, color: colors.textSecondary, marginTop: 4, textAlign: 'right', maxWidth: 140 },
});
