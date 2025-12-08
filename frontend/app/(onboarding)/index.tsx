import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { Typography } from '../../src/constants/typography';

const ONBOARDING_KEY = '@prosperly_onboarding_complete';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'handshake-outline',
    title: 'Track Your Lending',
    description: 'Keep all your lending and borrowing records organized in one secure place',
    color: Colors.prosperlyBlue,
  },
  {
    id: '2',
    icon: 'notifications-outline',
    title: 'Never Miss a Payment',
    description: 'Get smart reminders before payment due dates and stay on top of your transactions',
    color: Colors.prosperlyMint,
  },
  {
    id: '3',
    icon: 'shield-checkmark-outline',
    title: 'Build Trust Ratings',
    description: 'Rate payment reliability privately and make informed lending decisions',
    color: Colors.prosperlyGold,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/signup');
  };

  const handleGetStarted = () => {
    router.replace('/(auth)/signup');
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon} size={80} color={item.color} />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const renderDot = (index: number) => (
    <View
      key={index}
      style={[
        styles.dot,
        {
          backgroundColor: index === currentIndex ? Colors.prosperlyBlue : Colors.gray[300],
          width: index === currentIndex ? 24 : 8,
        },
      ]}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header with Skip Button */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/logos/prosperly-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        {currentIndex < slides.length - 1 && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      />

      {/* Footer with Dots and Next Button */}
      <View style={styles.footer}>
        <View style={styles.dotsContainer}>{slides.map((_, index) => renderDot(index))}</View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.nextButtonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </TouchableOpacity>

        {currentIndex === slides.length - 1 && (
          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.loginButton}>
            <Text style={styles.loginText}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  logo: {
    width: 150,
    height: 40,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray[600],
    fontWeight: Typography.fontWeight.medium,
  },
  slide: {
    width: width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.prosperlyNavy,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: Typography.fontSize.lg,
    color: Colors.gray[600],
    textAlign: 'center',
    lineHeight: 28,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    transition: 'all 0.3s ease',
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: Colors.prosperlyBlue,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  loginButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  loginText: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray[600],
  },
});
