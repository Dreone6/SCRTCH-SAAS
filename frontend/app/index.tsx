import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { AnimatedSplash } from '../src/components/AnimatedSplash';
import { Colors } from '../src/constants/colors';

/**
 * Index/Splash Screen
 * Shows animated splash, then AuthGuard in _layout.tsx handles navigation
 */
export default function Index() {
  const [showSplash, setShowSplash] = useState(true);

  const handleAnimationEnd = () => {
    console.log('🎬 Splash animation complete');
    setShowSplash(false);
  };

  if (showSplash) {
    return (
      <View style={styles.container}>
        <AnimatedSplash onAnimationEnd={handleAnimationEnd} />
      </View>
    );
  }

  // After splash, render nothing - AuthGuard will handle navigation
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.prosperlyNavy,
  },
});
