// Temporary demo dashboard to view populated data
// Access at: /demo-dashboard

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createClient } from '@supabase/supabase-js';
import { Card } from '../src/components/Card';
import { Colors } from '../src/constants/colors';
import { Typography } from '../src/constants/typography';
import { formatCurrency } from '../src/utils/validators';
import { formatDate } from '../src/utils/dateHelpers';

const supabase = createClient(
  'https://nsrwbxsuqucvvstdrbkv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zcndieHN1cXVjdnZzdGRyYmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjQxOTQsImV4cCI6MjA4MDY0MDE5NH0.HGCg3QahxTSrRsphxu0SzH89bk-dARqUsINAtg3y-AA'
);

export default function DemoDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalLent: 0, totalBorrowed: 0, totalOutstanding: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Sign in as demo user
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: 'demo@prosperly.com',
        password: 'Demo123456!',
      });

      if (authData.user) {
        // Load transactions
        const { data: txData } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', authData.user.id)
          .order('created_at', { ascending: false });

        setTransactions(txData || []);

        // Calculate stats
        const totalLent = (txData || [])
          .filter(t => t.type === 'lend' && t.status !== 'paid')
          .reduce((sum, t) => sum + (t.amount - t.amount_paid), 0);

        const totalBorrowed = (txData || [])
          .filter(t => t.type === 'borrow' && t.status !== 'paid')
          .reduce((sum, t) => sum + (t.amount - t.amount_paid), 0);

        setStats({
          totalLent,
          totalBorrowed,
          totalOutstanding: totalLent + totalBorrowed,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return Colors.paid;
      case 'pending': return Colors.pending;
      case 'partial': return Colors.partial;
      case 'overdue': return Colors.overdue;
      default: return Colors.gray[500];
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading demo data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>DEMO DASHBOARD</Text>
            <Text style={styles.subtitle}>Populated with sample data</Text>
          </View>
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
            <Ionicons name="wallet" size={24} color={Colors.white} />
          </View>
          <Text style={styles.outstandingValue}>{formatCurrency(stats.totalOutstanding)}</Text>
        </Card>

        {/* Transactions */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>All Transactions ({transactions.length})</Text>

          {transactions.map((transaction) => (
            <Card key={transaction.id} style={styles.transactionCard}>
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
                <Text style={styles.transactionDate}>{formatDate(transaction.due_date)}</Text>
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
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ✅ Dashboard populated with demo data
          </Text>
          <Text style={styles.footerSubtext}>
            Now you can design your Figma/Stitch screens!
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray[600],
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.prosperlyBlue,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray[600],
    marginTop: 4,
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
  transactionsSection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.prosperlyNavy,
    marginBottom: 16,
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
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.prosperlyMint,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray[600],
    textAlign: 'center',
    marginTop: 8,
  },
});
