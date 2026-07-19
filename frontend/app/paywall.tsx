import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { PurchasesPackage } from 'react-native-purchases';
import { PurchasesService } from '../src/services/purchases.service';
import { Colors } from '../src/constants/colors';

// Ported from scrtch-mobile's PaywallScreen, using the same RevenueCat
// entitlement ('pro') as the source of truth. Styled with the dark/blue
// language from the Gemini mockup, matching the Lenny tab.
//
// NOTE: RevenueCat offerings must be configured in the RevenueCat dashboard
// (products + an offering named "current") before this screen will show
// real packages -- until then getOfferings() returns an empty list and this
// screen shows its empty state rather than fake pricing.
const FEATURES = [
  'Unlimited active loans & borrowers',
  'AI-drafted reminders with Lenny',
  'E-signatures on every agreement',
  'Priority reminder delivery',
];

export default function PaywallScreen() {
  const router = useRouter();
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    (async () => {
      const offerings = await PurchasesService.getOfferings();
      setPackages(offerings);
      setLoading(false);
    })();
  }, []);

  const handlePurchase = async (pkg: PurchasesPackage) => {
    setPurchasing(true);
    try {
      const success = await PurchasesService.purchase(pkg);
      if (success) {
        Alert.alert('Welcome to Pro', 'Your subscription is now active.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Purchase failed', error.message || 'Something went wrong.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      const restored = await PurchasesService.restore();
      Alert.alert(restored ? 'Restored' : 'Nothing to restore', restored ? 'Your Pro access is back.' : 'No active subscription was found for this account.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to restore purchases');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Ionicons name="close" size={24} color={Colors.white} />
      </TouchableOpacity>

      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="sparkles" size={28} color={Colors.info} />
        </View>
        <Text style={styles.heroTitle}>Upgrade to Pro</Text>
        <Text style={styles.heroSubtitle}>Everything you need to manage every loan with confidence</Text>
      </View>

      <View style={styles.features}>
        {FEATURES.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.white} style={{ marginTop: 24 }} />
      ) : packages.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No subscription plans are configured yet. Set up products and an offering in the
            RevenueCat dashboard to enable purchases here.
          </Text>
        </View>
      ) : (
        <View style={styles.packages}>
          {packages.map((pkg) => (
            <TouchableOpacity
              key={pkg.identifier}
              style={styles.packageCard}
              onPress={() => handlePurchase(pkg)}
              disabled={purchasing}
            >
              <Text style={styles.packageTitle}>{pkg.product.title}</Text>
              <Text style={styles.packagePrice}>{pkg.product.priceString}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
        <Text style={styles.restoreText}>Restore Purchases</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBackground, paddingHorizontal: 24 },
  closeButton: { alignSelf: 'flex-end', marginTop: 12, padding: 4 },
  hero: { alignItems: 'center', marginTop: 12, marginBottom: 24 },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Colors.info}22`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: { fontSize: 24, fontWeight: '700', color: Colors.white },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.textQuaternary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  features: { marginBottom: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  featureText: { marginLeft: 10, color: Colors.white, fontSize: 14 },
  emptyState: { paddingVertical: 24 },
  emptyText: { color: Colors.textQuaternary, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  packages: { gap: 12 },
  packageCard: {
    backgroundColor: Colors.darkSurface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: `${Colors.info}33`,
  },
  packageTitle: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  packagePrice: { color: Colors.info, fontSize: 20, fontWeight: '700', marginTop: 4 },
  restoreButton: { alignItems: 'center', marginTop: 20, marginBottom: 24 },
  restoreText: { color: Colors.textQuaternary, fontSize: 13 },
});
