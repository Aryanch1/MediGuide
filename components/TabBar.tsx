import { BlurView } from 'expo-blur';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette, radii } from '../lib/theme';
import { useApp } from '../lib/store';
import { SpringPress } from './ui';

/**
 * Floating frosted-glass pill tab bar — real backdrop blur on every
 * platform, with the theme primary filling the active tab's pill.
 * Two-layer glass: the outer view carries the background + shadow, the
 * inner view clips the blur, so Android never paints a white plate.
 * Tabs: Home, Cabinet, Reminders, Settings.
 */
const TABS = [
  { route: '/', label: 'Home', glyph: '⌂' },
  { route: '/cabinet', label: 'Cabinet', glyph: '▦' },
  { route: '/reminders', label: 'Reminders', glyph: '◷' },
  { route: '/settings', label: 'Settings', glyph: '⚙' },
] as const;

export function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { saved } = useApp();

  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <View style={styles.barShadow}>
        <View style={styles.bar}>
          {Platform.OS === 'web' ? (
            <BlurView intensity={75} tint="light" style={StyleSheet.absoluteFill} />
          ) : null}
          {TABS.map((tab) => {
            const active =
              pathname === tab.route || (tab.route === '/' && pathname === '/index');
            const badge = tab.route === '/cabinet' ? saved.length : 0;
            return (
              <SpringPress
                key={tab.route}
                onPress={() => router.replace(tab.route as never)}
                style={styles.tabPress}
              >
                <View style={[styles.tab, active && styles.tabActive]}>
                  <Text style={[styles.glyph, active && styles.glyphActive]}>{tab.glyph}</Text>
                  <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
                  {badge > 0 ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                  ) : null}
                </View>
              </SpringPress>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  barShadow: {
    backgroundColor: palette.glass,
    borderRadius: radii.pill,
    shadowColor: '#085250',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  bar: {
    backgroundColor: palette.sheet,
    borderColor: 'rgba(255,255,255,0.75)',
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 6,
  },
  tabPress: { flex: 1 },
  tab: {
    alignItems: 'center',
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
    position: 'relative',
  },
  tabActive: { backgroundColor: palette.primary },
  glyph: { color: palette.ink, fontSize: 18, fontWeight: '700' },
  glyphActive: { color: '#FFFFFF' },
  label: { color: palette.ink, fontSize: 13, fontWeight: '700' },
  labelActive: { color: '#FFFFFF' },
  badge: {
    alignItems: 'center',
    backgroundColor: palette.accent,
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: 5,
    position: 'absolute',
    right: 2,
    top: 2,
  },
  badgeText: { color: '#102826', fontSize: 11, fontWeight: '800' },
});
