import { supabase } from './supabase';
import type {
  ConversationMessage,
  LennyConversationSummary,
  MessageTone,
  MessageSender,
  MessageType,
} from '../types';

// Lenny: the AI reminder-messaging assistant.
// Backed by the existing `conversation_history` + `message_templates` tables
// (see frontend/supabase-ai-messaging-extension.sql) and the `loans` /
// `borrowers` tables (see frontend/supabase-loans-schema.sql). This service
// was adapted from the standalone `scrtch-mobile` prototype's lenny.ts,
// which targeted a different (unused) `lenny_conversations` / `lenny_messages`
// schema -- this version targets SCRTCH-SAAS's actual, already-deployed schema.
export class LennyService {
  // One row per loan that has at least one conversation_history entry,
  // enriched with borrower + loan info, sorted by most recent message.
  static async getConversations(userId: string): Promise<LennyConversationSummary[]> {
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select('*, borrower:borrowers(*)')
      .eq('user_id', userId);

    if (loansError) throw loansError;
    if (!loans || loans.length === 0) return [];

    const loanIds = loans.map((l: any) => l.id);

    const { data: messages, error: messagesError } = await supabase
      .from('conversation_history')
      .select('*')
      .in('loan_id', loanIds)
      .order('created_at', { ascending: false });

    if (messagesError) throw messagesError;

    const lastMessageByLoan = new Map<string, any>();
    for (const m of messages || []) {
      if (!lastMessageByLoan.has(m.loan_id)) {
        lastMessageByLoan.set(m.loan_id, m);
      }
    }

    return loans
      .filter((loan: any) => lastMessageByLoan.has(loan.id))
      .map((loan: any) => {
        const lastMessage = lastMessageByLoan.get(loan.id);
        return {
          loanId: loan.id,
          borrower: loan.borrower,
          loan,
          lastMessage: lastMessage.message,
          lastMessageAt: lastMessage.created_at,
          lastMessageSender: lastMessage.sender,
        } as LennyConversationSummary;
      })
      .sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1));
  }

  static async getMessages(loanId: string): Promise<ConversationMessage[]> {
    const { data, error } = await supabase
      .from('conversation_history')
      .select('*')
      .eq('loan_id', loanId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async logMessage(
    loanId: string,
    message: string,
    messageType: MessageType,
    sender: MessageSender,
    tone?: MessageTone
  ): Promise<ConversationMessage> {
    const { data, error } = await supabase
      .from('conversation_history')
      .insert({ loan_id: loanId, message, message_type: messageType, sender, tone })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Suggest a reminder message using the pre-seeded message_templates table,
  // matched on relationship type, tone, and how overdue the loan is.
  static async suggestReminder(
    relationshipType: string,
    tone: MessageTone,
    daysOverdueRange: string
  ): Promise<string | null> {
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .eq('relationship_type', relationshipType)
      .eq('tone', tone)
      .eq('days_overdue_range', daysOverdueRange)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data?.template_text ?? null;
  }
}
