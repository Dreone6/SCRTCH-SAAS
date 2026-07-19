import { Platform } from 'react-native';
import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';

// Ported from scrtch-mobile's purchases.ts. RevenueCat is the source of
// truth for subscription/entitlement status -- there is no local
// `subscriptions` table in this app (see
// supabase-signature-and-subscription-extension.sql for the reasoning).
const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '';
const REVENUECAT_ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '';

const PRO_ENTITLEMENT_ID = 'pro';

export class PurchasesService {
  static async init(userId: string): Promise<void> {
    const apiKey = Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;

    if (!apiKey) {
      console.warn('RevenueCat API key not configured (EXPO_PUBLIC_REVENUECAT_IOS_KEY / _ANDROID_KEY)');
      return;
    }

    await Purchases.configure({ apiKey });
    await Purchases.logIn(userId);
  }

  static async isPro(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
    } catch (error) {
      console.error('Error checking pro status:', error);
      return false;
    }
  }

  static async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('Error getting customer info:', error);
      return null;
    }
  }

  static async getOfferings(): Promise<PurchasesPackage[]> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current?.availablePackages || [];
    } catch (error) {
      console.error('Error getting offerings:', error);
      return [];
    }
  }

  static async purchase(pkg: PurchasesPackage): Promise<boolean> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
    } catch (error: any) {
      if (error.userCancelled) return false;
      throw error;
    }
  }

  static async restore(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      throw error;
    }
  }
}
