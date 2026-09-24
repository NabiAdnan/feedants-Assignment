import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme/colors';

export default function CompetitionSummaryCard({ competition, viewState }) {
  const spotsLeft = viewState.spotsLeft;
  const pct = Math.min(
    competition.bookedCount / competition.totalSpots,
    1
  );

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={2}>
          {competition.title}
        </Text>

        {viewState.isRegistered && (
          <View style={styles.registered}>
            <Text style={styles.check}>✓</Text>
            <Text style={styles.registeredText}>Registered</Text>
          </View>
        )}
      </View>

      <View style={styles.tagRow}>
        {competition.tags?.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}

        {competition.hasCertificate && (
          <View style={styles.certificate}>
            <Text style={styles.trophy}>🏆</Text>
            <Text style={styles.certificateText}>
              Winners get certificate
            </Text>
          </View>
        )}
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.label}>Prize Pool</Text>
          <Text style={styles.value}>
            ₹ {competition.prizePool.toLocaleString('en-IN')}
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.label}>Entry Fee</Text>
          <Text style={styles.value}>
            ₹ {competition.entryFee}
          </Text>
        </View>

        <View style={styles.spots}>
          <Text style={styles.label}>
            {spotsLeft > 0
              ? `Only ${spotsLeft} spots left`
              : 'Spots Full'}
          </Text>

          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                { width: `${pct * 100}%` },
              ]}
            />
          </View>

          <Text style={styles.booked}>
            {competition.bookedCount} / {competition.totalSpots} Booked
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  title: {
    flex: 1,
    fontSize: 21,
    fontWeight: '800',
    color: '#16212B',
    paddingRight: 10,
  },

  registered: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F5F1',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  check: {
    color: '#0E7C7B',
    fontWeight: '800',
    marginRight: 4,
  },

  registeredText: {
    color: '#0E7C7B',
    fontSize: 12,
    fontWeight: '700',
  },

  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 12,
  },

  tag: {
    backgroundColor: '#F3F5F7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 5,
  },

  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#687481',
  },

  certificate: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  trophy: {
    fontSize: 15,
    marginRight: 4,
  },

  certificateText: {
    color: '#0E7C7B',
    fontSize: 12,
    fontWeight: '600',
  },

  stats: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
  },

  stat: {
    marginRight: 28,
  },

  label: {
    fontSize: 12,
    color: '#7C8792',
    marginBottom: 4,
  },

  value: {
    fontSize: 21,
    fontWeight: '800',
    color: '#16212B',
  },

  spots: {
    flex: 1,
  },

  track: {
    height: 5,
    backgroundColor: '#DDE9E8',
    borderRadius: 10,
    marginTop: 5,
  },

  fill: {
    height: 5,
    backgroundColor: '#0E7C7B',
    borderRadius: 10,
  },

  booked: {
    fontSize: 10,
    color: '#9AA4AF',
    marginTop: 4,
  },
});