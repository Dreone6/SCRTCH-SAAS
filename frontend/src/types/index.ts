// Prosperly Type Definitions

export type TransactionType = 'lend' | 'borrow';

export type TransactionStatus = 'pending' | 'partial' | 'paid' | 'overdue';

export type ReminderFrequency = 'daily' | 'every_3_days' | 'weekly' | 'off';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  total_payments: number;
  on_time_payments: number;
  created_at: string;
}

export interface InstallmentPlan {
  frequency: 'weekly' | 'biweekly' | 'monthly';
  amount_per_installment: number;
  total_installments: number;
  paid_installments: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  counterparty_name: string;
  type: TransactionType;
  amount: number;
  amount_paid: number;
  due_date: string;
  installment_plan?: InstallmentPlan;
  reminder_frequency: ReminderFrequency;
  status: TransactionStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalLent: number;
  totalBorrowed: number;
  totalOutstanding: number;
  overdueCount: number;
  upcomingCount: number;
}

export interface ProsperlyRating {
  stars: number;
  label: string;
  ratio: number;
}
