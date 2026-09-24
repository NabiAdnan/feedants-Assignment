import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { getAssetUrl } from '../api/client';

export default function JudgeCard({ judge, onPlayIntro }) {
  const [imageError, setImageError] = useState(false);

  if (!judge) return null;

  return (
    <View style={styles.card}>
      {!imageError && judge.photoUrl ? (
        <Image
  source={{ uri: getAssetUrl(judge.photoUrl) }}
  style={styles.avatar}
  onError={() => setImageError(true)}
/>
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.initial}>M</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.label}>
          {judge.title || 'Judge'}
        </Text>

        <Text style={styles.name}>
          {judge.name}
        </Text>

        <Text style={styles.sub}>
          {judge.professional || 'Professional Dancer'}
        </Text>

        <Text style={styles.sub}>
          {judge.experienceLabel}
        </Text>
      </View>

      {judge.introVideoUrl && (
        <TouchableOpacity
          style={styles.playContainer}
          onPress={() => onPlayIntro?.(judge.introVideoUrl)}
        >
          <View style={styles.playButton}>
            <Text style={styles.play}>▶</Text>
          </View>

          <Text style={styles.playLabel}>
            Intro Video
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },

  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E3F5F1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  initial: {
    fontSize: 25,
    fontWeight: '800',
    color: '#0E7C7B',
  },

  info: {
    flex: 1,
    marginLeft: 14,
  },

  label: {
    fontSize: 11,
    color: '#8B96A1',
  },

  name: {
    fontSize: 17,
    fontWeight: '800',
    color: '#16212B',
    marginVertical: 2,
  },

  sub: {
    fontSize: 12,
    color: '#687481',
    marginTop: 1,
  },

  playContainer: {
    alignItems: 'center',
    width: 64,
  },

  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F5F1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  play: {
    color: '#0E7C7B',
    fontSize: 16,
    marginLeft: 2,
  },

  playLabel: {
    fontSize: 10,
    color: '#687481',
    marginTop: 5,
  },
});