import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '../constants/colors';

const { width, height } = Dimensions.get('window');

interface AnimatedSplashProps {
  onAnimationEnd: () => void;
}

export function AnimatedSplash({ onAnimationEnd }: AnimatedSplashProps) {
  // Animation values
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const logoRotate = useSharedValue(0);
  const circleScale = useSharedValue(0);
  const circleOpacity = useSharedValue(0);
  const backgroundOpacity = useSharedValue(1);

  useEffect(() => {
    // Start animation sequence
    startAnimation();
  }, []);

  const startAnimation = () => {
    // Circle pulse animation (0-1.5s)
    circleOpacity.value = withTiming(0.3, { duration: 500 });
    circleScale.value = withSequence(
      withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) }),
      withTiming(1.2, { duration: 400, easing: Easing.inOut(Easing.ease) })
    );

    // Logo entrance animation (0.3-2s)
    logoOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) })
    );
    
    logoScale.value = withDelay(
      300,
      withSequence(
        withTiming(1.2, { duration: 800, easing: Easing.out(Easing.back(1.5)) }),
        withTiming(1, { duration: 200, easing: Easing.inOut(Easing.ease) })
      )
    );

    // Subtle rotation for polish (1-2.5s)
    logoRotate.value = withDelay(
      1000,
      withSequence(
        withTiming(5, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
      )
    );

    // Hold for a moment then fade out (4-6s)
    backgroundOpacity.value = withDelay(
      4000,
      withTiming(0, { duration: 800, easing: Easing.in(Easing.ease) }, () => {
        runOnJS(onAnimationEnd)();
      })
    );
  };

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));

  const circleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: circleOpacity.value,
    transform: [{ scale: circleScale.value }],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Background circles */}
      <Animated.View style={[styles.circle, circleAnimatedStyle]} />
      <Animated.View style={[styles.circle2, circleAnimatedStyle]} />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <Image
          source={require('../../assets/logos/prosperly-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Handshake icon overlay */}
      <Animated.View style={[styles.iconContainer, logoAnimatedStyle]}>
        <View style={styles.handshakeIcon}>
          <View style={styles.handLeft} />
          <View style={styles.handRight} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.prosperlyNavy,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  circle: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: Colors.prosperlyBlue,
    opacity: 0.1,
  },
  circle2: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: Colors.prosperlyBlue,
    opacity: 0.15,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 700,
    height: 240,
    tintColor: Colors.white,
  },
  iconContainer: {
    position: 'absolute',
    top: height / 2 - 150,
  },
  handshakeIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  handLeft: {
    width: 30,
    height: 40,
    backgroundColor: Colors.prosperlyMint,
    borderRadius: 8,
    transform: [{ rotate: '-20deg' }],
  },
  handRight: {
    width: 30,
    height: 40,
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginLeft: -10,
    transform: [{ rotate: '20deg' }],
  },
});
