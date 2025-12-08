import React, { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

const ONBOARDING_KEY = '@prosperly_onboarding_complete';

/**
 * AuthGuard handles automatic navigation based on authentication state
 * This component should be rendered at the root level to work across all routes
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  // Check if user has completed onboarding
  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      setOnboardingComplete(value === 'true');
    } catch (error) {
      console.error('Error checking onboarding:', error);
      setOnboardingComplete(true); // Default to true on error
    }
  };

  useEffect(() => {
    if (loading || onboardingComplete === null) {
      console.log('🔄 AuthGuard: Still loading...');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    console.log('🔄 AuthGuard: Checking navigation', {
      user: user ? 'authenticated' : 'not authenticated',
      currentSegment: segments[0],
      onboardingComplete,
      inAuthGroup,
      inTabsGroup,
      inOnboardingGroup,
    });

    // If user hasn't completed onboarding and not already there
    if (!onboardingComplete && !inOnboardingGroup) {
      console.log('✅ AuthGuard: Redirecting to onboarding');
      router.replace('/(onboarding)');
      return;
    }

    // If user is not authenticated and not in auth screens (and onboarding is complete)
    if (!user && !inAuthGroup && !inOnboardingGroup) {
      console.log('✅ AuthGuard: Redirecting to login');
      router.replace('/(auth)/login');
    } 
    // If user is authenticated but still in auth screens
    else if (user && (inAuthGroup || inOnboardingGroup)) {
      console.log('✅ AuthGuard: Redirecting to dashboard');
      router.replace('/(tabs)/dashboard');
    }
  }, [user, segments, loading, onboardingComplete]);

  return <>{children}</>;
}
