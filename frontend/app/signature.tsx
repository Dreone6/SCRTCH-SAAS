import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import SignatureCanvas from 'react-native-signature-canvas';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import { AuthService } from '../src/services/auth.service';
import { StorageService } from '../src/services/storage.service';
import { Button } from '../src/components/Button';
import { Colors } from '../src/constants/colors';

// Ported from scrtch-mobile's SignatureEditorScreen. Requires the
// `react-native-signature-canvas` dependency added in this same change, and
// the `signature_url` column added in
// supabase-signature-and-subscription-extension.sql.
export default function SignatureScreen() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const signatureRef = useRef<any>(null);

  const [isEmpty, setIsEmpty] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleClear = () => {
    signatureRef.current?.clearSignature();
    setIsEmpty(true);
  };

  const handleSave = () => {
    if (isEmpty) {
      Alert.alert('Nothing to save', 'Please draw your signature first');
      return;
    }
    signatureRef.current?.readSignature();
  };

  const handleSignature = async (signature: string) => {
    if (!user) return;
    setSaving(true);
    try {
      const url = await StorageService.uploadSignature(user.id, signature);
      await AuthService.updateProfile(user.id, { signature_url: url });
      await refreshUser();
      Alert.alert('Saved', 'Your signature has been saved.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save signature');
    } finally {
      setSaving(false);
    }
  };

  if (saving) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.prosperlyBlue} />
        <Text style={styles.savingText}>Saving signature...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={Colors.prosperlyNavy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Draw Signature</Text>
        <TouchableOpacity onPress={handleClear}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.instructions}>
        <Ionicons name="finger-print-outline" size={18} color={Colors.gray[500]} />
        <Text style={styles.instructionsText}>Sign using your finger</Text>
      </View>

      <View style={styles.canvasContainer}>
        <SignatureCanvas
          ref={signatureRef}
          onOK={handleSignature}
          onBegin={() => setIsEmpty(false)}
          descriptionText=""
          webStyle={`.m-signature-pad { box-shadow: none; border: none; } .m-signature-pad--body { border: none; } .m-signature-pad--footer { display: none; } body, html { background-color: ${Colors.white}; }`}
          penColor={Colors.prosperlyNavy}
          backgroundColor={Colors.white}
        />
      </View>

      <View style={styles.footer}>
        <Button title="Save Signature" onPress={handleSave} disabled={isEmpty} fullWidth size="large" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.prosperlySlate },
  centered: { alignItems: 'center', justifyContent: 'center' },
  savingText: { marginTop: 12, color: Colors.gray[600] },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.prosperlyNavy },
  clearText: { fontSize: 16, color: Colors.error, fontWeight: '500' },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: Colors.white,
  },
  instructionsText: { marginLeft: 8, fontSize: 14, color: Colors.gray[600] },
  canvasContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  footer: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.gray[200] },
});
