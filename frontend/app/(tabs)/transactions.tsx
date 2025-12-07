import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { TransactionService } from '../../src/services/transaction.service';
import { Card } from '../../src/components/Card';
import { Colors } from '../../src/constants/colors';
import { Typography } from '../../src/constants/typography';
import { formatCurrency } from '../../src/utils/validators';
import { formatDate } from '../../src/utils/dateHelpers';
import { Transaction } from '../../src/types';

export default function TransactionsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'lend' | 'borrow'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTransactions = async () => {
    if (!user) return;

    try {
      const data = await TransactionService.getUserTransactions(user.id);
      setTransactions(data);
      applyFilter(data, filter);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = (data: Transaction[], filterType: 'all' | 'lend' | 'borrow') => {
    if (filterType === 'all') {
      setFilteredTransactions(data);
    } else {
      setFilteredTransactions(data.filter(t => t.type === filterType));
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  const handleFilterChange = (newFilter: 'all' | 'lend' | 'borrow') => {
    setFilter(newFilter);
    applyFilter(transactions, newFilter);
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

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity onPress={() => router.push(`/transaction/${item.id}`)}>
      <Card style={styles.transactionCard}>
        <View style={styles.transactionIcon}>
          <Ionicons
            name={item.type === 'lend' ? 'arrow-up' : 'arrow-down'}
            size={24}
            color={item.type === 'lend' ? Colors.prosperlyBlue : Colors.prosperlyMint}
          />
        </View>
        <View style={styles.transactionContent}>
          <Text style={styles.transactionName}>{item.counterparty_name}</Text>
          <Text style={styles.transactionType}>
            {item.type === 'lend' ? 'Lent to' : 'Borrowed from'}
          </Text>
          <Text style={styles.transactionDate}>{formatDate(item.due_date)}</Text>
        </View>
        <View style={styles.transactionRight}>
          <Text style={styles.transactionAmount}>{formatCurrency(item.amount)}</Text>
          {item.amount_paid > 0 && item.amount_paid < item.amount && (
            <Text style={styles.paidAmount}>Paid: {formatCurrency(item.amount_paid)}</Text>
          )}
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => handleFilterChange('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'lend' && styles.filterButtonActive]}
          onPress={() => handleFilterChange('lend')}
        >
          <Text style={[styles.filterText, filter === 'lend' && styles.filterTextActive]}>Lent</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'borrow' && styles.filterButtonActive]}
          onPress={() => handleFilterChange('borrow')}
        >
          <Text style={[styles.filterText, filter === 'borrow' && styles.filterTextActive]}>Borrowed</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.prosperlyBlue} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color={Colors.gray[300]} />
            <Text style={styles.emptyText}>No transactions found</Text>
            <Text style={styles.emptySubtext}>Start by adding a transaction</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.prosperlySlate,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.prosperlyNavy,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.prosperlyBlue,
  },
  filterText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.gray[600],
  },
  filterTextActive: {
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.prosperlySlate,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionContent: {
    flex: 1,
    marginLeft: 16,
  },
  transactionName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.prosperlyNavy,
  },
  transactionType: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray[600],
    marginTop: 2,
  },
  transactionDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.gray[500],
    marginTop: 4,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.prosperlyNavy,
  },
  paidAmount: {
    fontSize: Typography.fontSize.xs,
    color: Colors.gray[500],
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.gray[600],
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray[500],
    marginTop: 8,
  },
});
