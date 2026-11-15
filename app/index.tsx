import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuroraBackground } from '../components/AuroraBackground';
import { CapsuleButton, PullToRefresh } from '../components/CapsuleRefresh';
import { MedicineCard } from '../components/MedicineCard';
import { TabBar } from '../components/TabBar';
import { GlassCard, GhostButton, PrimaryButton, SectionHeader, SpringPress } from '../components/ui';
import { SAMPLE_LABELS } from '../lib/medicines';
import { CATEGORY_LABELS, HERO_PHOTO, PHOTOS } from '../lib/photos';
import { useApp } from '../lib/store';
import { palette, radii, spacing, type, useResponsive } from '../lib/theme';
import type { MedicineCategory } from '../lib/types';

/** One-tap sample label per medicine form, for the category tiles. */
const CATEGORY_SAMPLES: { key: MedicineCategory; label: string }[] = [
  {
    key: 'tablets',
    label:
      'Amoxicillin 500 mg capsules. Take one capsule three times daily. Complete the course. Store below 25°C.',
  },
  {
    key: 'liquid',
    label:
      'Paracetamol 120 mg/5 ml syrup. Take 5 ml every 4–6 hours as needed. Do not exceed 4 doses in 24 hours.',
  },
  {
    key: 'cream',
    label:
      'Hydrocortisone 1% cream. Apply a thin layer to the affected skin twice daily. For external use only.',
  },
  {
    key: 'inhaler',
    label:
      'Salbutamol 100 micrograms inhaler. Take 1–2 puffs as needed for wheezing or shortness of breath. Shake well before use.',
  },
  {
    key: 'vitamins',
    label: 'Vitamin D3 1000 IU tablets. Take 1 tablet once daily with food.',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const {
    labelText,
    setLabelText,
    explain,
    refreshCurrent,
    current,
    loading,
    error,
    history,
    applyHistory,
    todaysReminders,
    saved,
    isSaved,
    toggleSaved,
    user,
    guest,
  } = useApp();
  const r = useResponsive();
  const inputRef = useRef<{ focus: () => void } | null>(null);
  const autoNav = useRef(false);
  const [refreshing, setRefreshing] = useState(false);

  // After an explain finishes, move to the result screen — visible
  // feedback where the user is looking, not a silent state change.
  useEffect(() => {
    if (current && autoNav.current) {
      autoNav.current = false;
      router.push('/explain');
    }
  }, [current, router]);

  const doExplain = async (label?: string) => {
    autoNav.current = true;
    await explain(label);
    autoNav.current = false;
  };

  const onRefresh = async () => {
    if (!current) return;
    setRefreshing(true);
    await refreshCurrent();
    setRefreshing(false);
  };

  const openHistory = async (entryId: string) => {
    const entry = history.find((h) => h.id === entryId);
    if (!entry) return;
    autoNav.current = true;
    await applyHistory(entry);
    autoNav.current = false;
  };

  const heroHeight = Math.round(Math.min(360, Math.max(260, r.width * 0.62)));

  return (
    <View style={styles.root}>
      <AuroraBackground />
      <PullToRefresh refreshing={refreshing || loading} onRefresh={onRefresh}>
        <View style={[styles.shell, { maxWidth: r.contentMaxWidth, paddingHorizontal: r.pad }]}>
          {/* Hero — ~40% of the first viewport, frosted panel + CTA on it. */}
          <Animated.View entering={FadeInDown.springify()}>
            <View style={[styles.heroWrap, { height: heroHeight }]}>
              <Image source={HERO_PHOTO} style={styles.heroImage} resizeMode="cover" />
              <View style={styles.heroPanel}>
                <View style={styles.heroGlass}>
                  <Text style={styles.heroKicker}>
                    {user ? `HELLO, ${user.name ?? 'THERE'}` : guest ? 'HELLO, GUEST' : 'MEDIGUIDE'}
                  </Text>
                  <Text style={[styles.heroTitle, r.display]}>Know your medicine.</Text>
                  <View style={styles.heroCta}>
                    <PrimaryButton
                      label="Explain a label"
                      onPress={() => inputRef.current?.focus()}
                    />
                  </View>
                </View>
              </View>
              {Platform.OS === 'web' ? (
                <View style={styles.webRefresh}>
                  <SpringPress
                    onPress={() => void onRefresh()}
                    haptic
                    style={styles.webRefreshPress}
                  >
                    <CapsuleButton refreshing={refreshing || loading} />
                  </SpringPress>
                </View>
              ) : null}
            </View>
          </Animated.View>

          {/* Label input pill. */}
          <Animated.View entering={FadeInDown.delay(80).springify()}>
            <GlassCard style={styles.inputCard}>
              <Text style={styles.inputLabel}>PASTE A MEDICINE LABEL</Text>
              <TextInput
                ref={(el) => {
                  inputRef.current = el as unknown as { focus: () => void } | null;
                }}
                style={styles.input}
                value={labelText}
                onChangeText={setLabelText}
                placeholder="e.g. Amoxicillin 500 mg — take one capsule three times daily…"
                placeholderTextColor={palette.muted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <PrimaryButton
                label="Explain in plain words"
                onPress={() => void doExplain()}
                loading={loading}
                disabled={!labelText.trim()}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Text style={styles.samplesTitle}>Try a sample label:</Text>
              <View style={styles.samples}>
                {SAMPLE_LABELS.map((s) => (
                  <SpringPress
                    key={s.title}
                    onPress={() => {
                      setLabelText(s.label);
                      void doExplain(s.label);
                    }}
                    style={styles.samplePress}
                  >
                    <View style={styles.sampleChip}>
                      <Text style={styles.sampleChipText}>{s.title}</Text>
                    </View>
                  </SpringPress>
                ))}
              </View>
            </GlassCard>
          </Animated.View>

          {/* Category photo tiles. */}
          <Animated.View entering={FadeInDown.delay(140).springify()}>
            <SectionHeader kicker="Browse by form" title="Common medicines" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tiles}>
              {CATEGORY_SAMPLES.map((c) => (
                <SpringPress
                  key={c.key}
                  onPress={() => {
                    setLabelText(c.label);
                    void doExplain(c.label);
                  }}
                >
                  <View style={styles.tile}>
                    <Image source={PHOTOS[c.key]} style={styles.tilePhoto} resizeMode="cover" />
                    <Text style={styles.tileLabel}>{CATEGORY_LABELS[c.key]}</Text>
                  </View>
                </SpringPress>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Today's reminders. */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <SectionHeader kicker="Today" title="Your reminders" />
            {todaysReminders.length === 0 ? (
              <GlassCard style={styles.reminderEmpty}>
                <Text style={styles.reminderEmptyText}>
                  No reminders yet. Explain a label and save it to your cabinet to build your
                  schedule.
                </Text>
                <GhostButton label="Open reminders" onPress={() => router.push('/reminders')} />
              </GlassCard>
            ) : (
              todaysReminders.slice(0, 3).map((t) => (
                <SpringPress key={`${t.savedId}-${t.reminder.id}`} onPress={() => router.push('/reminders')}>
                  <GlassCard style={styles.reminderRow}>
                    <Text style={styles.reminderTime}>{t.reminder.time}</Text>
                    <View style={styles.reminderBody}>
                      <Text style={styles.reminderName}>{t.medicine}</Text>
                      <Text style={styles.reminderDose}>{t.reminder.dose}</Text>
                    </View>
                    <Text style={styles.reminderArrow}>›</Text>
                  </GlassCard>
                </SpringPress>
              ))
            )}
          </Animated.View>

          {/* Recent explanations — one tap re-opens from History. */}
          {history.length > 0 ? (
            <Animated.View entering={FadeInDown.delay(260).springify()}>
              <SectionHeader kicker="History" title="Explained recently" />
              {history.slice(0, 4).map((h) => (
                <SpringPress key={h.id} onPress={() => void openHistory(h.id)}>
                  <GlassCard style={styles.historyRow}>
                    <Text style={styles.historyName}>{h.medicineName}</Text>
                    <Text style={styles.historyTime}>
                      {new Date(h.at).toLocaleDateString()} · tap to re-open
                    </Text>
                  </GlassCard>
                </SpringPress>
              ))}
            </Animated.View>
          ) : null}

          {/* Saved cabinet preview. */}
          {saved.length > 0 ? (
            <Animated.View entering={FadeInDown.delay(320).springify()}>
              <SectionHeader kicker="Your cabinet" title="Saved medicines" />
              {saved.slice(0, 2).map((s, i) => (
                <MedicineCard
                  key={s.explanation.id}
                  explanation={s.explanation}
                  timesPerDay={s.reminders.filter((x) => x.enabled).length}
                  index={i}
                  saved={isSaved(s.explanation.id)}
                  onToggleSaved={() => toggleSaved(s.explanation)}
                />
              ))}
              <GhostButton label="Open full cabinet" onPress={() => router.push('/cabinet')} />
            </Animated.View>
          ) : null}
        </View>
      </PullToRefresh>
      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  shell: { alignSelf: 'center', paddingTop: 16, width: '100%' },
  heroWrap: {
    borderRadius: radii.card,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: { height: '100%', width: '100%' },
  heroPanel: {
    bottom: 16,
    left: 16,
    position: 'absolute',
    right: 16,
  },
  heroGlass: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: radii.card,
    borderWidth: 1,
    padding: spacing.md,
  },
  heroKicker: { ...type.label, color: palette.primary, marginBottom: 4 },
  heroTitle: { color: palette.ink },
  heroCta: { marginTop: 12 },
  webRefresh: { position: 'absolute', right: 12, top: 12 },
  webRefreshPress: { alignItems: 'center' },
  inputCard: { marginBottom: spacing.xl, padding: spacing.md },
  inputLabel: { ...type.label, color: palette.primary, marginBottom: 8 },
  input: {
    backgroundColor: palette.primaryPale,
    borderRadius: radii.input,
    color: palette.ink,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
    minHeight: 96,
    padding: 16,
  },
  error: { ...type.bodyStrong, color: palette.error, marginTop: 12, textAlign: 'center' },
  samplesTitle: { ...type.caption, color: palette.muted, marginBottom: 8, marginTop: 16 },
  samples: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  samplePress: {},
  sampleChip: {
    backgroundColor: palette.primarySoft,
    borderRadius: radii.pill,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sampleChipText: { color: palette.primary, fontSize: 14, fontWeight: '700' },
  tiles: { gap: 12, paddingBottom: 4 },
  tile: { width: 148 },
  tilePhoto: {
    borderTopLeftRadius: 74,
    borderTopRightRadius: 74,
    borderBottomLeftRadius: radii.card,
    borderBottomRightRadius: radii.card,
    height: 168,
    width: 148,
  },
  tileLabel: { ...type.subtitle, color: palette.ink, marginTop: 8, textAlign: 'center' },
  reminderEmpty: { alignItems: 'center', gap: 12, padding: spacing.md },
  reminderEmptyText: { ...type.body, color: palette.body, textAlign: 'center' },
  reminderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  reminderTime: { ...type.display, color: palette.primary, fontSize: 28, lineHeight: 32 },
  reminderBody: { flex: 1 },
  reminderName: { ...type.bodyStrong, color: palette.ink },
  reminderDose: { ...type.body, color: palette.body },
  reminderArrow: { color: palette.muted, fontSize: 24 },
  historyRow: { marginBottom: spacing.sm, padding: spacing.md },
  historyName: { ...type.bodyStrong, color: palette.ink },
  historyTime: { ...type.caption, color: palette.muted, marginTop: 2 },
});
