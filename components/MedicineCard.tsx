import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { getMedicinePhoto } from '../lib/photos';
import { palette, radii, spacing, type } from '../lib/theme';
import type { Explanation } from '../lib/types';
import { GlassCard, SpringPress } from './ui';

/**
 * Medicine card: arch-top photo tile, name, category chip, dose pill
 * and the daily-times figure riding inside the primary CTA pill.
 */
export function MedicineCard({
  explanation,
  timesPerDay,
  index = 0,
  saved,
  onToggleSaved,
}: {
  explanation: Explanation;
  timesPerDay: number;
  index?: number;
  saved: boolean;
  onToggleSaved?: () => void;
}) {
  const router = useRouter();
  const photo = getMedicinePhoto(explanation);
  return (
    <Animated.View entering={FadeInDown.delay(index * 70).springify()}>
      <SpringPress
        onPress={() => router.push(`/medicine/${encodeURIComponent(explanation.id)}` as never)}
      >
        <GlassCard flush style={styles.card}>
          <Image source={photo} style={styles.photo} resizeMode="cover" />
          <View style={styles.body}>
            <View style={styles.row}>
              <Text style={styles.name} numberOfLines={1}>
                {explanation.medicineName}
              </Text>
              {onToggleSaved ? (
                <SpringPress onPress={onToggleSaved} haptic>
                  <View style={[styles.heart, saved && styles.heartSaved]}>
                    <Text style={[styles.heartText, saved && styles.heartTextSaved]}>
                      {saved ? '♥' : '♡'}
                    </Text>
                  </View>
                </SpringPress>
              ) : null}
            </View>
            <Text style={styles.purpose} numberOfLines={2}>
              {explanation.purpose}
            </Text>
            <View style={styles.pills}>
              <View style={styles.dosePill}>
                <Text style={styles.doseText}>
                  {timesPerDay}× a day · {explanation.dose}
                </Text>
              </View>
              <View style={styles.sourcePill}>
                <Text style={styles.sourceText}>
                  {explanation.source === 'live' ? 'LIVE AI' : 'DEMO'}
                </Text>
              </View>
            </View>
          </View>
        </GlassCard>
      </SpringPress>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  photo: {
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    height: 168,
    width: '100%',
  },
  body: { padding: spacing.md },
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  name: { ...type.subtitle, color: palette.ink, flex: 1 },
  purpose: { ...type.body, color: palette.body, marginTop: 6 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  dosePill: {
    backgroundColor: palette.primary,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  doseText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  sourcePill: {
    backgroundColor: palette.primarySoft,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sourceText: { color: palette.primary, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  heart: {
    alignItems: 'center',
    backgroundColor: palette.glassStrong,
    borderColor: palette.line,
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  heartSaved: { backgroundColor: palette.primary, borderColor: palette.primary },
  heartText: { color: palette.primary, fontSize: 20 },
  heartTextSaved: { color: '#FFFFFF' },
});
