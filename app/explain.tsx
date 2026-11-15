import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AuroraBackground } from '../components/AuroraBackground';
import { ExplanationDetail } from '../components/ExplanationDetail';
import { TabBar } from '../components/TabBar';
import { EmptyState, GhostButton } from '../components/ui';
import { useApp } from '../lib/store';
import { useResponsive } from '../lib/theme';

/** Explain result — the plain-language sheet over the medicine photo. */
export default function ExplainScreen() {
  const router = useRouter();
  const {
    current,
    draftReminders,
    setDraftReminder,
    addDraftReminder,
    removeDraftReminder,
    saveCurrent,
    isSaved,
    toggleSaved,
    liveFailed,
  } = useApp();
  const r = useResponsive();
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!current) {
    return (
      <View style={styles.root}>
        <AuroraBackground />
        <ScrollView contentContainerStyle={styles.emptyWrap}>
          <EmptyState
            glyph="💊"
            title="No label explained yet"
            body="Paste a medicine label on the Home screen and MediGuide will explain it in plain words."
            actionLabel="Go to Home"
            onAction={() => router.replace('/')}
          />
        </ScrollView>
        <TabBar />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <AuroraBackground />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { maxWidth: r.contentMaxWidth, alignSelf: 'center' }]}
      >
        <ExplanationDetail
          explanation={current}
          reminders={draftReminders}
          liveFailed={liveFailed}
          saved={isSaved(current.id)}
          onToggleSaved={() => toggleSaved(current)}
          onSave={() => {
            saveCurrent();
            // Visible feedback where the user is looking.
            setFeedback('Saved to your cabinet ✓');
          }}
          savedFeedback={feedback}
          onReminderChange={setDraftReminder}
          onAddReminder={addDraftReminder}
          onRemoveReminder={removeDraftReminder}
        />
        <View style={styles.backRow}>
          <GhostButton label="← Explain another label" onPress={() => router.replace('/')} />
        </View>
      </ScrollView>
      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 120, width: '100%' },
  emptyWrap: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  backRow: { marginTop: 24, paddingHorizontal: 20 },
});
