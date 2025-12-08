import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { AnimatedSplash } from '../src/components/AnimatedSplash';
import { Colors } from '../src/constants/colors';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [showSplash, setShowSplash] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Only navigate after splash animation completes and auth is loaded
    if (!loading && !showSplash && !isNavigating) {
      setIsNavigating(true);
      
      setTimeout(() => {
        if (user) {
          router.replace('/(tabs)/dashboard');
        } else {
          router.replace('/(auth)/login');
        }
      }, 100);
    }
  }, [user, loading, showSplash]);

  // Handle auth state changes after initial load
  useEffect(() => {
    if (!loading && !showSplash) {
      const inAuthGroup = segments[0] === '(auth)';
      const inTabsGroup = segments[0] === '(tabs)';

      if (user && !inTabsGroup && inAuthGroup) {
        // User is authenticated but in auth screens, redirect to dashboard
        router.replace('/(tabs)/dashboard');
      } else if (!user && !inAuthGroup && inTabsGroup) {
        // User is not authenticated but in protected screens, redirect to login
        router.replace('/(auth)/login');
      }
    }
  }, [user, segments, loading, showSplash]);

  const handleAnimationEnd = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return (
      <View style={styles.container}>
        <AnimatedSplash onAnimationEnd={handleAnimationEnd} />
      </View>
    );
  }

  if (loading || isNavigating) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.prosperlyBlue} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.prosperlyNavy,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
