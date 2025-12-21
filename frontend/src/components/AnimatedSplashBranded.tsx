import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';
import { Colors } from '../constants/colors';

const { width, height } = Dimensions.get('window');

interface AnimatedSplashBrandedProps {
  onAnimationEnd: () => void;
}

// scrtch logo SVG (we'll load from file, but inline for now)
const SCRTCH_LOGO_SVG = `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
  <text x="10" y="45" font-family="Arial, sans-serif" font-size="48" font-weight="700" fill="#FFFFFF">scrtch</text>
</svg>`;

export function AnimatedSplashBranded({ onAnimationEnd }: AnimatedSplashBrandedProps) {
  const [phase, setPhase] = useState<'splash' | 'transition'>('splash');
  
  // Animation values for splash phase
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const padOpacity = useSharedValue(0);
  const padScale = useSharedValue(0.9);
  const strikeWidth = useSharedValue(0);
  
  // Animation values for transition phase
  const containerOpacity = useSharedValue(1);
  const logoTranslateY = useSharedValue(0);
  const logoTranslateX = useSharedValue(0);
  const logoFinalScale = useSharedValue(1);

  useEffect(() => {
    startSplashAnimation();
  }, []);

  const startSplashAnimation = () => {
    // Phase 1: Fade in scrtch logo (0-800ms)
    logoOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
    logoScale.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });

    // Phase 2: Show "pad" with writing animation (1200-2200ms)
    padOpacity.value = withDelay(
      1200,
      withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.quad),
      })
    );
    padScale.value = withDelay(
      1200,
      withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.back),
      })
    );

    // Phase 3: Strike through "pad" (2400-3000ms)
    strikeWidth.value = withDelay(
      2400,
      withTiming(1, {
        duration: 600,
        easing: Easing.inOut(Easing.quad),
      })
    );

    // Phase 4: Start transition (3500ms)
    setTimeout(() => {
      runOnJS(startTransition)();
    }, 3500);
  };

  const startTransition = () => {
    setPhase('transition');
    
    // Animate logo to top-left corner
    const targetY = -height / 2 + 80; // Move to top
    const targetX = -width / 2 + 100; // Move to left
    
    logoTranslateY.value = withTiming(targetY, {
      duration: 800,
      easing: Easing.inOut(Easing.cubic),
    });
    
    logoTranslateX.value = withTiming(targetX, {
      duration: 800,
      easing: Easing.inOut(Easing.cubic),
    });
    
    logoFinalScale.value = withTiming(0.4, {
      duration: 800,
      easing: Easing.inOut(Easing.cubic),
    });
    
    // Fade out "pad" during transition
    padOpacity.value = withTiming(0, {
      duration: 400,
      easing: Easing.in(Easing.quad),
    });
    
    // Complete transition
    setTimeout(() => {
      onAnimationEnd();
    }, 1000);
  };

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value * logoFinalScale.value },
      { translateY: logoTranslateY.value },
      { translateX: logoTranslateX.value },
    ],
  }));

  const padContainerStyle = useAnimatedStyle(() => ({
    opacity: padOpacity.value,
    transform: [{ scale: padScale.value }],
  }));

  const strikeStyle = useAnimatedStyle(() => ({
    width: `${strikeWidth.value * 100}%`,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Decorative background */}
      <View style={styles.gradientCircle1} />
      <View style={styles.gradientCircle2} />

      {/* Main content */}
      <View style={styles.contentCenter}>
        {/* scrtch logo */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <Text style={styles.logoText}>scrtch</Text>
        </Animated.View>

        {/* "pad" with strike-through */}
        {phase === 'splash' && (
          <Animated.View style={[styles.padContainer, padContainerStyle]}>
            <Text style={styles.padText}>pad</Text>
            <Animated.View style={[styles.strikeLine, strikeStyle]} />
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientCircle1: {
    position: 'absolute',
    top: -150,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  gradientCircle2: {
    position: 'absolute',
    bottom: -150,
    left: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  contentCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 72,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -2,
    textTransform: 'lowercase',
  },
  padContainer: {
    position: 'relative',
    marginTop: -12,
    paddingHorizontal: 24,
  },
  padText: {
    fontSize: 56,
    fontWeight: '400',
    fontStyle: 'italic',
    color: Colors.white,
    letterSpacing: 1,
  },
  strikeLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    height: 4,
    backgroundColor: Colors.error,
    borderRadius: 2,
  },
});
