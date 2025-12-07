import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Colors } from '../../src/constants/colors';
import { Typography } from '../../src/constants/typography';
import { isValidEmail } from '../../src/utils/validators';

export default function LoginScreen() {
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const { signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricAvailable(compatible && enrolled);
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Sign in to Prosperly',
        fallbackLabel: 'Use password',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // In a real app, you'd retrieve stored credentials securely
        Alert.alert('Success', 'Biometric authentication successful! (Demo mode)');
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
    }
  };

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    console.log('🔐 Login button clicked');
    console.log('📧 Email:', email);
    
    if (!validate()) {
      console.log('❌ Validation failed');
      return;
    }

    console.log('✅ Validation passed');
    setLoading(true);
    
    try {
      console.log('🔄 Calling signIn...');
      await signIn(email.trim().toLowerCase(), password);
      console.log('✅ SignIn successful, navigating to dashboard...');
      router.replace('/(tabs)/dashboard');
      console.log('✅ Navigation complete');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      Alert.alert('Login Failed', error.message || 'Please check your credentials and try again');
    } finally {
      setLoading(false);
      console.log('🏁 Login process complete');
    }
  };

  if (showEmailLogin) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={() => setShowEmailLogin(false)}>
            <Ionicons name="arrow-back" size={24} color={Colors.prosperlyNavy} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Image
              source={require('../../assets/logos/prosperly-logo.png')}
              style={styles.logoLarge}
              resizeMode="contain"
            />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue managing your transactions</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              leftIcon="lock-closed-outline"
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              error={errors.password}
            />

            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button title="Sign In" onPress={handleLogin} loading={loading} style={styles.button} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.centeredContainer}>
        <Image
          source={require('../../assets/logos/prosperly-logo.png')}
          style={styles.logoLarge}
          resizeMode="contain"
        />

        <Text style={styles.mainTitle}>How would you like to sign in?</Text>
        <Text style={styles.mainSubtitle}>Access your Prosperly account to track your transactions</Text>

        <View style={styles.buttonContainer}>
          {biometricAvailable && (
            <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricAuth}>
              <Ionicons name="finger-print" size={24} color={Colors.white} />
              <Text style={styles.biometricButtonText}>Sign in with Biometrics</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.appleButton} onPress={() => Alert.alert('Coming Soon', 'Apple Sign-In will be available soon')}>
            <Ionicons name="logo-apple" size={24} color={Colors.white} />
            <Text style={styles.appleButtonText}>Sign in with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.googleButton} onPress={() => Alert.alert('Coming Soon', 'Google Sign-In will be available soon')}>
            <Ionicons name="logo-google" size={24} color={Colors.error} />
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.emailButton} onPress={() => setShowEmailLogin(true)}>
            <Ionicons name="mail-outline" size={24} color={Colors.prosperlyBlue} />
            <Text style={styles.emailButtonText}>Sign in with email</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  centeredContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    marginTop: 16,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoLarge: {
    width: 600,
    height: 200,
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.prosperlyNavy,
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 32,
  },
  mainSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: 48,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.prosperlyNavy,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray[600],
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.prosperlyMint,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  biometricButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.white,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.black,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  appleButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.white,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    gap: 12,
  },
  googleButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.prosperlyNavy,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.prosperlyBlue,
    gap: 12,
  },
  emailButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.prosperlyBlue,
  },
  form: {
    flex: 1,
  },
  forgotPassword: {
    fontSize: Typography.fontSize.sm,
    color: Colors.prosperlyBlue,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'right',
    marginTop: -8,
    marginBottom: 24,
  },
  button: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  footerText: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray[600],
  },
  signupLink: {
    fontSize: Typography.fontSize.base,
    color: Colors.prosperlyBlue,
    fontWeight: Typography.fontWeight.semibold,
  },
});
