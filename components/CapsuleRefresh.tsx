import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { palette } from '../lib/theme';

/**
 * MediGuide's custom pull-to-refresh: a capsule filling with teal.
 *
 * The pull is scrubbed by finger distance — the capsule drops in and
 * fills as the user pulls down past the top; past the threshold,
 * releasing plays the fill loop while data returns, then the content
 * settles with a spring. Never the stock spinner. On web, where native
 * pull-to-refresh doesn't exist, the same animation is wired to the
 * header refresh button (see the `CapsuleButton` export).
 */

const THRESHOLD = 90;

function CapsuleVisual({
  fill,
  refreshing,
}: {
  /** 0–1 fill level while pulling; ignored while `refreshing` loops. */
  fill: SharedValue<number>;
  refreshing: boolean;
}) {
  const loop = useSharedValue(0);
  useEffect(() => {
    if (refreshing) {
      loop.value = withRepeat(
        withSequence(withTiming(1, { duration: 700 }), withTiming(0.15, { duration: 700 })),
        -1,
        false,
      );
    } else {
      loop.value = withTiming(0, { duration: 300 });
    }
  }, [refreshing, loop]);

  const fillStyle = useAnimatedStyle(() => {
    const level = refreshing ? 0.55 + loop.value * 0.45 : Math.min(1, Math.max(0, fill.value));
    return { width: `${Math.round(level * 100)}%` };
  });
  const bobStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: refreshing ? -3 + loop.value * 6 : 0 }],
  }));

  return (
    <View style={styles.capsuleWrap}>
      <Animated.View style={[styles.capsule, bobStyle]}>
        <LinearGradient
          colors={[palette.primaryLight, palette.primaryDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.capsuleOuter}
        >
          <Animated.View style={[styles.capsuleFill, fillStyle]} />
          <View style={styles.capsuleHalf} />
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

/** The header refresh visual on web — same capsule, same loop. Wrap it
 *  in the parent's own pressable; this component is visual only. */
export function CapsuleButton({ refreshing }: { refreshing: boolean }) {
  const fill = useSharedValue(0);
  useEffect(() => {
    fill.value = withSpring(refreshing ? 1 : 0, { damping: 14, stiffness: 200 });
  }, [refreshing, fill]);
  return <CapsuleVisual fill={fill} refreshing={refreshing} />;
}

export function PullToRefresh({
  refreshing,
  onRefresh,
  children,
}: {
  refreshing: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
}) {
  // 0–1 pull progress; the capsule fill reads it directly.
  const pull = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      pull.value = Math.min(1, Math.max(0, -event.contentOffset.y / THRESHOLD));
    },
    onEndDrag: (event) => {
      if (event.contentOffset.y < -THRESHOLD) {
        runOnJS(onRefresh)();
      }
    },
  });

  const indicatorStyle = useAnimatedStyle(() => ({
    height: refreshing ? 64 : pull.value * 64,
    opacity: refreshing || pull.value > 0.08 ? 1 : 0,
  }));

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.indicator, indicatorStyle]}>
        <CapsuleVisual fill={pull} refreshing={refreshing} />
      </Animated.View>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {children}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  indicator: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: { paddingBottom: 120 },
  capsuleWrap: { alignItems: 'center', justifyContent: 'center' },
  capsule: {
    borderRadius: 22,
    height: 44,
    overflow: 'hidden',
    width: 120,
  },
  capsuleOuter: {
    borderRadius: 22,
    height: 44,
    overflow: 'hidden',
    position: 'relative',
    width: 120,
  },
  capsuleFill: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 22,
    height: 44,
    left: 0,
    position: 'absolute',
    top: 0,
  },
  capsuleHalf: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 22,
    height: 44,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 56,
  },
});
