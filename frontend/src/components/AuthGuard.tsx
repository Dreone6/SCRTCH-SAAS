import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

/**
 * AuthGuard handles automatic navigation based on authentication state
 * This component should be rendered at the root level to work across all routes
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      console.log('🔄 AuthGuard: Still loading auth state...');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    console.log('🔄 AuthGuard: Checking navigation', {
      user: user ? 'authenticated' : 'not authenticated',
      currentSegment: segments[0],
      inAuthGroup,
      inTabsGroup,
    });

    if (!user && !inAuthGroup) {
      // User is not authenticated and not in auth screens - redirect to login
      console.log('✅ AuthGuard: Redirecting to login');
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // User is authenticated but still in auth screens - redirect to dashboard
      console.log('✅ AuthGuard: Redirecting to dashboard');
      router.replace('/(tabs)/dashboard');
    }
  }, [user, segments, loading]);

  return children;
}
