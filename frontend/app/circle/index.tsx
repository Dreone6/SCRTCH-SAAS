import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { LoanService } from '../../src/services/loan.service';
import { Avatar } from '../../src/components/Avatar';
import { Colors } from '../../src/constants/colors';
import { Typography } from '../../src/constants/typography';
import { formatCurrency } from '../../src/utils/validators';
import { Borrower } from '../../src/types';

// "My Circle" -- ported from scrtch-mobile's BorrowersListScreen. Adapted to
// SCRTCH-SAAS's real schema: outstanding balance and trust score are computed
// from loans/installments/borrower_ratings (LoanService.getBorrowersWithStats),
// not read off denormalized fields that don't exist on the borrowers table.
type BorrowerWithStats = Borrower & { outstandingAmount: number; trustScore: number | null };

export default function CircleScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [borrowers, setBorrowers] = useState<BorrowerWithStats[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const data = await LoanService.getBorrowersWithStats(user.id);
      setBorrowers(data);
    } catch (error) {
      console.error('Failed to load circle:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filtered = borrowers.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Note: no per-borrower detail screen exists yet -- this card is
  // display-only for now rather than linking to a route that doesn't exist.
  const renderBorrower = ({ item }: { item: BorrowerWithStats }) => (
    <View style={styles.card}>
      <Avatar name={item.name} size={48} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        {item.relationship_type && (
          <Text style={styles.relation}>{item.relationship_type.replace('_', ' ')}</Text>
        )}
        {item.outstandingAmount > 0 && (
          <Text style={styles.outstanding}>Owes you {formatCurrency(item.outstandingAmount)}</Text>
        )}
      </View>
      {item.trustScore !== null && (
        <View style={styles.trust}>
          <Text style={styles.trustValue}>{item.trustScore.toFixed(1)}</Text>
          <Text style={styles.trustLabel}>Trust</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Circle</Text>
        <TouchableOpacity onPress={() => router.push('/circle/add')}>
          <Ionicons name="person-add" size={24} color={Colors.prosperlyBlue} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.gray[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor={Colors.gray[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filtered}
        renderItem={renderBorrower}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={40} color={Colors.gray[300]} />
              <Text style={styles.emptyTitle}>No contacts yet</Text>
              <Text style={styles.emptyDescription}>
                Add friends and family to track what they owe you
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.prosperlySlate },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.prosperlyNavy,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: Typography.fontSize.base,
    color: Colors.prosperlyNavy,
  },
  listContent: { paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: '600', color: Colors.prosperlyNavy },
  relation: { fontSize: 13, color: Colors.gray[500], textTransform: 'capitalize', marginTop: 2 },
  outstanding: { fontSize: 13, color: Colors.warning, fontWeight: '500', marginTop: 4 },
  trust: { alignItems: 'center', marginRight: 8 },
  trustValue: { fontSize: 16, fontWeight: '700', color: Colors.prosperlyBlue },
  trustLabel: { fontSize: 10, color: Colors.gray[400] },
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyTitle: { marginTop: 12, fontSize: 16, fontWeight: '600', color: Colors.prosperlyNavy },
  emptyDescription: { marginTop: 6, fontSize: 13, color: Colors.gray[500], textAlign: 'center' },
});
