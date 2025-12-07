import { supabase } from './supabase';
import { Transaction, TransactionStatus } from '../types';

export class TransactionService {
  // Create new transaction
  static async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get all transactions for a user
  static async getUserTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get transaction by ID
  static async getTransaction(id: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Update transaction
  static async updateTransaction(id: string, updates: Partial<Transaction>) {
    const { data, error } = await supabase
      .from('transactions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete transaction
  static async deleteTransaction(id: string) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Mark transaction as paid
  static async markAsPaid(id: string, userId: string, wasOnTime: boolean) {
    const transaction = await this.getTransaction(id);
    if (!transaction) throw new Error('Transaction not found');

    // Update transaction status
    await this.updateTransaction(id, {
      status: 'paid',
      amount_paid: transaction.amount,
    });

    // Update user's payment stats
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_payments, on_time_payments')
      .eq('id', userId)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({
          total_payments: profile.total_payments + 1,
          on_time_payments: profile.on_time_payments + (wasOnTime ? 1 : 0),
        })
        .eq('id', userId);
    }
  }

  // Mark as partially paid
  static async markAsPartiallyPaid(id: string, amountPaid: number) {
    const transaction = await this.getTransaction(id);
    if (!transaction) throw new Error('Transaction not found');

    const newAmountPaid = transaction.amount_paid + amountPaid;
    const status: TransactionStatus = newAmountPaid >= transaction.amount ? 'paid' : 'partial';

    await this.updateTransaction(id, {
      status,
      amount_paid: newAmountPaid,
    });
  }

  // Get dashboard stats
  static async getDashboardStats(userId: string) {
    const transactions = await this.getUserTransactions(userId);

    const totalLent = transactions
      .filter(t => t.type === 'lend' && t.status !== 'paid')
      .reduce((sum, t) => sum + (t.amount - t.amount_paid), 0);

    const totalBorrowed = transactions
      .filter(t => t.type === 'borrow' && t.status !== 'paid')
      .reduce((sum, t) => sum + (t.amount - t.amount_paid), 0);

    const totalOutstanding = totalLent + totalBorrowed;

    const overdueCount = transactions.filter(t => t.status === 'overdue').length;

    const today = new Date();
    const upcomingCount = transactions.filter(t => {
      const dueDate = new Date(t.due_date);
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return t.status === 'pending' && daysUntilDue <= 7 && daysUntilDue >= 0;
    }).length;

    return {
      totalLent,
      totalBorrowed,
      totalOutstanding,
      overdueCount,
      upcomingCount,
    };
  }
}
