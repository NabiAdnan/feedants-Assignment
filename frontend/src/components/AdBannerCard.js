import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme/colors';

export default function AdBannerCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>📢</Text>
      <Text style={styles.text}>Ad Here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
    borderColor: '#D8DEE4',
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 14,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7684',
  },
});
