import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AuroraBackground } from '../../components/AuroraBackground';
import { ExplanationDetail } from '../../components/ExplanationDetail';
import { TabBar } from '../../components/TabBar';
import { EmptyState } from '../../components/ui';
import { useApp } from '../../lib/store';
import { useResponsive } from '../../lib/theme';

/** Medicine detail — opened from the cabinet or the Home preview. */
export default function MedicineDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    explanationById,
    savedById,
    current,
    draftReminders,
    setDraftReminder,
    addDraftReminder,
    removeDraftReminder,
    updateSavedReminder,
    addSavedReminder,
    removeSavedReminder,
    toggleSaved,
    isSaved,
    liveFailed,
  } = useApp();
  const r = useResponsive();

  const explanation = id ? explanationById(id) : undefined;
  const savedItem = id ? savedById(id) : undefined;

  if (!explanation) {
    return (
      <View style={styles.root}>
        <AuroraBackground />
        <ScrollView contentContainerStyle={styles.emptyWrap}>
          <EmptyState
            glyph="💊"
            title="Medicine not found"
            body="This explanation is no longer open. Explain the label again from Home."
            actionLabel="Go to Home"
            onAction={() => router.replace('/')}
          />
        </ScrollView>
        <TabBar />
      </View>
    );
  }

  const isCurrent = current?.id === explanation.id;
  const reminders = savedItem ? savedItem.reminders : isCurrent ? draftReminders : [];

  return (
    <View style={styles.root}>
      <AuroraBackground />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { maxWidth: r.contentMaxWidth, alignSelf: 'center' }]}
      >
        <ExplanationDetail
          explanation={explanation}
          reminders={reminders}
          liveFailed={liveFailed}
          saved={isSaved(explanation.id)}
          onToggleSaved={() => toggleSaved(explanation)}
          onReminderChange={
            savedItem
              ? (rid, patch) => updateSavedReminder(explanation.id, rid, patch)
              : isCurrent
                ? setDraftReminder
                : undefined
          }
          onAddReminder={
            savedItem ? () => addSavedReminder(explanation.id) : isCurrent ? addDraftReminder : undefined
          }
          onRemoveReminder={
            savedItem
              ? (rid) => removeSavedReminder(explanation.id, rid)
              : isCurrent
                ? removeDraftReminder
                : undefined
          }
        />
      </ScrollView>
      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 120, width: '100%' },
  emptyWrap: { flexGrow: 1, justifyContent: 'center', padding: 20 },
});
