import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { LoanService } from '../../src/services/loan.service';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Colors } from '../../src/constants/colors';
import { Typography } from '../../src/constants/typography';
import { RelationshipType } from '../../src/types';

const RELATIONSHIP_TYPES: { value: RelationshipType; label: string }[] = [
  { value: 'family', label: 'Family' },
  { value: 'close_friend', label: 'Close Friend' },
  { value: 'friend', label: 'Friend' },
  { value: 'acquaintance', label: 'Acquaintance' },
  { value: 'business', label: 'Business' },
];

// Ported from scrtch-mobile's AddContactScreen, wired to LoanService
// (already existed in SCRTCH-SAAS) instead of a standalone borrowers.ts.
export default function AddContactScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('friend');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !user) return;

    setLoading(true);
    try {
      await LoanService.createBorrower({
        user_id: user.id,
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        relationship_type: relationshipType,
        notes: notes.trim() || undefined,
      });
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add contact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={Colors.prosperlyNavy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Contact</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
          <Input
            label="Full Name *"
            placeholder="Enter contact's name"
            value={name}
            onChangeText={setName}
            error={errors.name}
            leftIcon="person-outline"
          />
          <Input
            label="Phone Number"
            placeholder="Enter phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon="call-outline"
          />
          <Input
            label="Email"
            placeholder="Enter email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            leftIcon="mail-outline"
          />

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Relationship</Text>
            <View style={styles.relationshipOptions}>
              {RELATIONSHIP_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.relationshipOption,
                    relationshipType === type.value && styles.relationshipOptionActive,
                  ]}
                  onPress={() => setRelationshipType(type.value)}
                >
                  <Text
                    style={[
                      styles.relationshipOptionText,
                      relationshipType === type.value && styles.relationshipOptionTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Input
            label="Notes (Optional)"
            placeholder="Add any notes about this contact"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={{ textAlignVertical: 'top', minHeight: 80 }}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Add Contact" onPress={handleSave} loading={loading} fullWidth size="large" />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.prosperlySlate },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.prosperlyNavy },
  scrollContent: { padding: 16 },
  fieldContainer: { marginBottom: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '500', color: Colors.prosperlyNavy, marginBottom: 8 },
  relationshipOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  relationshipOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    backgroundColor: Colors.white,
  },
  relationshipOptionActive: {
    borderColor: Colors.prosperlyBlue,
    backgroundColor: `${Colors.prosperlyBlue}15`,
  },
  relationshipOptionText: { fontSize: 14, color: Colors.gray[600] },
  relationshipOptionTextActive: { color: Colors.prosperlyBlue, fontWeight: '500' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: Colors.gray[200] },
});
