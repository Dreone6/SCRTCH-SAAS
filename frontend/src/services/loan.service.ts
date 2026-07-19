import { supabase } from './supabase';
import {
  Loan,
  Borrower,
  Installment,
  Reminder,
  AgreementDocument,
  LoanWithBorrower,
  LoanFormData,
  LoanDashboardStats,
  RepaymentType,
} from '../types';

export class LoanService {
  // ============================================
  // BORROWER OPERATIONS
  // ============================================

  static async getBorrowers(userId: string): Promise<Borrower[]> {
    const { data, error } = await supabase
      .from('borrowers')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async createBorrower(borrower: Omit<Borrower, 'id' | 'created_at'>): Promise<Borrower> {
    const { data, error } = await supabase
      .from('borrowers')
      .insert(borrower)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateBorrower(id: string, updates: Partial<Borrower>): Promise<Borrower> {
    const { data, error } = await supabase
      .from('borrowers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Borrowers enriched with computed stats (outstanding balance from loans/
  // installments, trust score average from borrower_ratings) for the Circle
  // screen. None of these fields are denormalized on the borrowers table --
  // they are computed here rather than assumed to exist.
  static async getBorrowersWithStats(userId: string): Promise<Array<Borrower & { outstandingAmount: number; trustScore: number | null }>> {
    const borrowers = await this.getBorrowers(userId);
    if (borrowers.length === 0) return [];

    const borrowerIds = borrowers.map((b) => b.id);

    const [{ data: loans, error: loansError }, { data: ratings, error: ratingsError }] = await Promise.all([
      supabase
        .from('loans')
        .select('id, borrower_id, principal_amount')
        .in('borrower_id', borrowerIds)
        .eq('user_id', userId),
      supabase
        .from('borrower_ratings')
        .select('borrower_id, score')
        .in('borrower_id', borrowerIds)
        .eq('user_id', userId),
    ]);

    if (loansError) throw loansError;
    if (ratingsError) throw ratingsError;

    const loanIds = (loans || []).map((l: any) => l.id);
    const { data: installments, error: installmentsError } = loanIds.length
      ? await supabase.from('installments').select('loan_id, amount_due, amount_paid').in('loan_id', loanIds)
      : { data: [], error: null };

    if (installmentsError) throw installmentsError;

    const outstandingByLoan = new Map<string, number>();
    for (const inst of installments || []) {
      const remaining = Number(inst.amount_due) - Number(inst.amount_paid);
      outstandingByLoan.set(inst.loan_id, (outstandingByLoan.get(inst.loan_id) || 0) + Math.max(remaining, 0));
    }

    const outstandingByBorrower = new Map<string, number>();
    for (const loan of loans || []) {
      const loanOutstanding = outstandingByLoan.get(loan.id) ?? Number(loan.principal_amount);
      outstandingByBorrower.set(
        loan.borrower_id,
        (outstandingByBorrower.get(loan.borrower_id) || 0) + loanOutstanding
      );
    }

    const ratingsByBorrower = new Map<string, number[]>();
    for (const r of ratings || []) {
      const list = ratingsByBorrower.get(r.borrower_id) || [];
      list.push(r.score);
      ratingsByBorrower.set(r.borrower_id, list);
    }

    return borrowers.map((b) => {
      const scores = ratingsByBorrower.get(b.id);
      return {
        ...b,
        outstandingAmount: outstandingByBorrower.get(b.id) || 0,
        trustScore: scores && scores.length ? scores.reduce((a, c) => a + c, 0) / scores.length : null,
      };
    });
  }

  // ============================================
  // LOAN OPERATIONS
  // ============================================

  static async getLoans(userId: string): Promise<LoanWithBorrower[]> {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        borrower:borrowers(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getLoanById(loanId: string): Promise<LoanWithBorrower | null> {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        borrower:borrowers(*),
        installments(*),
        agreement:agreement_documents(*)
      `)
      .eq('id', loanId)
      .single();

    if (error) throw error;
    return data;
  }

  static async createLoan(formData: LoanFormData, userId: string): Promise<LoanWithBorrower> {
    // Step 1: Create or get borrower
    let borrowerId = formData.borrower_id;
    
    if (!borrowerId && formData.borrower_name) {
      const newBorrower = await this.createBorrower({
        user_id: userId,
        name: formData.borrower_name,
        phone: formData.borrower_phone,
        email: formData.borrower_email,
      });
      borrowerId = newBorrower.id;
    }

    if (!borrowerId) {
      throw new Error('Borrower ID is required');
    }

    // Step 2: Create loan
    const loanData = {
      user_id: userId,
      borrower_id: borrowerId,
      principal_amount: formData.principal_amount,
      currency: formData.currency || 'USD',
      interest_rate: formData.interest_rate,
      status: 'active' as const,
      start_date: formData.start_date,
      final_due_date: formData.final_due_date,
      repayment_type: formData.repayment_type,
      notes: formData.notes,
    };

    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .insert(loanData)
      .select()
      .single();

    if (loanError) throw loanError;

    // Step 3: Create installments
    const installments = this.calculateInstallments(
      loan.id,
      formData.principal_amount,
      formData.repayment_type,
      formData.start_date,
      formData.final_due_date,
      formData.installment_count
    );

    const { error: installmentsError } = await supabase
      .from('installments')
      .insert(installments);

    if (installmentsError) throw installmentsError;

    // Step 4: Create agreement document
    const { data: borrower } = await supabase
      .from('borrowers')
      .select('*')
      .eq('id', borrowerId)
      .single();

    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single();

    const agreementText = this.generateAgreementText(
      loan,
      borrower,
      profile?.name || 'Lender',
      installments.length
    );

    await supabase
      .from('agreement_documents')
      .insert({
        loan_id: loan.id,
        document_text: agreementText,
      });

    // Step 5: Create reminders if specified
    if (formData.reminder_days_before && formData.reminder_channels) {
      await this.createRemindersForLoan(
        loan.id,
        installments,
        formData.reminder_days_before,
        formData.reminder_channels
      );
    }

    // Return the complete loan with borrower
    return await this.getLoanById(loan.id) as LoanWithBorrower;
  }

  static calculateInstallments(
    loanId: string,
    principalAmount: number,
    repaymentType: RepaymentType,
    startDate: string,
    finalDueDate: string,
    installmentCount?: number
  ): Omit<Installment, 'id' | 'created_at' | 'amount_paid' | 'status' | 'paid_at'>[] {
    const installments: Omit<Installment, 'id' | 'created_at' | 'amount_paid' | 'status' | 'paid_at'>[] = [];

    if (repaymentType === 'lump_sum') {
      // Single payment on final due date
      installments.push({
        loan_id: loanId,
        due_date: finalDueDate,
        amount_due: principalAmount,
      });
    } else if (repaymentType === 'split') {
      // Two equal payments
      const amountPerInstallment = principalAmount / 2;
      const start = new Date(startDate);
      const end = new Date(finalDueDate);
      const midpoint = new Date((start.getTime() + end.getTime()) / 2);

      installments.push(
        {
          loan_id: loanId,
          due_date: midpoint.toISOString().split('T')[0],
          amount_due: amountPerInstallment,
        },
        {
          loan_id: loanId,
          due_date: finalDueDate,
          amount_due: amountPerInstallment,
        }
      );
    } else if (repaymentType === 'installments' && installmentCount) {
      // Multiple equal installments
      const amountPerInstallment = principalAmount / installmentCount;
      const start = new Date(startDate);
      const end = new Date(finalDueDate);
      const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      const daysBetween = totalDays / installmentCount;

      for (let i = 0; i < installmentCount; i++) {
        const dueDate = new Date(start);
        dueDate.setDate(dueDate.getDate() + Math.round(daysBetween * (i + 1)));

        installments.push({
          loan_id: loanId,
          due_date: dueDate.toISOString().split('T')[0],
          amount_due: amountPerInstallment,
        });
      }
    }

    return installments;
  }

  static generateAgreementText(
    loan: Loan,
    borrower: Borrower,
    lenderName: string,
    installmentCount: number
  ): string {
    const interestText = loan.interest_rate
      ? `${loan.interest_rate}% per annum`
      : 'no interest';

    return `PROSPERLY LOAN AGREEMENT

On ${loan.start_date}, ${lenderName} agrees that ${borrower.name} owes ${loan.currency} ${loan.principal_amount.toFixed(2)}.

The agreed repayment type is ${loan.repayment_type.replace('_', ' ')} with ${installmentCount} installment(s) due between ${loan.start_date} and ${loan.final_due_date}.

The agreed interest rate is ${interestText}.

Reminders may be sent before due dates to help ensure timely payments.

This is an informal record stored in Prosperly for tracking purposes only. This document does not constitute a legally binding contract.

Generated on ${new Date().toISOString().split('T')[0]} via Prosperly App.`;
  }

  static async createRemindersForLoan(
    loanId: string,
    installments: any[],
    daysBefore: number,
    channels: string[]
  ): Promise<void> {
    const reminders: any[] = [];

    installments.forEach(installment => {
      const dueDate = new Date(installment.due_date);
      const reminderDate = new Date(dueDate);
      reminderDate.setDate(reminderDate.getDate() - daysBefore);

      channels.forEach(channel => {
        reminders.push({
          loan_id: loanId,
          installment_id: installment.id,
          channel,
          scheduled_for: reminderDate.toISOString(),
          status: 'scheduled',
          message_preview: `Payment of ${installment.amount_due} due in ${daysBefore} days`,
        });
      });
    });

    if (reminders.length > 0) {
      await supabase.from('reminders').insert(reminders);
    }
  }

  // ============================================
  // INSTALLMENT OPERATIONS
  // ============================================

  static async getInstallmentsForLoan(loanId: string): Promise<Installment[]> {
    const { data, error } = await supabase
      .from('installments')
      .select('*')
      .eq('loan_id', loanId)
      .order('due_date');

    if (error) throw error;
    return data || [];
  }

  static async markInstallmentAsPaid(
    installmentId: string,
    amountPaid: number
  ): Promise<Installment> {
    const { data, error } = await supabase
      .from('installments')
      .update({
        amount_paid: amountPaid,
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', installmentId)
      .select()
      .single();

    if (error) throw error;

    // Check if all installments for this loan are paid
    const { data: installments } = await supabase
      .from('installments')
      .select('*')
      .eq('loan_id', data.loan_id);

    const allPaid = installments?.every(inst => inst.status === 'paid');

    if (allPaid) {
      // Mark loan as paid
      await supabase
        .from('loans')
        .update({ status: 'paid' })
        .eq('id', data.loan_id);
    }

    return data;
  }

  // ============================================
  // DASHBOARD STATS
  // ============================================

  static async getDashboardStats(userId: string): Promise<LoanDashboardStats> {
    // Get all active loans with installments
    const { data: loans } = await supabase
      .from('loans')
      .select(`
        *,
        installments(*)
      `)
      .eq('user_id', userId)
      .in('status', ['active', 'overdue']);

    if (!loans) {
      return {
        totalOutstanding: 0,
        activeLoansCount: 0,
        overdueCount: 0,
        overdueAmount: 0,
        upcomingInstallments: [],
      };
    }

    const allInstallments: Installment[] = loans.flatMap(loan => loan.installments || []);
    
    const unpaidInstallments = allInstallments.filter(inst => inst.status !== 'paid');
    const overdueInstallments = allInstallments.filter(inst => inst.status === 'overdue');

    const totalOutstanding = unpaidInstallments.reduce(
      (sum, inst) => sum + (inst.amount_due - inst.amount_paid),
      0
    );

    const overdueAmount = overdueInstallments.reduce(
      (sum, inst) => sum + (inst.amount_due - inst.amount_paid),
      0
    );

    // Get upcoming installments (next 5, sorted by due date)
    const upcomingInstallments = unpaidInstallments
      .filter(inst => inst.status === 'pending')
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 5);

    return {
      totalOutstanding,
      activeLoansCount: loans.filter(l => l.status === 'active').length,
      overdueCount: overdueInstallments.length,
      overdueAmount,
      upcomingInstallments,
    };
  }

  // ============================================
  // REMINDER OPERATIONS
  // ============================================

  static async createReminder(
    loanId: string,
    installmentId: string,
    channel: string,
    scheduledFor: string,
    messagePreview: string
  ): Promise<Reminder> {
    const { data, error } = await supabase
      .from('reminders')
      .insert({
        loan_id: loanId,
        installment_id: installmentId,
        channel,
        scheduled_for: scheduledFor,
        status: 'scheduled',
        message_preview: messagePreview,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
