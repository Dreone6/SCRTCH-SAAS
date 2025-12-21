import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
  useAnimatedProps,
} from 'react-native-reanimated';
import Svg, { Path, Line } from 'react-native-svg';
import { Colors } from '../constants/colors';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onComplete: () => void;
}

const AnimatedLine = Animated.createAnimatedComponent(Line);

export function SplashScreen({ onComplete }: SplashScreenProps) {
  // Animation values
  const logoOpacity = useSharedValue(0);
  const padLetterP = useSharedValue(0);
  const padLetterA = useSharedValue(0);
  const padLetterD = useSharedValue(0);
  const strikeProgress = useSharedValue(0);
  const fadeOut = useSharedValue(1);

  useEffect(() => {
    startAnimation();
  }, []);

  const startAnimation = () => {
    // Frame 1: Empty blue background (0-500ms)
    // Just wait...

    // Frame 2: Logo fade in (500-1500ms)
    logoOpacity.value = withDelay(
      500,
      withTiming(1, {
        duration: 1000,
        easing: Easing.in(Easing.ease),
      })
    );

    // Frame 3: "pad" writes in letter by letter (1500-2500ms)
    // Letter 'p'
    padLetterP.value = withDelay(
      1500,
      withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      })
    );

    // Letter 'a'
    padLetterA.value = withDelay(
      1800,
      withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      })
    );

    // Letter 'd'
    padLetterD.value = withDelay(
      2100,
      withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.quad),
      })
    );

    // Frame 4: Cross out "pad" (2500-3000ms)
    strikeProgress.value = withDelay(
      2500,
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.quad),
      })
    );

    // Frame 5: Hold and fade out (3000-3500ms)
    fadeOut.value = withDelay(
      3300,
      withTiming(
        0,
        {
          duration: 200,
          easing: Easing.in(Easing.quad),
        },
        () => {
          runOnJS(onComplete)();
        }
      )
    );
  };

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value * fadeOut.value,
  }));

  const padPStyle = useAnimatedStyle(() => ({
    opacity: padLetterP.value * fadeOut.value,
    transform: [
      {
        translateY: withTiming(padLetterP.value > 0 ? 0 : 5, { duration: 300 }),
      },
    ],
  }));

  const padAStyle = useAnimatedStyle(() => ({
    opacity: padLetterA.value * fadeOut.value,
    transform: [
      {
        translateY: withTiming(padLetterA.value > 0 ? 0 : 5, { duration: 300 }),
      },
    ],
  }));

  const padDStyle = useAnimatedStyle(() => ({
    opacity: padLetterD.value * fadeOut.value,
    transform: [
      {
        translateY: withTiming(padLetterD.value > 0 ? 0 : 5, { duration: 300 }),
      },
    ],
  }));

  const strikeLineProps = useAnimatedProps(() => ({
    x2: 40 + strikeProgress.value * 90, // Animate from start to end
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeOut.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Blue background - Frame 1 */}
      <View style={styles.background} />

      {/* Content centered */}
      <View style={styles.content}>
        {/* "scrtch" logo - Frame 2 */}
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Text style={styles.scrtchText}>scrtch</Text>
        </Animated.View>

        {/* "pad" with handwriting animation - Frame 3 */}
        <View style={styles.padContainer}>
          <Animated.Text style={[styles.padText, padPStyle]}>p</Animated.Text>
          <Animated.Text style={[styles.padText, padAStyle]}>a</Animated.Text>
          <Animated.Text style={[styles.padText, padDStyle]}>d</Animated.Text>

          {/* Strike through line - Frame 4 */}
          <Svg
            width="130"
            height="40"
            style={styles.strikeLineSvg}
            viewBox="0 0 130 40"
          >
            <AnimatedLine
              x1="40"
              y1="12"
              x2="40"
              y2="12"
              stroke={Colors.error}
              strokeWidth="3"
              strokeLinecap="round"
              animatedProps={strikeLineProps}
            />
          </Svg>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary, // #4A90E2
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primary,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  logoContainer: {
    marginRight: 8,
  },
  scrtchText: {
    fontSize: 48,
    fontWeight: '700', // Bold - geometric sans-serif
    color: Colors.white,
    letterSpacing: -1,
    textTransform: 'lowercase',
    // Use system font (SF Pro on iOS, Roboto on Android)
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  padContainer: {
    flexDirection: 'row',
    position: 'relative',
    alignItems: 'center',
    marginLeft: 4,
  },
  padText: {
    fontSize: 36,
    fontWeight: '400',
    fontStyle: 'italic', // Pacifico-like handwritten style
    color: Colors.white,
    letterSpacing: 0.5,
    // Fallback to italic system font (closest to Pacifico)
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  strikeLineSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
  },
});
