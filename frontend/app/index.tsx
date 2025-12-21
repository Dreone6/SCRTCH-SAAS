import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SplashScreen } from '../src/components/SplashScreen';
import { Colors } from '../src/constants/colors';

/**
 * App Entry Point
 * Shows splash screen FIRST, then AuthGuard handles routing
 */
export default function Index() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    console.log('🎬 Splash animation complete');
    setShowSplash(false);
  };

  // Always show splash first, regardless of auth state
  if (showSplash) {
    return (
      <View style={styles.container}>
        <SplashScreen onComplete={handleSplashComplete} />
      </View>
    );
  }

  // After splash, render nothing - AuthGuard in _layout will handle navigation
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
});
