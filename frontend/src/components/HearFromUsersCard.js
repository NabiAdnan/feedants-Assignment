import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors, spacing, radius } from '../theme/colors';

export default function HearFromUsersCard() {
  const onPress = () => {
    Alert.alert('Participant Reviews', 'Feedants users love classical dance competitions! Average rating 4.9/5 ⭐');
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.icon}>💬</Text>
      <View style={styles.content}>
        <Text style={styles.title}>Hear From Our Users</Text>
        <Text style={styles.subtitle}>See what participants say about Feedants</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  chevron: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});
