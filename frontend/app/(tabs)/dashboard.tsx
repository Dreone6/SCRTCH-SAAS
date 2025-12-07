import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
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
import { DashboardStats, Transaction } from '../../src/types';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalLent: 0,
    totalBorrowed: 0,
    totalOutstanding: 0,
    overdueCount: 0,
    upcomingCount: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!user) return;

    try {
      const [dashboardStats, transactions] = await Promise.all([
        TransactionService.getDashboardStats(user.id),
        TransactionService.getUserTransactions(user.id),
      ]);

      setStats(dashboardStats);
      setRecentTransactions(transactions.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.prosperlyBlue} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={24} color={Colors.white} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Ionicons name="arrow-up-circle" size={32} color={Colors.prosperlyMint} />
            <Text style={styles.statValue}>{formatCurrency(stats.totalLent)}</Text>
            <Text style={styles.statLabel}>Total Lent</Text>
          </Card>

          <Card style={styles.statCard}>
            <Ionicons name="arrow-down-circle" size={32} color={Colors.warning} />
            <Text style={styles.statValue}>{formatCurrency(stats.totalBorrowed)}</Text>
            <Text style={styles.statLabel}>Total Borrowed</Text>
          </Card>
        </View>

        {/* Outstanding Amount */}
        <Card style={styles.outstandingCard}>
          <View style={styles.outstandingHeader}>
            <Text style={styles.outstandingLabel}>Total Outstanding</Text>
            <Ionicons name="wallet" size={24} color={Colors.prosperlyBlue} />
          </View>
          <Text style={styles.outstandingValue}>{formatCurrency(stats.totalOutstanding)}</Text>
        </Card>

        {/* Alerts */}
        {(stats.overdueCount > 0 || stats.upcomingCount > 0) && (
          <View style={styles.alertsContainer}>
            {stats.overdueCount > 0 && (
              <Card style={[styles.alertCard, { borderLeftColor: Colors.error }]}>
                <Ionicons name="alert-circle" size={24} color={Colors.error} />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>{stats.overdueCount} Overdue</Text>
                  <Text style={styles.alertText}>Action required</Text>
                </View>
              </Card>
            )}

            {stats.upcomingCount > 0 && (
              <Card style={[styles.alertCard, { borderLeftColor: Colors.warning }]}>
                <Ionicons name="time" size={24} color={Colors.warning} />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>{stats.upcomingCount} Upcoming</Text>
                  <Text style={styles.alertText}>Due this week</Text>
                </View>
              </Card>
            )}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors.prosperlyBlue }]}
              onPress={() => router.push('/(tabs)/add')}>
              <Ionicons name="arrow-up" size={24} color={Colors.white} />
              <Text style={styles.actionButtonText}>Lend Money</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors.prosperlyMint }]}
              onPress={() => router.push('/(tabs)/add')}>
              <Ionicons name="arrow-down" size={24} color={Colors.white} />
              <Text style={styles.actionButtonText}>Borrow Money</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="document-outline" size={48} color={Colors.gray[300]} />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>Start by adding your first transaction</Text>
            </Card>
          ) : (
            recentTransactions.map((transaction) => (
              <TouchableOpacity
                key={transaction.id}
                onPress={() => router.push(`/transaction/${transaction.id}`)}
              >
                <Card style={styles.transactionCard}>
                  <View style={styles.transactionIcon}>
                    <Ionicons
                      name={transaction.type === 'lend' ? 'arrow-up' : 'arrow-down'}
                      size={20}
                      color={transaction.type === 'lend' ? Colors.prosperlyBlue : Colors.prosperlyMint}
                    />
                  </View>
                  <View style={styles.transactionContent}>
                    <Text style={styles.transactionName}>{transaction.counterparty_name}</Text>
                    <Text style={styles.transactionType}>
                      {transaction.type === 'lend' ? 'Lent to' : 'Borrowed from'}
                    </Text>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={styles.transactionAmount}>{formatCurrency(transaction.amount)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(transaction.status) }]}>
                        {transaction.status}
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.prosperlySlate,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  greeting: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray[600],
  },
  userName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.prosperlyNavy,
    marginTop: 4,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.prosperlyBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.prosperlyNavy,
    marginTop: 12,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray[600],
    marginTop: 4,
  },
  outstandingCard: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 20,
    backgroundColor: Colors.prosperlyBlue,
  },
  outstandingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outstandingLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    opacity: 0.9,
  },
  outstandingValue: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    marginTop: 12,
  },
  alertsContainer: {
    paddingHorizontal: 24,
    marginTop: 16,
    gap: 12,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderLeftWidth: 4,
  },
  alertContent: {
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.prosperlyNavy,
  },
  alertText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray[600],
    marginTop: 2,
  },
  quickActions: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.prosperlyNavy,
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.white,
  },
  recentSection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.prosperlyBlue,
    fontWeight: Typography.fontWeight.medium,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.gray[600],
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray[500],
    marginTop: 4,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.prosperlySlate,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionContent: {
    flex: 1,
    marginLeft: 12,
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
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.prosperlyNavy,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
});
