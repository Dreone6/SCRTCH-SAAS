-- Prosperly AI Messaging System Extension
-- Add this after running the main schema

-- ============================================
-- 1. EXTEND BORROWERS TABLE
-- ============================================
ALTER TABLE public.borrowers 
ADD COLUMN IF NOT EXISTS relationship_type TEXT 
CHECK (relationship_type IN ('family', 'close_friend', 'friend', 'acquaintance', 'business'));

ALTER TABLE public.borrowers 
ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT DEFAULT 'in_app'
CHECK (preferred_contact_method IN ('email', 'sms', 'in_app'));

-- ============================================
-- 2. EXTEND REMINDERS TABLE
-- ============================================
ALTER TABLE public.reminders 
ADD COLUMN IF NOT EXISTS ai_generated_message TEXT;

ALTER TABLE public.reminders 
ADD COLUMN IF NOT EXISTS tone_used TEXT
CHECK (tone_used IN ('friendly', 'direct', 'urgent'));

ALTER TABLE public.reminders 
ADD COLUMN IF NOT EXISTS borrower_response TEXT;

ALTER TABLE public.reminders 
ADD COLUMN IF NOT EXISTS effectiveness_score INTEGER
CHECK (effectiveness_score >= 1 AND effectiveness_score <= 5);

ALTER TABLE public.reminders 
ADD COLUMN IF NOT EXISTS days_overdue_when_sent INTEGER;

-- ============================================
-- 3. CONVERSATION HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.conversation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
    message_type TEXT NOT NULL CHECK (message_type IN ('reminder', 'response', 'note', 'payment_received')),
    sender TEXT NOT NULL CHECK (sender IN ('system', 'lender', 'borrower')),
    message TEXT NOT NULL,
    tone TEXT CHECK (tone IN ('friendly', 'direct', 'urgent', 'neutral')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversation_history_loan_id ON public.conversation_history(loan_id);
CREATE INDEX IF NOT EXISTS idx_conversation_history_created_at ON public.conversation_history(created_at);

-- RLS Policies
ALTER TABLE public.conversation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversation history for their loans"
    ON public.conversation_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.loans
            WHERE loans.id = conversation_history.loan_id
            AND loans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert conversation history for their loans"
    ON public.conversation_history FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.loans
            WHERE loans.id = conversation_history.loan_id
            AND loans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update conversation history for their loans"
    ON public.conversation_history FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.loans
            WHERE loans.id = conversation_history.loan_id
            AND loans.user_id = auth.uid()
        )
    );

-- ============================================
-- 4. MESSAGE TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_type TEXT NOT NULL,
    tone TEXT NOT NULL CHECK (tone IN ('friendly', 'direct', 'urgent')),
    days_overdue_range TEXT NOT NULL, -- e.g., '-3_to_0', '1_to_3', '4_to_7', '8+'
    template_text TEXT NOT NULL,
    placeholders JSONB, -- e.g., {"borrower_name": true, "amount": true}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_message_templates_lookup 
ON public.message_templates(relationship_type, tone, days_overdue_range);

-- Make templates public (not user-specific)
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view message templates"
    ON public.message_templates FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- 5. INSERT DEFAULT MESSAGE TEMPLATES
-- ============================================

-- FRIENDLY TONE
INSERT INTO public.message_templates (relationship_type, tone, days_overdue_range, template_text, placeholders) VALUES
('close_friend', 'friendly', '-3_to_0', 'Hey {borrower_name}! 😊 Quick heads up - that ${amount} for {purpose} is due {due_date}. No stress!', '{"borrower_name": true, "amount": true, "purpose": true, "due_date": true}'),
('close_friend', 'friendly', '1_to_3', 'Yo {borrower_name}! Just checking in about the ${amount} - everything good? 💙', '{"borrower_name": true, "amount": true}'),
('family', 'friendly', '-3_to_0', 'Hi {borrower_name}, just a gentle reminder about the ${amount} due on {due_date}. Love you! ❤️', '{"borrower_name": true, "amount": true, "due_date": true}'),
('family', 'friendly', '1_to_3', 'Hey {borrower_name}, hope all is well! Following up on the ${amount}. Let me know if you need anything! 🤗', '{"borrower_name": true, "amount": true}'),
('friend', 'friendly', '-3_to_0', 'Hey {borrower_name}! Quick reminder - ${amount} is due {due_date}. Thanks! 😊', '{"borrower_name": true, "amount": true, "due_date": true}'),
('acquaintance', 'friendly', '-3_to_0', 'Hi {borrower_name}, this is a friendly reminder that ${amount} is due on {due_date}. Thank you!', '{"borrower_name": true, "amount": true, "due_date": true}'),
('business', 'friendly', '-3_to_0', 'Hello {borrower_name}, this is a reminder that payment of ${amount} is due on {due_date}. Thank you for your attention to this matter.', '{"borrower_name": true, "amount": true, "due_date": true}');

