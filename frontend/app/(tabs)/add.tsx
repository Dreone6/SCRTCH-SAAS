import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../src/contexts/AuthContext';
import { TransactionService } from '../../src/services/transaction.service';
import { NotificationService } from '../../src/services/notification.service';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Colors } from '../../src/constants/colors';
import { Typography } from '../../src/constants/typography';
import { isValidAmount } from '../../src/utils/validators';
import { TransactionType, ReminderFrequency } from '../../src/types';

export default function AddTransactionScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [type, setType] = useState<TransactionType>('lend');
  const [counterpartyName, setCounterpartyName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reminderFrequency, setReminderFrequency] = useState<ReminderFrequency>('weekly');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: any = {};

    if (!counterpartyName.trim()) {
      newErrors.counterpartyName = type === 'lend' ? 'Borrower name is required' : 'Lender name is required';
    }

    if (!amount) {
      newErrors.amount = 'Amount is required';
    } else if (!isValidAmount(amount)) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (dueDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;

    setLoading(true);
    try {
      const transaction = await TransactionService.createTransaction({
        user_id: user.id,
        counterparty_name: counterpartyName.trim(),
        type,
        amount: parseFloat(amount),
        amount_paid: 0,
        due_date: dueDate.toISOString().split('T')[0],
        reminder_frequency: reminderFrequency,
        status: 'pending',
        notes: notes.trim() || undefined,
      });

      // Schedule notification if enabled
      if (reminderFrequency !== 'off') {
        await NotificationService.scheduleTransactionReminder(
          transaction.id,
          counterpartyName,
          parseFloat(amount),
          dueDate,
          type
        );
      }

      Alert.alert(
        'Success',
        `Transaction added successfully!`,
        [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)/dashboard'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Add Transaction</Text>

          {/* Transaction Type */}
          <Card style={styles.typeCard}>
            <Text style={styles.sectionLabel}>Transaction Type</Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity
                style={[styles.typeButton, type === 'lend' && styles.typeButtonActive]}
                onPress={() => setType('lend')}
              >
                <Text style={[styles.typeButtonText, type === 'lend' && styles.typeButtonTextActive]}>
                  I Lend Money
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, type === 'borrow' && styles.typeButtonActive]}
                onPress={() => setType('borrow')}
              >
                <Text style={[styles.typeButtonText, type === 'borrow' && styles.typeButtonTextActive]}>
                  I Borrow Money
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Transaction Details */}
          <Input
            label={type === 'lend' ? 'Borrower Name' : 'Lender Name'}
            placeholder={type === 'lend' ? 'Who are you lending to?' : 'Who are you borrowing from?'}
            value={counterpartyName}
            onChangeText={setCounterpartyName}
            leftIcon="person-outline"
            error={errors.counterpartyName}
          />

          <Input
            label="Amount"
            placeholder="Enter amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            leftIcon="cash-outline"
            error={errors.amount}
          />

          {/* Due Date */}
          <View style={styles.dateContainer}>
            <Text style={styles.label}>Due Date</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateText}>{formatDate(dueDate)}</Text>
            </TouchableOpacity>
            {errors.dueDate && <Text style={styles.error}>{errors.dueDate}</Text>}
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDueDate(selectedDate);
                }
              }}
            />
          )}

          {/* Reminder Frequency */}
          <View style={styles.reminderContainer}>
            <Text style={styles.label}>Reminder Frequency</Text>
            <View style={styles.reminderButtons}>
              {(['daily', 'every_3_days', 'weekly', 'off'] as ReminderFrequency[]).map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.reminderButton,
                    reminderFrequency === freq && styles.reminderButtonActive,
                  ]}
                  onPress={() => setReminderFrequency(freq)}
                >
                  <Text
                    style={[
                      styles.reminderButtonText,
                      reminderFrequency === freq && styles.reminderButtonTextActive,
                    ]}
                  >
                    {freq === 'every_3_days' ? 'Every 3 Days' : freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <Input
            label="Notes (Optional)"
            placeholder="Add any additional notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: 'top' }}
          />

          <Button
            title={type === 'lend' ? 'Add Lend Transaction' : 'Add Borrow Transaction'}
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.prosperlySlate,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.prosperlyNavy,
    marginBottom: 24,
  },
  typeCard: {
    padding: 20,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.prosperlyNavy,
    marginBottom: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: Colors.prosperlyBlue,
    backgroundColor: Colors.prosperlyBlue + '10',
  },
  typeButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.gray[600],
  },
  typeButtonTextActive: {
    color: Colors.prosperlyBlue,
  },
  dateContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.prosperlyNavy,
    marginBottom: 8,
  },
  dateButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dateText: {
    fontSize: Typography.fontSize.base,
    color: Colors.prosperlyNavy,
  },
  error: {
    marginTop: 4,
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
  },
  reminderContainer: {
    marginBottom: 24,
  },
  reminderButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reminderButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    backgroundColor: Colors.white,
  },
  reminderButtonActive: {
    borderColor: Colors.prosperlyBlue,
    backgroundColor: Colors.prosperlyBlue,
  },
  reminderButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.gray[600],
  },
  reminderButtonTextActive: {
    color: Colors.white,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 24,
  },
});
