import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AuroraBackground } from '../components/AuroraBackground';
import { TabBar } from '../components/TabBar';
import { GhostButton, GlassCard, SectionHeader } from '../components/ui';
import { DISCLAIMER } from '../lib/medicines';
import { palette, spacing, type, useResponsive } from '../lib/theme';

/** Help — how MediGuide works, its limits, and the safety disclaimer. */
export default function HelpScreen() {
  const router = useRouter();
  const r = useResponsive();

  return (
    <View style={styles.root}>
      <AuroraBackground />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { maxWidth: r.contentMaxWidth, alignSelf: 'center' }]}
      >
        <SectionHeader kicker="Help" title="How MediGuide works" />

        <GlassCard style={styles.card}>
          <Text style={styles.step}>1 · Paste the label</Text>
          <Text style={styles.body}>
            Copy the text from a medicine box, bottle or prescription — or tap a sample label on
            the Home screen.
          </Text>
          <Text style={styles.step}>2 · Read it in plain words</Text>
          <Text style={styles.body}>
            MediGuide explains what the medicine is for, how to take it, and the key warnings —
            in simple language, with no jargon.
          </Text>
          <Text style={styles.step}>3 · Build your schedule</Text>
          <Text style={styles.body}>
            The times on the label become a reminder schedule. Edit any time or dose, turn
            reminders on or off, and save the medicine to your cabinet.
          </Text>
          <Text style={styles.step}>4 · Come back anytime</Text>
          <Text style={styles.body}>
            Saved medicines live in your cabinet; every explanation is kept in History for
            one-tap re-opening.
          </Text>
        </GlassCard>

        <SectionHeader kicker="Important" title="What MediGuide is not" />
        <GlassCard style={styles.card}>
          <Text style={styles.body}>
            MediGuide is general information, not medical advice. It does not diagnose, prescribe,
            or replace your doctor or pharmacist.
          </Text>
          <Text style={styles.body}>
            {DISCLAIMER}
          </Text>
          <Text style={styles.body}>
            If a label says something different from what MediGuide shows, always follow the label
            and your doctor — and ask a pharmacist if anything is unclear.
          </Text>
        </GlassCard>

        <SectionHeader kicker="Your data" title="Privacy" />
        <GlassCard style={styles.card}>
          <Text style={styles.body}>
            Your labels, cabinet and history stay on your device, and in your own account when
            signed in. MediGuide has no ads and no trackers, and never shares your medicines with
            anyone.
          </Text>
        </GlassCard>

        <GhostButton label="← Back to Home" onPress={() => router.replace('/')} />
      </ScrollView>
      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 120, width: '100%' },
  card: { marginBottom: spacing.xl, padding: spacing.md },
  step: { ...type.bodyStrong, color: palette.primary, marginTop: spacing.sm },
  body: { ...type.body, color: palette.body, marginTop: 4 },
});
