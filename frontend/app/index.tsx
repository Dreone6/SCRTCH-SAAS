import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { AnimatedSplash } from '../src/components/AnimatedSplash';
import { Colors } from '../src/constants/colors';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Only navigate after splash animation completes
    if (!loading && !showSplash) {
      if (user) {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [user, loading, showSplash]);

  const handleAnimationEnd = () => {
    setShowSplash(false);
  };

  return (
    <View style={styles.container}>
      {showSplash && <AnimatedSplash onAnimationEnd={handleAnimationEnd} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.prosperlyNavy,
  },
});
