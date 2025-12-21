import React, { useEffect } from 'react';
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
import Svg, { Path, Line } from 'react-native-svg';
import { Colors } from '../constants/colors';

const { width, height } = Dimensions.get('window');

interface AnimatedSplashBrandedProps {
  onAnimationEnd: () => void;
}

export function AnimatedSplashBranded({ onAnimationEnd }: AnimatedSplashBrandedProps) {
  // Animation values
  const logoOpacity = useSharedValue(0);
  const padOpacity = useSharedValue(0);
  const padProgress = useSharedValue(0);
  const strikeProgress = useSharedValue(0);
  const fadeOut = useSharedValue(1);

  useEffect(() => {
    // Sequence:
    // 1. Fade in "scrtch" logo (0-800ms)
    logoOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });

    // 2. Show "pad" and animate writing (1000-2000ms)
    padOpacity.value = withDelay(
      1000,
      withTiming(1, { duration: 300 })
    );
    
    padProgress.value = withDelay(
      1000,
      withTiming(1, {
        duration: 1000,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      })
    );

    // 3. Cross out "pad" (2200-2800ms)
    strikeProgress.value = withDelay(
      2200,
      withTiming(1, {
        duration: 600,
        easing: Easing.inOut(Easing.quad),
      })
    );

    // 4. Fade out everything (3500ms)
    fadeOut.value = withDelay(
      3500,
      withTiming(
        0,
        {
          duration: 500,
          easing: Easing.in(Easing.cubic),
        },
        () => {
          runOnJS(onAnimationEnd)();
        }
      )
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value * fadeOut.value,
    transform: [
      {
        scale: withTiming(logoOpacity.value > 0.5 ? 1 : 0.8, {
          duration: 800,
        }),
      },
    ],
  }));

  const padContainerStyle = useAnimatedStyle(() => ({
    opacity: padOpacity.value * fadeOut.value,
  }));

  const padTextStyle = useAnimatedStyle(() => ({
    opacity: padProgress.value,
  }));

  const strikeStyle = useAnimatedStyle(() => ({
    width: `${strikeProgress.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      {/* Background Gradient Effect */}
      <View style={styles.gradientTop} />
      <View style={styles.gradientBottom} />

      {/* Main Content */}
      <View style={styles.content}>
        {/* scrtch Logo */}
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Text style={styles.scrtchText}>scrtch</Text>
        </Animated.View>

        {/* "pad" with handwriting animation */}
        <Animated.View style={[styles.padContainer, padContainerStyle]}>
          <Animated.Text style={[styles.padText, padTextStyle]}>
            pad
          </Animated.Text>
          
          {/* Strike-through line */}
          <Animated.View style={[styles.strikeLine, strikeStyle]} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientTop: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    opacity: 0.5,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: -150,
    left: -100,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    opacity: 0.5,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 8,
  },
  scrtchText: {
    fontSize: 64,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -1,
    textAlign: 'center',
  },
  padContainer: {
    position: 'relative',
    marginTop: -8,
    paddingHorizontal: 20,
  },
  padText: {
    fontSize: 48,
    fontFamily: 'Pacifico',  // Handwritten style
    fontStyle: 'italic',
    color: Colors.white,
    letterSpacing: 2,
    textAlign: 'center',
  },
  strikeLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    height: 3,
    backgroundColor: Colors.error,
    borderRadius: 2,
    transform: [{ translateY: -1.5 }],
  },
});
