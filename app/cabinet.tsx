import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuroraBackground } from '../components/AuroraBackground';
import { ExplanationDetail } from '../components/ExplanationDetail';
import { MedicineCard } from '../components/MedicineCard';
import { TabBar } from '../components/TabBar';
import { EmptyState, GhostButton, GlassCard, SectionHeader, SpringPress } from '../components/ui';
import { useApp } from '../lib/store';
import { palette, spacing, type, useResponsive } from '../lib/theme';

/**
 * Medicine cabinet — saved explanations + History.
 * Wide screens (foldable unfolded / tablet / desktop) switch to a
 * two-pane split view: list on one side, detail on the other.
 */
export default function CabinetScreen() {
  const router = useRouter();
  const {
    saved,
    history,
    isSaved,
    toggleSaved,
    clearHistory,
    clearSaved,
    applyHistory,
    updateSavedReminder,
    addSavedReminder,
    removeSavedReminder,
    liveFailed,
  } = useApp();
  const r = useResponsive();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const selected = saved.find((s) => s.explanation.id === selectedId) ?? saved[0];

  const openHistory = async (entryId: string) => {
    const entry = history.find((h) => h.id === entryId);
    if (!entry) return;
    // Visible feedback where the user is looking while it re-opens.
    setOpeningId(entryId);
    await applyHistory(entry);
    setOpeningId(null);
    router.push('/explain');
  };

  const list = (
    <View>
      <SectionHeader kicker="Your cabinet" title="Saved medicines" />
      {saved.length === 0 ? (
        <EmptyState
          glyph="🗄️"
          title="Your cabinet is empty"
          body="Explain a medicine label and save it — it will live here with its reminder schedule."
          actionLabel="Explain a label"
          onAction={() => router.replace('/')}
        />
      ) : (
        saved.map((s, i) => (
          <View key={s.explanation.id}>
            <MedicineCard
              explanation={s.explanation}
              timesPerDay={s.reminders.filter((x) => x.enabled).length}
              index={i}
              saved={isSaved(s.explanation.id)}
              onToggleSaved={() => toggleSaved(s.explanation)}
            />
            {r.twoPane ? (
              <SpringPress onPress={() => setSelectedId(s.explanation.id)}>
                <View
                  style={[
                    styles.selectRow,
                    selected?.explanation.id === s.explanation.id && styles.selectRowActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.selectRowText,
                      selected?.explanation.id === s.explanation.id && styles.selectRowTextActive,
                    ]}
                  >
                    {selected?.explanation.id === s.explanation.id ? '● Showing here' : 'Show detail here'}
                  </Text>
                </View>
              </SpringPress>
            ) : null}
          </View>
        ))
      )}
      {saved.length > 0 ? (
        <View style={styles.clearRow}>
          <GhostButton label="Clear cabinet" onPress={clearSaved} />
        </View>
      ) : null}

      <SectionHeader kicker="History" title="Past explanations" />
      {history.length === 0 ? (
        <GlassCard style={styles.historyEmpty}>
          <Text style={styles.historyEmptyText}>Nothing explained yet.</Text>
        </GlassCard>
      ) : (
        history.map((h) => (
          <SpringPress key={h.id} onPress={() => void openHistory(h.id)}>
            <GlassCard style={styles.historyRow}>
              <Text style={styles.historyName}>{h.medicineName}</Text>
              <Text style={styles.historyTime}>
                {openingId === h.id
                  ? 'Opening…'
                  : `${new Date(h.at).toLocaleDateString()} · tap to re-open`}
              </Text>
            </GlassCard>
          </SpringPress>
        ))
      )}
      {history.length > 0 ? (
        <View style={styles.clearRow}>
          <GhostButton label="Clear history" onPress={clearHistory} />
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.root}>
      <AuroraBackground />
      {r.twoPane && selected ? (
        <View style={styles.twoPane}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.twoPaneList}
          >
            <Animated.View entering={FadeInDown.springify()}>{list}</Animated.View>
          </ScrollView>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.twoPaneDetail}>
            <ExplanationDetail
              explanation={selected.explanation}
              reminders={selected.reminders}
              liveFailed={liveFailed}
              saved
              onToggleSaved={() => toggleSaved(selected.explanation)}
              onReminderChange={(rid, patch) =>
                updateSavedReminder(selected.explanation.id, rid, patch)
              }
              onAddReminder={() => addSavedReminder(selected.explanation.id)}
              onRemoveReminder={(rid) => removeSavedReminder(selected.explanation.id, rid)}
            />
          </ScrollView>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { maxWidth: r.contentMaxWidth, alignSelf: 'center' }]}
        >
          {list}
        </ScrollView>
      )}
      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 120, width: '100%' },
  twoPane: { flex: 1, flexDirection: 'row', gap: 24, padding: 24, paddingBottom: 110 },
  twoPaneList: { flexGrow: 1, paddingBottom: 24, width: 380 },
  twoPaneDetail: { flexGrow: 1, paddingBottom: 24 },
  selectRow: {
    alignItems: 'center',
    backgroundColor: palette.glassStrong,
    borderRadius: 999,
    marginBottom: spacing.md,
    marginTop: -8,
    paddingVertical: 10,
  },
  selectRowActive: { backgroundColor: palette.primary },
  selectRowText: { color: palette.primary, fontSize: 13, fontWeight: '800' },
  selectRowTextActive: { color: '#FFFFFF' },
  clearRow: { alignItems: 'flex-start', marginBottom: spacing.xl },
  historyEmpty: { padding: spacing.md },
  historyEmptyText: { ...type.body, color: palette.body },
  historyRow: { marginBottom: spacing.sm, padding: spacing.md },
  historyName: { ...type.bodyStrong, color: palette.ink },
  historyTime: { ...type.caption, color: palette.muted, marginTop: 2 },
});
