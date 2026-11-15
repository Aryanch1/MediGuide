import React from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { DISCLAIMER } from '../lib/medicines';
import { getMedicinePhoto } from '../lib/photos';
import { palette, radii, spacing, type } from '../lib/theme';
import type { Explanation, Reminder } from '../lib/types';
import { Chip, GlassCard, IconButton, PrimaryButton, SectionHeader, SpringPress } from './ui';

/**
 * Explanation detail — the rounded-top sheet overlapping a full photo
 * hero. Carries the disclaimer on every explanation, the plain-language
 * sections, and the editable reminder schedule. The key figure (times
 * per day) rides inside the primary CTA pill.
 */
export function ExplanationDetail({
  explanation,
  reminders,
  liveFailed,
  saved,
  onToggleSaved,
  onSave,
  savedFeedback,
  onReminderChange,
  onAddReminder,
  onRemoveReminder,
}: {
  explanation: Explanation;
  reminders: Reminder[];
  liveFailed?: boolean;
  saved: boolean;
  onToggleSaved?: () => void;
  onSave?: () => void;
  /** Shown where the user is looking right after a save. */
  savedFeedback?: string | null;
  onReminderChange?: (id: string, patch: Partial<Reminder>) => void;
  onAddReminder?: () => void;
  onRemoveReminder?: (id: string) => void;
}) {
  const photo = getMedicinePhoto(explanation);
  const enabledCount = reminders.filter((r) => r.enabled).length;
  return (
    <View>
      {/* Full photo hero; the sheet overlaps it below. */}
      <Image source={photo} style={styles.hero} resizeMode="cover" />
      <View style={styles.sheet}>
        <GlassCard style={styles.sheetCard}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{explanation.medicineName}</Text>
            {onToggleSaved ? (
              <SpringPress onPress={onToggleSaved} haptic>
                <View style={[styles.heart, saved && styles.heartSaved]}>
                  <Text style={[styles.heartText, saved && styles.heartTextSaved]}>
                    {saved ? '♥ Saved' : '♡ Save'}
                  </Text>
                </View>
              </SpringPress>
            ) : null}
          </View>
          <View style={styles.pills}>
            <View style={styles.sourcePill}>
              <Text style={styles.sourceText}>
                {explanation.source === 'live' ? 'LIVE AI' : 'DEMO EXPLANATION'}
              </Text>
            </View>
            {liveFailed ? (
              <View style={styles.warnPill}>
                <Text style={styles.warnPillText}>Live AI unreachable — showing demo</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>⚠ {DISCLAIMER}</Text>
          </View>

          <SectionHeader kicker="What it's for" title="In plain words" />
          <Text style={styles.bodyText}>{explanation.purpose}</Text>

          <SectionHeader kicker="How to take it" title="Taking it" />
          <Text style={styles.bodyText}>{explanation.howToTake}</Text>

          <SectionHeader kicker="Be careful" title="Key warnings" />
          {explanation.warnings.map((w, i) => (
            <Animated.View key={`${i}-${w.slice(0, 12)}`} entering={FadeInDown.delay(i * 60).springify()}>
              <View style={styles.warningRow}>
                <View style={styles.warningDot}>
                  <Text style={styles.warningDotText}>!</Text>
                </View>
                <Text style={styles.warningText}>{w}</Text>
              </View>
            </Animated.View>
          ))}

          <SectionHeader kicker="Reminder schedule" title="When to take it" />
          {reminders.length === 0 ? (
            <Text style={styles.bodyText}>No reminders yet — add one below.</Text>
          ) : (
            reminders.map((r, i) => (
              <Animated.View key={r.id} entering={FadeInDown.delay(i * 50).springify()}>
                <View style={styles.reminderRow}>
                  <TextInput
                    style={styles.timeInput}
                    value={r.time}
                    onChangeText={(v) =>
                      onReminderChange?.(r.id, { time: v.replace(/[^0-9:]/g, '').slice(0, 5) })
                    }
                    placeholder="08:00"
                    placeholderTextColor={palette.muted}
                    maxLength={5}
                  />
                  <TextInput
                    style={styles.doseInput}
                    value={r.dose}
                    onChangeText={(v) => onReminderChange?.(r.id, { dose: v })}
                    placeholder="Dose"
                    placeholderTextColor={palette.muted}
                  />
                  <Chip
                    label={r.enabled ? 'On' : 'Off'}
                    selected={r.enabled}
                    onPress={() => onReminderChange?.(r.id, { enabled: !r.enabled })}
                  />
                  {onRemoveReminder ? (
                    <IconButton label="×" onPress={() => onRemoveReminder(r.id)} />
                  ) : null}
                </View>
              </Animated.View>
            ))
          )}
          {onAddReminder ? (
            <View style={styles.addRow}>
              <Chip label="+ Add a time" selected={false} onPress={onAddReminder} />
            </View>
          ) : null}

          {onSave ? (
            <View style={styles.saveRow}>
              <PrimaryButton
                label="Save to cabinet"
                sub={`${enabledCount}× a day`}
                onPress={onSave}
              />
              {savedFeedback ? <Text style={styles.savedFeedback}>{savedFeedback}</Text> : null}
            </View>
          ) : null}
        </GlassCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 300, width: '100%' },
  sheet: { marginTop: -48, paddingHorizontal: 20 },
  sheetCard: { borderTopLeftRadius: radii.sheet, borderTopRightRadius: radii.sheet },
  titleRow: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  name: { ...type.title, color: palette.ink, flex: 1, marginRight: 12 },
  heart: {
    alignItems: 'center',
    backgroundColor: palette.glassStrong,
    borderColor: palette.line,
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 14,
  },
  heartSaved: { backgroundColor: palette.primary, borderColor: palette.primary },
  heartText: { color: palette.primary, fontSize: 14, fontWeight: '800' },
  heartTextSaved: { color: '#FFFFFF' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  sourcePill: {
    backgroundColor: palette.primarySoft,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  sourceText: { color: palette.primary, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  warnPill: {
    backgroundColor: palette.warningSoft,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  warnPillText: { color: palette.warning, fontSize: 11, fontWeight: '800' },
  disclaimer: {
    backgroundColor: palette.warningSoft,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  disclaimerText: { ...type.bodyStrong, color: palette.warning },
  bodyText: { ...type.body, color: palette.body, marginBottom: spacing.lg },
  warningRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 10, marginBottom: 10 },
  warningDot: {
    alignItems: 'center',
    backgroundColor: palette.warningSoft,
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  warningDotText: { color: palette.warning, fontSize: 15, fontWeight: '800' },
  warningText: { ...type.body, color: palette.body, flex: 1 },
  reminderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  timeInput: {
    backgroundColor: palette.primaryPale,
    borderRadius: radii.input,
    color: palette.ink,
    fontSize: 20,
    fontWeight: '800',
    minHeight: 52,
    paddingHorizontal: 14,
    textAlign: 'center',
    width: 96,
  },
  doseInput: {
    backgroundColor: palette.primaryPale,
    borderRadius: radii.input,
    color: palette.ink,
    flex: 1,
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  addRow: { marginTop: 4 },
  saveRow: { marginTop: spacing.lg },
  savedFeedback: {
    ...type.bodyStrong,
    color: palette.success,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