-- DIRECT TONE
INSERT INTO public.message_templates (relationship_type, tone, days_overdue_range, template_text, placeholders) VALUES
('close_friend', 'direct', '4_to_7', '{borrower_name}, I need to follow up on the ${amount}. Can we sort this out?', '{"borrower_name": true, "amount": true}'),
('close_friend', 'direct', '8+', '{borrower_name}, it''s been over a week. I really need the ${amount}. Please let me know what''s going on.', '{"borrower_name": true, "amount": true}'),
('family', 'direct', '4_to_7', 'Hi {borrower_name}, I need to follow up about the ${amount}. Can we work something out?', '{"borrower_name": true, "amount": true}'),
('friend', 'direct', '4_to_7', 'Hi {borrower_name}, following up on the ${amount}. It''s now {days_overdue} days overdue. Please send when you can.', '{"borrower_name": true, "amount": true, "days_overdue": true}'),
('acquaintance', 'direct', '4_to_7', 'Hello {borrower_name}, the payment of ${amount} is now {days_overdue} days overdue. Please arrange payment as soon as possible.', '{"borrower_name": true, "amount": true, "days_overdue": true}'),
('business', 'direct', '4_to_7', 'Dear {borrower_name}, Payment of ${amount} is now {days_overdue} days past due. Please remit payment immediately.', '{"borrower_name": true, "amount": true, "days_overdue": true}');

-- URGENT TONE
INSERT INTO public.message_templates (relationship_type, tone, days_overdue_range, template_text, placeholders) VALUES
('friend', 'urgent', '8+', '{borrower_name}, I need the ${amount} urgently. It''s been {days_overdue} days. Please respond ASAP.', '{"borrower_name": true, "amount": true, "days_overdue": true}'),
('acquaintance', 'urgent', '8+', '{borrower_name}, payment of ${amount} is seriously overdue ({days_overdue} days). I need this resolved immediately.', '{"borrower_name": true, "amount": true, "days_overdue": true}'),
('business', 'urgent', '8+', 'URGENT: Payment of ${amount} is {days_overdue} days overdue. Immediate payment required to avoid further action.', '{"amount": true, "days_overdue": true}');

-- ============================================
-- 6. HELPER FUNCTION: Get Appropriate Message
-- ============================================
CREATE OR REPLACE FUNCTION get_message_template(
    p_relationship_type TEXT,
    p_days_overdue INTEGER
)
RETURNS TABLE (
    template_text TEXT,
    tone TEXT
) AS $$
DECLARE
    v_range TEXT;
    v_tone TEXT;
BEGIN
    -- Determine range
    IF p_days_overdue <= 0 THEN
        v_range := '-3_to_0';
        v_tone := 'friendly';
    ELSIF p_days_overdue BETWEEN 1 AND 3 THEN
        v_range := '1_to_3';
        v_tone := 'friendly';
    ELSIF p_days_overdue BETWEEN 4 AND 7 THEN
        v_range := '4_to_7';
        v_tone := 'direct';
    ELSE
        v_range := '8+';
        v_tone := 'urgent';
    END IF;

    RETURN QUERY
    SELECT mt.template_text, mt.tone
    FROM message_templates mt
    WHERE mt.relationship_type = p_relationship_type
    AND mt.tone = v_tone
    AND mt.days_overdue_range = v_range
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. AI MESSAGING STATS VIEW
-- ============================================
CREATE OR REPLACE VIEW reminder_effectiveness AS
SELECT 
    r.tone_used,
    b.relationship_type,
    r.days_overdue_when_sent,
    COUNT(*) as total_sent,
    AVG(r.effectiveness_score) as avg_effectiveness,
    COUNT(CASE WHEN r.borrower_response IS NOT NULL THEN 1 END) as response_count,
    COUNT(CASE WHEN i.status = 'paid' THEN 1 END) as payment_count
FROM reminders r
LEFT JOIN loans l ON r.loan_id = l.id
LEFT JOIN borrowers b ON l.borrower_id = b.id
LEFT JOIN installments i ON r.installment_id = i.id
WHERE r.tone_used IS NOT NULL
GROUP BY r.tone_used, b.relationship_type, r.days_overdue_when_sent;

-- Grant access
GRANT SELECT ON reminder_effectiveness TO authenticated;

-- ============================================
-- EXTENSION COMPLETE
-- ============================================
