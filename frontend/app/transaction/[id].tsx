import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { TransactionService } from '../../src/services/transaction.service';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Colors } from '../../src/constants/colors';
import { Typography } from '../../src/constants/typography';
import { formatCurrency } from '../../src/utils/validators';
import { formatDate, isOverdue } from '../../src/utils/dateHelpers';
import { Transaction } from '../../src/types';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [partialAmount, setPartialAmount] = useState('');
  const [showPartialInput, setShowPartialInput] = useState(false);

  useEffect(() => {
    loadTransaction();
  }, [id]);

  const loadTransaction = async () => {
    if (!id) return;
    
    try {
      const data = await TransactionService.getTransaction(id as string);
      setTransaction(data);
    } catch (error) {
      console.error('Error loading transaction:', error);
      Alert.alert('Error', 'Failed to load transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!transaction || !user) return;

    const wasOnTime = !isOverdue(transaction.due_date);

    Alert.alert(
      'Mark as Paid',
      `Mark this transaction as fully paid?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await TransactionService.markAsPaid(transaction.id, user.id, wasOnTime);
              Alert.alert('Success', 'Transaction marked as paid');
              router.back();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to update transaction');
            }
          },
        },
      ]
    );
  };

  const handlePartialPayment = async () => {
    if (!transaction || !partialAmount) return;

    const amount = parseFloat(partialAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (amount + transaction.amount_paid > transaction.amount) {
      Alert.alert('Invalid Amount', 'Payment amount exceeds remaining balance');
      return;
    }

    try {
      await TransactionService.markAsPartiallyPaid(transaction.id, amount);
      Alert.alert('Success', 'Partial payment recorded');
      setShowPartialInput(false);
      setPartialAmount('');
      loadTransaction();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to record payment');
    }
  };

  const handleDelete = () => {
    if (!transaction) return;

    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await TransactionService.deleteTransaction(transaction.id);
              Alert.alert('Success', 'Transaction deleted');
              router.back();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return Colors.paid;
      case 'pending':
        return Colors.pending;
      case 'partial':
        return Colors.partial;
      case 'overdue':
        return Colors.overdue;
      default:
        return Colors.gray[500];
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.prosperlyBlue} />
        </View>
      </SafeAreaView>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Transaction not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const remainingAmount = transaction.amount - transaction.amount_paid;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.prosperlyNavy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={24} color={Colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <View style={[styles.statusBanner, { backgroundColor: getStatusColor(transaction.status) }]}>
          <Text style={styles.statusBannerText}>{transaction.status.toUpperCase()}</Text>
        </View>

        {/* Main Info Card */}
        <Card style={styles.mainCard}>
          <View style={styles.typeIcon}>
            <Ionicons
              name={transaction.type === 'lend' ? 'arrow-up' : 'arrow-down'}
              size={32}
              color={transaction.type === 'lend' ? Colors.prosperlyBlue : Colors.prosperlyMint}
            />
          </View>
          <Text style={styles.counterpartyName}>{transaction.counterparty_name}</Text>
          <Text style={styles.transactionType}>
            {transaction.type === 'lend' ? 'Lent to' : 'Borrowed from'}
          </Text>
          <Text style={styles.amount}>{formatCurrency(transaction.amount)}</Text>
        </Card>

        {/* Payment Progress */}
        {transaction.amount_paid > 0 && transaction.status !== 'paid' && (
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Payment Progress</Text>
              <Text style={styles.progressPercentage}>
                {((transaction.amount_paid / transaction.amount) * 100).toFixed(0)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(transaction.amount_paid / transaction.amount) * 100}%` },
                ]}
              />
            </View>
            <View style={styles.progressAmounts}>
              <Text style={styles.progressText}>Paid: {formatCurrency(transaction.amount_paid)}</Text>
              <Text style={styles.progressText}>Remaining: {formatCurrency(remainingAmount)}</Text>
            </View>
          </Card>
        )}

        {/* Details Card */}
        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color={Colors.gray[600]} />
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={styles.detailValue}>{formatDate(transaction.due_date)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="notifications-outline" size={20} color={Colors.gray[600]} />
            <Text style={styles.detailLabel}>Reminders</Text>
            <Text style={styles.detailValue}>
              {transaction.reminder_frequency === 'every_3_days'
                ? 'Every 3 Days'
                : transaction.reminder_frequency.charAt(0).toUpperCase() +
                  transaction.reminder_frequency.slice(1)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color={Colors.gray[600]} />
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailValue}>{formatDate(transaction.created_at)}</Text>
          </View>
        </Card>

        {/* Notes */}
        {transaction.notes && (
          <Card style={styles.notesCard}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{transaction.notes}</Text>
          </Card>
        )}

        {/* Actions */}
        {transaction.status !== 'paid' && (
          <View style={styles.actions}>
            {!showPartialInput ? (
              <>
                <Button
                  title="Mark as Paid"
                  onPress={handleMarkPaid}
                  variant="primary"
                  style={styles.actionButton}
                />
                <Button
                  title="Record Partial Payment"
                  onPress={() => setShowPartialInput(true)}
                  variant="outline"
                  style={styles.actionButton}
                />
              </>
            ) : (
              <View>
                <Input
                  label="Partial Payment Amount"
                  placeholder="Enter amount"
                  value={partialAmount}
                  onChangeText={setPartialAmount}
                  keyboardType="decimal-pad"
                  leftIcon="cash-outline"
                />
                <View style={styles.partialButtons}>
                  <Button
                    title="Cancel"
                    onPress={() => {
                      setShowPartialInput(false);
                      setPartialAmount('');
                    }}
                    variant="outline"
                    style={{ flex: 1 }}
                  />
                  <View style={{ width: 12 }} />
                  <Button
                    title="Confirm"
                    onPress={handlePartialPayment}
                    variant="primary"
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.prosperlySlate,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.prosperlyNavy,
  },
  deleteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray[600],
  },
  statusBanner: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBannerText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    letterSpacing: 1,
  },
  mainCard: {
    alignItems: 'center',
    padding: 32,
    marginBottom: 16,
  },
  typeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.prosperlySlate,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  counterpartyName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.prosperlyNavy,
  },
  transactionType: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray[600],
    marginTop: 4,
  },
  amount: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.prosperlyBlue,
    marginTop: 16,
  },
  progressCard: {
    padding: 20,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.prosperlyNavy,
  },
  progressPercentage: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.prosperlyBlue,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.prosperlyBlue,
  },
  progressAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray[600],
  },
  detailsCard: {
    padding: 20,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  detailLabel: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.gray[600],
    marginLeft: 12,
  },
  detailValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.prosperlyNavy,
  },
  notesCard: {
    padding: 20,
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.prosperlyNavy,
    marginBottom: 8,
  },
  notesText: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray[600],
    lineHeight: 22,
  },
  actions: {
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 12,
  },
  partialButtons: {
    flexDirection: 'row',
    marginTop: 16,
  },
});
