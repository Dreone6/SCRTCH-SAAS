import React, { useCallback, useState } from 'react';
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
import { LennyService } from '../../src/services/lenny.service';
import { Colors } from '../../src/constants/colors';
import { formatCurrency } from '../../src/utils/validators';
import { LennyConversationSummary } from '../../src/types';

// "Lenny" -- the AI reminder-message assistant.
// Design language ported from the SCRTCH_APP_SCREENS_FINAL (AI Studio /
// Gemini) mockup: dark navy background, rounded 24-28px cards, blue accent.
// Data layer wired to SCRTCH-SAAS's real schema (loans / borrowers /
// conversation_history) rather than the standalone prototype's unused tables.
export default function LennyScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<LennyConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const data = await LennyService.getConversations(user.id);
      setConversations(data);
    } catch (error) {
      console.error('Failed to load Lenny conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations])
  );

  const statusDot = (item: LennyConversationSummary) => {
    const status = item.loan?.status;
    if (status === 'overdue') return Colors.error;
    if (status === 'active') return Colors.success;
    return Colors.warning;
  };

  const renderConversation = ({ item }: { item: LennyConversationSummary }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/lenny/${item.loanId}` as any)}
    >
      <View style={styles.cardTop}>
        <View style={[styles.statusDot, { backgroundColor: statusDot(item) }]} />
        <Text style={styles.borrowerName} numberOfLines={1}>
          {item.borrower?.name || 'Unknown'}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(item.lastMessageAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.amount}>
        {formatCurrency(item.loan?.principal_amount || 0)}
      </Text>
      <Text style={styles.lastMessage} numberOfLines={1}>
        {item.lastMessageSender === 'lender' ? 'You: ' : ''}
        {item.lastMessage}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.lennyIcon}>
            <Ionicons name="sparkles" size={18} color={Colors.info} />
          </View>
          <Text style={styles.headerTitle}>Lenny</Text>
        </View>
      </View>

      <View style={styles.introBanner}>
        <Ionicons name="sparkles" size={16} color={Colors.info} />
        <Text style={styles.introBannerText}>
          AI-drafted reminders for every loan, in the tone you choose
        </Text>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.loanId}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadConversations();
            }}
            tintColor={Colors.white}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={40} color={Colors.textQuaternary} />
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptyDescription}>
                Once you send a reminder on a loan, the conversation shows up here.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lennyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.info}22`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
  },
  introBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: `${Colors.info}15`,
  },
  introBannerText: {
    marginLeft: 8,
    fontSize: 13,
    color: Colors.info,
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexGrow: 1,
  },
  card: {
    backgroundColor: Colors.darkSurface,
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  borrowerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  timestamp: {
    fontSize: 11,
    color: Colors.textQuaternary,
  },
  amount: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.info,
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  emptyDescription: {
    marginTop: 6,
    fontSize: 13,
    color: Colors.textQuaternary,
    textAlign: 'center',
  },
});
