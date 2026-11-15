import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuroraBackground } from '../components/AuroraBackground';
import { TabBar } from '../components/TabBar';
import { Chip, EmptyState, GhostButton, SectionHeader, GlassCard } from '../components/ui';
import { useApp } from '../lib/store';
import { palette, spacing, type, useResponsive } from '../lib/theme';

/** Reminders — today's schedule, soonest first, with on/off toggles. */
export default function RemindersScreen() {
  const router = useRouter();
  const { todaysReminders, updateSavedReminder, saved } = useApp();
  const r = useResponsive();

  return (
    <View style={styles.root}>
      <AuroraBackground />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { maxWidth: r.contentMaxWidth, alignSelf: 'center' }]}
      >
        <SectionHeader kicker="Every day" title="Your reminders" />
        {todaysReminders.length === 0 ? (
          <EmptyState
            glyph="⏰"
            title="No reminders yet"
            body="Save a medicine to your cabinet and its schedule appears here — one tap turns each reminder on or off."
            actionLabel="Open cabinet"
            onAction={() => router.replace('/cabinet')}
          />
        ) : (
          <>
            <Text style={styles.count}>
              {todaysReminders.length} dose{todaysReminders.length === 1 ? '' : 's'} today
            </Text>
            {todaysReminders.map((t, i) => (
              <Animated.View key={`${t.savedId}-${t.reminder.id}`} entering={FadeInDown.delay(i * 60).springify()}>
                <GlassCard style={styles.row}>
                  <Text style={styles.time}>{t.reminder.time}</Text>
                  <View style={styles.body}>
                    <Text style={styles.name}>{t.medicine}</Text>
                    <Text style={styles.dose}>
                      {t.reminder.dose}
                      {t.reminder.note ? ` · ${t.reminder.note}` : ''}
                    </Text>
                  </View>
                  <Chip
                    label={t.reminder.enabled ? 'On' : 'Off'}
                    selected={t.reminder.enabled}
                    onPress={() =>
                      updateSavedReminder(t.savedId, t.reminder.id, {
                        enabled: !t.reminder.enabled,
                      })
                    }
                  />
                </GlassCard>
              </Animated.View>
            ))}
            <Text style={styles.note}>
              Times are reminders to check your schedule, not alarms — keep your medicine box
              where you can see it.
            </Text>
          </>
        )}
        {saved.length > 0 ? (
          <View style={styles.addRow}>
            <GhostButton label="Manage in cabinet" onPress={() => router.push('/cabinet')} />
          </View>
        ) : null}
      </ScrollView>
      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 120, width: '100%' },
  count: { ...type.bodyStrong, color: palette.primary, marginBottom: spacing.md },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  time: { ...type.display, color: palette.primary, fontSize: 28, lineHeight: 32 },
  body: { flex: 1 },
  name: { ...type.bodyStrong, color: palette.ink },
  dose: { ...type.body, color: palette.body },
  note: { ...type.caption, color: palette.muted, marginTop: spacing.md, textAlign: 'center' },
  addRow: { marginTop: spacing.lg },
});
