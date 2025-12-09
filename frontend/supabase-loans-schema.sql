-- Prosperly Core Loan Management Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. BORROWERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.borrowers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_borrowers_user_id ON public.borrowers(user_id);

-- RLS Policies
ALTER TABLE public.borrowers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own borrowers"
    ON public.borrowers FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own borrowers"
    ON public.borrowers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own borrowers"
    ON public.borrowers FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own borrowers"
    ON public.borrowers FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 2. LOANS TABLE
-- ============================================
CREATE TYPE loan_status AS ENUM ('draft', 'active', 'overdue', 'paid', 'cancelled');
CREATE TYPE repayment_type AS ENUM ('lump_sum', 'split', 'installments');

CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    borrower_id UUID NOT NULL REFERENCES public.borrowers(id) ON DELETE CASCADE,
    principal_amount NUMERIC(15, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    interest_rate NUMERIC(5, 2), -- percentage
    status loan_status NOT NULL DEFAULT 'draft',
    start_date DATE NOT NULL,
    final_due_date DATE NOT NULL,
    repayment_type repayment_type NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON public.loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_borrower_id ON public.loans(borrower_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON public.loans(status);

-- RLS Policies
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own loans"
    ON public.loans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loans"
    ON public.loans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loans"
    ON public.loans FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loans"
    ON public.loans FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 3. INSTALLMENTS TABLE
-- ============================================
CREATE TYPE installment_status AS ENUM ('pending', 'overdue', 'paid');

CREATE TABLE IF NOT EXISTS public.installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    amount_due NUMERIC(15, 2) NOT NULL,
    amount_paid NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status installment_status NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_installments_loan_id ON public.installments(loan_id);
CREATE INDEX IF NOT EXISTS idx_installments_due_date ON public.installments(due_date);
CREATE INDEX IF NOT EXISTS idx_installments_status ON public.installments(status);

-- RLS Policies
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view installments for their loans"
    ON public.installments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.loans
            WHERE loans.id = installments.loan_id
            AND loans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert installments for their loans"
    ON public.installments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.loans
            WHERE loans.id = installments.loan_id
            AND loans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update installments for their loans"
    ON public.installments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.loans
            WHERE loans.id = installments.loan_id
            AND loans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete installments for their loans"
    ON public.installments FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.loans
            WHERE loans.id = installments.loan_id
            AND loans.user_id = auth.uid()
        )
    );

-- ============================================
-- 4. REMINDERS TABLE
-- ============================================
CREATE TYPE reminder_channel AS ENUM ('email', 'sms', 'in_app');
CREATE TYPE reminder_status AS ENUM ('scheduled', 'sent', 'failed');

CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
    installment_id UUID REFERENCES public.installments(id) ON DELETE CASCADE,
    channel reminder_channel NOT NULL,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    status reminder_status NOT NULL DEFAULT 'scheduled',
    message_preview TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reminders_loan_id ON public.reminders(loan_id);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_for ON public.reminders(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON public.reminders(status);

-- RLS Policies
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reminders for their loans"
    ON public.reminders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.loans
            WHERE loans.id = reminders.loan_id
            AND loans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert reminders for their loans"
    ON public.reminders FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.loans
            WHERE loans.id = reminders.loan_id
            AND loans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update reminders for their loans"
    ON public.reminders FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.loans
            WHERE loans.id = reminders.loan_id
            AND loans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete reminders for their loans"
    ON public.reminders FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.loans
            WHERE loans.id = reminders.loan_id
            AND loans.user_id = auth.uid()
        )
    );

-- ============================================
-- 5. BORROWER RATINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.borrower_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    borrower_id UUID NOT NULL REFERENCES public.borrowers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(borrower_id, user_id) -- One rating per borrower per user
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_borrower_ratings_borrower_id ON public.borrower_ratings(borrower_id);
CREATE INDEX IF NOT EXISTS idx_borrower_ratings_user_id ON public.borrower_ratings(user_id);

-- RLS Policies
ALTER TABLE public.borrower_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ratings"
    ON public.borrower_ratings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ratings"
    ON public.borrower_ratings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
    ON public.borrower_ratings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
    ON public.borrower_ratings FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 6. AGREEMENT DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.agreement_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
    document_text TEXT NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agreement_documents_loan_id ON public.agreement_documents(loan_id);

-- RLS Policies
ALTER TABLE public.agreement_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view agreements for their loans"
    ON public.agreement_documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.loans
            WHERE loans.id = agreement_documents.loan_id
            AND loans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert agreements for their loans"
    ON public.agreement_documents FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.loans
            WHERE loans.id = agreement_documents.loan_id
            AND loans.user_id = auth.uid()
        )
    );

-- ============================================
-- 7. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update loan updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for loans table
DROP TRIGGER IF EXISTS update_loans_updated_at ON public.loans;
CREATE TRIGGER update_loans_updated_at
    BEFORE UPDATE ON public.loans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-update installment status based on due date
CREATE OR REPLACE FUNCTION update_installment_status()
RETURNS void AS $$
BEGIN
    -- Mark pending installments as overdue if past due date
    UPDATE public.installments
    SET status = 'overdue'
    WHERE status = 'pending'
    AND due_date < CURRENT_DATE;
    
    -- Update loan status to overdue if any installment is overdue
    UPDATE public.loans
    SET status = 'overdue'
    WHERE status = 'active'
    AND EXISTS (
        SELECT 1 FROM public.installments
        WHERE installments.loan_id = loans.id
        AND installments.status = 'overdue'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. USEFUL VIEWS
-- ============================================

-- View for loan summary with borrower info
CREATE OR REPLACE VIEW loan_summary AS
SELECT 
    l.id as loan_id,
    l.user_id,
    l.principal_amount,
    l.currency,
    l.interest_rate,
    l.status,
    l.start_date,
    l.final_due_date,
    l.repayment_type,
    l.created_at,
    b.id as borrower_id,
    b.name as borrower_name,
    b.phone as borrower_phone,
    b.email as borrower_email,
    (SELECT COUNT(*) FROM installments WHERE loan_id = l.id) as total_installments,
    (SELECT COUNT(*) FROM installments WHERE loan_id = l.id AND status = 'paid') as paid_installments,
    (SELECT SUM(amount_due - amount_paid) FROM installments WHERE loan_id = l.id AND status != 'paid') as outstanding_amount
FROM loans l
JOIN borrowers b ON l.borrower_id = b.id;

-- Grant access to view
GRANT SELECT ON loan_summary TO authenticated;

-- ============================================
-- SCHEMA COMPLETE
-- ============================================
