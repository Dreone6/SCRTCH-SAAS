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

// ============================================
// NEW LOAN MANAGEMENT TYPES
// ============================================

export type LoanStatus = 'draft' | 'active' | 'overdue' | 'paid' | 'cancelled';
export type RepaymentType = 'lump_sum' | 'split' | 'installments';
export type InstallmentStatus = 'pending' | 'overdue' | 'paid';
export type ReminderChannel = 'email' | 'sms' | 'in_app';
export type ReminderStatus = 'scheduled' | 'sent' | 'failed';

export interface Borrower {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  created_at: string;
}

export interface Loan {
  id: string;
  user_id: string;
  borrower_id: string;
  principal_amount: number;
  currency: string;
  interest_rate?: number;
  status: LoanStatus;
  start_date: string;
  final_due_date: string;
  repayment_type: RepaymentType;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Installment {
  id: string;
  loan_id: string;
  due_date: string;
  amount_due: number;
  amount_paid: number;
  status: InstallmentStatus;
  paid_at?: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  loan_id: string;
  installment_id?: string;
  channel: ReminderChannel;
  scheduled_for: string;
  sent_at?: string;
  status: ReminderStatus;
  message_preview?: string;
  created_at: string;
}

export interface BorrowerRating {
  id: string;
  borrower_id: string;
  user_id: string;
  score: number; // 1-5
  comment?: string;
  created_at: string;
}

export interface AgreementDocument {
  id: string;
  loan_id: string;
  document_text: string;
  generated_at: string;
}

// Extended types with joined data
export interface LoanWithBorrower extends Loan {
  borrower: Borrower;
  installments?: Installment[];
  agreement?: AgreementDocument;
}

export interface LoanSummary {
  loan_id: string;
  user_id: string;
  principal_amount: number;
  currency: string;
  interest_rate?: number;
  status: LoanStatus;
  start_date: string;
  final_due_date: string;
  repayment_type: RepaymentType;
  created_at: string;
  borrower_id: string;
  borrower_name: string;
  borrower_phone?: string;
  borrower_email?: string;
  total_installments: number;
  paid_installments: number;
  outstanding_amount: number;
}

// Dashboard stats for loans
export interface LoanDashboardStats {
  totalOutstanding: number;
  activeLoansCount: number;
  overdueCount: number;
  overdueAmount: number;
  upcomingInstallments: Installment[];
}

// Loan creation form data
export interface LoanFormData {
  borrower_id?: string;
  borrower_name?: string;
  borrower_phone?: string;
  borrower_email?: string;
  principal_amount: number;
  currency: string;
  interest_rate?: number;
  start_date: string;
  final_due_date: string;
  repayment_type: RepaymentType;
  installment_count?: number;
  notes?: string;
  reminder_days_before?: number;
  reminder_channels?: ReminderChannel[];
}
