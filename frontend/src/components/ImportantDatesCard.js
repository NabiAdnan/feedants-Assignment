import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { formatDate } from '../utils/dateUtils';

function DateItem({ icon, label, iso }) {
  const { day, time } = formatDate(iso);

  return (
    <View style={styles.item}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{day}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
    </View>
  );
}

export default function ImportantDatesCard({ competition }) {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Important Dates</Text>

      <View style={styles.grid}>
        <DateItem
          icon="📅"
          label="Register Before"
          iso={competition.registrationCloseAt}
        />

        <DateItem
          icon="✈"
          label="Submission Starts"
          iso={competition.submissionStartAt}
        />

        <DateItem
          icon="↑"
          label="Submission Ends"
          iso={competition.submissionEndAt}
        />

        <DateItem
          icon="🏆"
          label="Result Date"
          iso={competition.resultDate}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },

  heading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#16212B',
    marginBottom: 14,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  item: {
    width: '50%',
    flexDirection: 'row',
    paddingVertical: 10,
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F5F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  icon: {
    fontSize: 16,
  },

  content: {
    flex: 1,
  },

  label: {
    fontSize: 10,
    color: '#8B96A1',
  },

  value: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16212B',
    marginTop: 2,
  },

  time: {
    fontSize: 10,
    color: '#687481',
    marginTop: 1,
  },
});