import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme/colors';
import { getAssetUrl } from '../api/client';

export default function PreviousWinnersRow({ winners }) {
  if (!winners?.length) return null;
  return (
    <View style={{ marginTop: spacing.md }}>
      <Text style={styles.heading}>Previous Winners</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {winners.map((w, i) => (
          <View key={i} style={styles.item}>
            <Image
  source={{ uri: getAssetUrl(w.imageUrl) }}
  style={styles.photo}
/>
            <View style={styles.playBadge}>
              <Text style={styles.playIcon}>{'\u25B6'}</Text>
            </View>
            <Text style={styles.name} numberOfLines={1}>{w.name}</Text>
            <Text style={styles.position}>{w.position}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  row: { paddingHorizontal: spacing.lg, gap: spacing.md },
  item: { width: 100, marginRight: spacing.md },
  photo: { width: 100, height: 100, borderRadius: radius.md, backgroundColor: colors.border },
  playBadge: {
    position: 'absolute', bottom: 30, alignSelf: 'center',
    backgroundColor: colors.primary, width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  playIcon: { color: '#fff', fontSize: 10 },
  name: { fontSize: 12, fontWeight: '600', color: colors.textPrimary, marginTop: 4 },
  position: { fontSize: 11, color: colors.primary, fontWeight: '600' },
});
