import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LennyService } from '../../src/services/lenny.service';
import { LoanService } from '../../src/services/loan.service';
import { Colors } from '../../src/constants/colors';
import { ConversationMessage, LoanWithBorrower } from '../../src/types';

// Conversation thread for a single loan. Linked from app/(tabs)/lenny.tsx.
// Sending a message here logs it to conversation_history as sender: 'lender';
// it does not (yet) call an AI-generation edge function -- see
// LennyService.suggestReminder for the template-based suggestion path, wired
// up as a quick-insert action rather than a live model call, since no
// generation edge function is deployed for this schema yet.
export default function ConversationScreen() {
  const { loanId } = useLocalSearchParams<{ loanId: string }>();
  const router = useRouter();
  const [loan, setLoan] = useState<LoanWithBorrower | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!loanId) return;
    try {
      const [loanData, messageData] = await Promise.all([
        LoanService.getLoanById(loanId),
        LennyService.getMessages(loanId),
      ]);
      setLoan(loanData);
      setMessages(messageData);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setLoading(false);
    }
  }, [loanId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleSend = async () => {
    if (!draft.trim() || !loanId) return;
    setSending(true);
    try {
      const message = await LennyService.logMessage(loanId, draft.trim(), 'reminder', 'lender');
      setMessages((prev) => [...prev, message]);
      setDraft('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSuggest = async () => {
    if (!loan?.borrower.relationship_type) return;
    try {
      const suggestion = await LennyService.suggestReminder(
        loan.borrower.relationship_type,
        'friendly',
        '1_to_3'
      );
      if (suggestion) setDraft(suggestion);
    } catch (error) {
      console.error('Failed to fetch suggestion:', error);
    }
  };

  const renderMessage = ({ item }: { item: ConversationMessage }) => (
    <View
      style={[
        styles.bubble,
        item.sender === 'lender' ? styles.bubbleOutgoing : styles.bubbleIncoming,
      ]}
    >
      <Text style={item.sender === 'lender' ? styles.bubbleTextOutgoing : styles.bubbleTextIncoming}>
        {item.message}
      </Text>
      <Text style={styles.bubbleTime}>{new Date(item.created_at).toLocaleString()}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{loan?.borrower?.name || 'Conversation'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>No messages yet. Send the first reminder below.</Text>
          ) : null
        }
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.composer}>
          <TouchableOpacity style={styles.suggestButton} onPress={handleSuggest}>
            <Ionicons name="sparkles" size={18} color={Colors.info} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Write a reminder..."
            placeholderTextColor={Colors.textQuaternary}
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={sending || !draft.trim()}>
            <Ionicons name="send" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBackground },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.white },
  listContent: { padding: 16, flexGrow: 1 },
  emptyText: { color: Colors.textQuaternary, textAlign: 'center', marginTop: 40 },
  bubble: { maxWidth: '80%', borderRadius: 18, padding: 12, marginBottom: 10 },
  bubbleOutgoing: { backgroundColor: Colors.info, alignSelf: 'flex-end' },
  bubbleIncoming: { backgroundColor: Colors.darkSurface, alignSelf: 'flex-start' },
  bubbleTextOutgoing: { color: Colors.white, fontSize: 14 },
  bubbleTextIncoming: { color: Colors.white, fontSize: 14 },
  bubbleTime: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
  },
  suggestButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.info}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.darkSurface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: Colors.white,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.info,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
