# 🚀 PROSPERLY COMPLETE BUILD GUIDE
## Full Technical Specification & Implementation Document

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Core Features to Implement](#core-features)
3. [AI Messaging System](#ai-messaging-system)
4. [Digital Signature Implementation](#digital-signature)
5. [Legal Agreement Generator](#legal-agreement)
6. [Debt Tracking System](#debt-tracking)
7. [Trust & Verification System](#trust-verification)
8. [Payment Integration](#payment-integration)
9. [Database Schema Updates](#database-schema)
10. [API Endpoints](#api-endpoints)
11. [Frontend Components](#frontend-components)
12. [Security Implementation](#security)
13. [Pricing & Monetization](#pricing)
14. [Launch Checklist](#launch-checklist)

---

## 1. EXECUTIVE SUMMARY {#executive-summary}

### Current Status
- ✅ 90% Backend Complete (Supabase)
- ✅ 10+ Screens Developed
- ✅ Auth & Biometric Security
- ✅ Demo Environment Live

### Critical Features to Add (Priority Order)
1. **AI-Powered Messaging** (Differentiator)
2. **Digital Signature System** (Legal Validity)
3. **PDF Agreement Generation** (Core Value)
4. **Informal Debt Tracking** (Immediate Value)
5. **Anti-Fraud Verification** (Trust)
6. **Payment Processing** (Future)

---

## 2. CORE FEATURES TO IMPLEMENT {#core-features}

### Feature Priority Matrix
```javascript
const FEATURE_PRIORITIES = {
  CRITICAL: [
    "AI Messaging Integration",
    "Digital Signature Capture",
    "Legal PDF Generation",
    "Phone Verification"
  ],
  HIGH: [
    "Informal Debt Tracking",
    "Smart Reminders",
    "Trust Score Algorithm",
    "Bank Verification"
  ],
  MEDIUM: [
    "Payment Integration",
    "Advanced Analytics",
    "Export Features",
    "Social Features"
  ]
};
```

---

## 3. AI MESSAGING SYSTEM {#ai-messaging-system}

### 3.1 Claude API Integration

```javascript
// services/ai/claudeService.js
import { CLAUDE_CONFIG } from '../config/api';

class ClaudeAIService {
  constructor() {
    this.apiEndpoint = 'https://api.anthropic.com/v1/messages';
    this.model = 'claude-3-sonnet-20241022';
  }

  async generateReminder(context) {
    const { 
      loanAmount, 
      daysOverdue, 
      relationship, 
      reminderCount,
      borrowerName,
      purpose 
    } = context;

    const prompt = this.buildReminderPrompt(context);
    
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      const data = await response.json();
      return this.parseResponse(data);
    } catch (error) {
      console.error('Claude API Error:', error);
      return this.getFallbackReminder(reminderCount);
    }
  }

  buildReminderPrompt(context) {
    return `
      Generate a friendly payment reminder with these details:
      - Amount owed: $${context.loanAmount}
      - Days overdue: ${context.daysOverdue}
      - Relationship: ${context.relationship}
      - Previous reminders sent: ${context.reminderCount}
      - Loan purpose: ${context.purpose || 'personal loan'}
      
      Guidelines:
      - Keep tone warm and non-confrontational
      - Acknowledge the relationship
      - Suggest solutions if payment is late
      - Use appropriate level of urgency based on days overdue
      - Include the specific amount
      - Maximum 2-3 sentences
      - Add ONE appropriate emoji
      
      Return ONLY the message text, no explanations.
    `;
  }

  async generateChatSuggestions(incomingMessage, loanContext) {
    const prompt = `
      Generate 3 response options for this lending situation:
      
      Incoming message: "${incomingMessage}"
      Loan details: $${loanContext.amount}, ${loanContext.status}
      Relationship: ${loanContext.relationship}
      
      Provide 3 responses:
      1. Accommodating (most flexible)
      2. Balanced (fair to both)
      3. Assertive (friendly but firm)
      
      Format as JSON array with 'tone' and 'message' for each.
      Keep each under 50 words.
    `;

    try {
      const response = await this.callAPI(prompt);
      return JSON.parse(response);
    } catch (error) {
      return this.getDefaultSuggestions(incomingMessage);
    }
  }

  getFallbackReminder(reminderCount) {
    const templates = {
      1: "Hi! Just a friendly reminder about the ${amount} from ${purpose}. Hope everything's okay! 😊",
      2: "Hey there! Wanted to check in about the ${amount} payment. Let me know if you need to work something out.",
      3: "Hi! The ${amount} payment has been on my mind. Could we figure out a timeline that works?",
      default: "Hi! Just following up on our loan agreement. Please let me know your plans for repayment."
    };
    
    return templates[reminderCount] || templates.default;
  }

  // Smart escalation based on context
  determineEscalationLevel(daysOverdue, remindersSent) {
    if (daysOverdue <= 3) return 'gentle';
    if (daysOverdue <= 7) return 'friendly';
    if (daysOverdue <= 14) return 'concerned';
    if (daysOverdue <= 30) return 'urgent';
    return 'formal';
  }
}

export default new ClaudeAIService();
```

### 3.2 Message Interface Component

```javascript
// components/AIChat/MessageInterface.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import claudeService from '../../services/ai/claudeService';

const MessageInterface = ({ loan, recipient }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleIncomingMessage = async (message) => {
    // Get AI suggestions for response
    const aiSuggestions = await claudeService.generateChatSuggestions(
      message,
      {
        amount: loan.amount,
        status: loan.status,
        relationship: loan.relationship
      }
    );
    setSuggestions(aiSuggestions);
  };

  const sendMessage = async (text, isAISuggested = false) => {
    const message = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date(),
      isAISuggested,
      loan_id: loan.id
    };

    // Save to database
    await supabase.from('messages').insert(message);
    
    setMessages([...messages, message]);
    setInputText('');
    setSuggestions([]);

    // Track AI effectiveness
    if (isAISuggested) {
      await trackAIUsage(message, loan);
    }
  };

  const renderSuggestions = () => (
    <ScrollView horizontal className="bg-gray-50 p-3">
      {suggestions.map((suggestion, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => sendMessage(suggestion.message, true)}
          className="bg-blue-100 rounded-full px-4 py-2 mr-2"
        >
          <Text className="text-sm">
            {suggestion.tone === 'accommodating' && '😊'}
            {suggestion.tone === 'balanced' && '🤝'}
            {suggestion.tone === 'assertive' && '⏰'}
            {' ' + suggestion.message}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 p-4">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </ScrollView>
      
      {suggestions.length > 0 && renderSuggestions()}
      
      <View className="flex-row p-4 border-t">
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 mr-2"
        />
        <TouchableOpacity
          onPress={() => sendMessage(inputText)}
          className="bg-blue-500 rounded-full p-3"
        >
          <Text>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
```

---

## 4. DIGITAL SIGNATURE IMPLEMENTATION {#digital-signature}

### 4.1 Signature Capture Component

```javascript
// components/Signature/SignatureCapture.jsx
import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { View, TouchableOpacity, Text } from 'react-native';
import CryptoJS from 'crypto-js';

const SignatureCapture = ({ onSignatureComplete, agreementId, signerId }) => {
  const signatureRef = useRef();
  const [isDrawn, setIsDrawn] = useState(false);
  const [signatureData, setSignatureData] = useState(null);

  const handleClear = () => {
    signatureRef.current.clear();
    setIsDrawn(false);
  };

  const handleSave = async () => {
    if (signatureRef.current.isEmpty()) {
      alert('Please provide a signature');
      return;
    }

    // Get signature as base64
    const signatureBase64 = signatureRef.current.getTrimmedCanvas()
      .toDataURL('image/png');
    
    // Create cryptographic hash for tamper-proofing
    const signatureHash = CryptoJS.SHA256(signatureBase64 + agreementId + Date.now())
      .toString();
    
    const signaturePackage = {
      signature_data: signatureBase64,
      signature_hash: signatureHash,
      signer_id: signerId,
      agreement_id: agreementId,
      signed_at: new Date().toISOString(),
      ip_address: await getClientIP(),
      device_fingerprint: await getDeviceFingerprint(),
      signature_method: 'drawn',
      legal_acceptance: true
    };

    // Store signature
    await storeSignature(signaturePackage);
    
    onSignatureComplete(signaturePackage);
  };

  const handleTypeSignature = async (typedName) => {
    // Alternative: typed signature
    const signaturePackage = {
      signature_data: typedName,
      signature_type: 'typed',
      signer_id: signerId,
      agreement_id: agreementId,
      signed_at: new Date().toISOString(),
      ip_address: await getClientIP(),
      device_fingerprint: await getDeviceFingerprint(),
      legal_acceptance: true,
      typed_name_hash: CryptoJS.SHA256(typedName + agreementId).toString()
    };

    await storeSignature(signaturePackage);
    onSignatureComplete(signaturePackage);
  };

  return (
    <View className="p-4 bg-white rounded-lg">
      <Text className="text-lg font-bold mb-2">Sign Agreement</Text>
      
      <View className="border-2 border-dashed border-gray-300 rounded-lg p-2">
        <SignatureCanvas
          ref={signatureRef}
          canvasProps={{
            className: 'signature-canvas',
            width: 350,
            height: 200
          }}
          onBegin={() => setIsDrawn(true)}
          backgroundColor="white"
          penColor="black"
          minWidth={1}
          maxWidth={3}
        />
      </View>

      <View className="flex-row justify-between mt-4">
        <TouchableOpacity
          onPress={handleClear}
          className="bg-gray-200 px-6 py-2 rounded"
        >
          <Text>Clear</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleSave}
          disabled={!isDrawn}
          className={`px-6 py-2 rounded ${
            isDrawn ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        >
          <Text className="text-white">Sign & Accept</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => setShowTypedOption(true)}
        className="mt-4"
      >
        <Text className="text-blue-500 text-center">
          Type signature instead
        </Text>
      </TouchableOpacity>

      <View className="mt-4 p-3 bg-gray-50 rounded">
        <Text className="text-xs text-gray-600">
          By signing, you agree to the terms of this loan agreement.
          This electronic signature is legally binding.
          IP: {clientIP} | Time: {new Date().toLocaleString()}
        </Text>
      </View>
    </View>
  );
};

// Signature verification service
class SignatureVerificationService {
  verifySignature(signaturePackage) {
    const {
      signature_data,
      signature_hash,
      agreement_id,
      signed_at
    } = signaturePackage;

    // Recreate hash to verify integrity
    const expectedHash = CryptoJS.SHA256(
      signature_data + agreement_id + signed_at
    ).toString();

    return {
      isValid: expectedHash === signature_hash,
      verifiedAt: new Date().toISOString(),
      verificationMethod: 'SHA256_HASH'
    };
  }

  async notarizeSignature(signaturePackage) {
    // Create blockchain timestamp (optional)
    const notarization = {
      signature_hash: signaturePackage.signature_hash,
      blockchain_tx: null, // Would integrate with blockchain
      timestamp_authority: 'PROSPERLY_INTERNAL',
      notarized_at: new Date().toISOString()
    };

    return notarization;
  }
}

export default SignatureCapture;
```

### 4.2 Signature Storage Schema

```sql
-- Supabase migration for signatures table
CREATE TABLE signatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID REFERENCES agreements(id),
  signer_id UUID REFERENCES users(id),
  signature_data TEXT NOT NULL,
  signature_type VARCHAR(20) CHECK (signature_type IN ('drawn', 'typed', 'biometric')),
  signature_hash VARCHAR(64) NOT NULL,
  signed_at TIMESTAMP NOT NULL,
  ip_address INET,
  device_fingerprint JSONB,
  legal_acceptance BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  verification_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(agreement_id, signer_id)
);

-- Index for quick lookups
CREATE INDEX idx_signatures_agreement ON signatures(agreement_id);
CREATE INDEX idx_signatures_signer ON signatures(signer_id);
CREATE INDEX idx_signatures_hash ON signatures(signature_hash);
```

---

## 5. LEGAL AGREEMENT GENERATOR {#legal-agreement}

### 5.1 PDF Generation Service

```javascript
// services/pdf/agreementGenerator.js
import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';

class AgreementGenerator {
  async generateLoanAgreement(loanData) {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));

    // Header with logo
    this.addHeader(doc);
    
    // Agreement title
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .text('LOAN AGREEMENT', { align: 'center' });
    
    doc.moveDown();
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Agreement ID: ${loanData.id}`, { align: 'center' })
       .text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });

    doc.moveDown(2);

    // Parties section
    this.addPartiesSection(doc, loanData);
    
    // Terms section
    this.addTermsSection(doc, loanData);
    
    // Payment schedule
    if (loanData.payment_schedule) {
      this.addPaymentSchedule(doc, loanData.payment_schedule);
    }
    
    // Interest section
    this.addInterestSection(doc, loanData);
    
    // Default terms
    this.addDefaultTerms(doc, loanData);
    
    // Legal clauses
    this.addLegalClauses(doc, loanData);
    
    // Signature blocks
    this.addSignatureBlocks(doc, loanData);

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
    });
  }

  addHeader(doc) {
    // Add Prosperly logo
    doc.image('assets/prosperly-logo.png', 50, 45, { width: 100 })
       .fontSize(10)
       .text('PROSPERLY', 50, 50, { align: 'right' })
       .text('Digital Loan Agreement', 50, 65, { align: 'right' })
       .moveDown(3);
  }

  addPartiesSection(doc, loanData) {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('1. PARTIES TO THIS AGREEMENT')
       .font('Helvetica')
       .fontSize(10)
       .moveDown(0.5);

    doc.text(`LENDER: ${loanData.lender.full_name}`)
       .text(`Address: ${loanData.lender.address || 'On file'}`)
       .text(`Email: ${loanData.lender.email}`)
       .text(`Phone: ${loanData.lender.phone || 'On file'}`)
       .moveDown();

    doc.text(`BORROWER: ${loanData.borrower.full_name}`)
       .text(`Address: ${loanData.borrower.address || 'On file'}`)
       .text(`Email: ${loanData.borrower.email}`)
       .text(`Phone: ${loanData.borrower.phone || 'On file'}`)
       .moveDown();
  }

  addTermsSection(doc, loanData) {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('2. LOAN TERMS')
       .font('Helvetica')
       .fontSize(10)
       .moveDown(0.5);

    doc.text(`Principal Amount: $${loanData.amount.toLocaleString()}`)
       .text(`Loan Purpose: ${loanData.purpose || 'Personal loan'}`)
       .text(`Disbursement Date: ${loanData.disbursement_date}`)
       .text(`Maturity Date: ${loanData.maturity_date}`)
       .moveDown();
  }

  addPaymentSchedule(doc, schedule) {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('3. PAYMENT SCHEDULE')
       .font('Helvetica')
       .fontSize(10)
       .moveDown(0.5);

    if (schedule.type === 'lump_sum') {
      doc.text(`Single payment of $${schedule.total_amount} due on ${schedule.due_date}`);
    } else if (schedule.type === 'installments') {
      doc.text(`${schedule.installments.length} installments as follows:`);
      schedule.installments.forEach((payment, index) => {
        doc.text(`  ${index + 1}. $${payment.amount} due on ${payment.due_date}`);
      });
    }
    doc.moveDown();
  }

  addInterestSection(doc, loanData) {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('4. INTEREST')
       .font('Helvetica')
       .fontSize(10)
       .moveDown(0.5);

    if (loanData.interest_rate > 0) {
      doc.text(`Interest Rate: ${loanData.interest_rate}% per annum`)
         .text(`Interest Calculation: ${loanData.interest_type || 'Simple'}`)
         .text(`Total Interest: $${loanData.total_interest}`);
    } else {
      doc.text('This loan carries no interest.');
    }
    doc.moveDown();
  }

  addDefaultTerms(doc, loanData) {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('5. DEFAULT AND REMEDIES')
       .font('Helvetica')
       .fontSize(10)
       .moveDown(0.5);

    doc.text(`Grace Period: ${loanData.grace_period || 7} days`)
       .text('In the event of default, the entire unpaid balance becomes immediately due.')
       .text('Borrower agrees to pay all reasonable costs of collection.')
       .moveDown();
  }

  addLegalClauses(doc, loanData) {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('6. GENERAL PROVISIONS')
       .font('Helvetica')
       .fontSize(10)
       .moveDown(0.5);

    doc.text(`Governing Law: This agreement shall be governed by the laws of ${loanData.state || 'the state of residence of the Lender'}.`)
       .text('Entire Agreement: This document constitutes the entire agreement between the parties.')
       .text('Amendments: Any changes must be made in writing and signed by both parties.')
       .text('Electronic Signatures: Both parties agree that electronic signatures are legally binding.')
       .moveDown();
  }

  addSignatureBlocks(doc, loanData) {
    doc.addPage();
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('SIGNATURES')
       .font('Helvetica')
       .fontSize(10)
       .moveDown(2);

    // Lender signature block
    if (loanData.lender_signature) {
      doc.image(loanData.lender_signature, 50, doc.y, { width: 150, height: 50 });
    } else {
      doc.text('_______________________________');
    }
    doc.text(`${loanData.lender.full_name} (Lender)`)
       .text(`Date: ${loanData.lender_signed_date || '___________'}`)
       .moveDown(2);

    // Borrower signature block
    if (loanData.borrower_signature) {
      doc.image(loanData.borrower_signature, 50, doc.y, { width: 150, height: 50 });
    } else {
      doc.text('_______________________________');
    }
    doc.text(`${loanData.borrower.full_name} (Borrower)`)
       .text(`Date: ${loanData.borrower_signed_date || '___________'}`);

    // Notary block (optional)
    if (loanData.require_notary) {
      doc.moveDown(2);
      doc.text('NOTARY ACKNOWLEDGMENT')
         .text('State of ____________')
         .text('County of ___________')
         .moveDown()
         .text('Subscribed and sworn before me this _____ day of _______, 20__')
         .moveDown()
         .text('_______________________________')
         .text('Notary Public')
         .text('My Commission Expires: __________');
    }

    // Add QR code for verification
    this.addVerificationQR(doc, loanData);
  }

  addVerificationQR(doc, loanData) {
    // Add QR code that links to verification page
    const verificationUrl = `https://prosperly.app/verify/${loanData.id}`;
    // QR code implementation would go here
    doc.fontSize(8)
       .text(`Verify this agreement at: ${verificationUrl}`, 50, 700);
  }
}

export default new AgreementGenerator();
```

### 5.2 Agreement Creation Flow

```javascript
// screens/CreateAgreement/AgreementWizard.jsx
import React, { useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import StepIndicator from 'react-native-step-indicator';

const AgreementWizard = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [agreementData, setAgreementData] = useState({
    amount: 0,
    purpose: '',
    borrower: {},
    lender: {},
    interest_rate: 0,
    payment_type: 'lump_sum',
    payment_schedule: {},
    grace_period: 7,
    require_collateral: false,
    state: '',
    notification_preferences: {
      email: true,
      sms: true,
      in_app: true
    }
  });

  const steps = [
    'Parties',
    'Amount',
    'Purpose',
    'Terms',
    'Interest',
    'Schedule',
    'Protection',
    'Review',
    'Sign'
  ];

  const renderStepContent = () => {
    switch(currentStep) {
      case 0:
        return <PartiesStep data={agreementData} onChange={updateData} />;
      case 1:
        return <AmountStep data={agreementData} onChange={updateData} />;
      case 2:
        return <PurposeStep data={agreementData} onChange={updateData} />;
      case 3:
        return <TermsStep data={agreementData} onChange={updateData} />;
      case 4:
        return <InterestStep data={agreementData} onChange={updateData} />;
      case 5:
        return <ScheduleStep data={agreementData} onChange={updateData} />;
      case 6:
        return <ProtectionStep data={agreementData} onChange={updateData} />;
      case 7:
        return <ReviewStep data={agreementData} onChange={updateData} />;
      case 8:
        return <SignStep data={agreementData} onComplete={completeAgreement} />;
      default:
        return null;
    }
  };

  const completeAgreement = async () => {
    try {
      // Generate PDF
      const pdf = await agreementGenerator.generateLoanAgreement(agreementData);
      
      // Save to database
      const agreement = await supabase
        .from('agreements')
        .insert({
          ...agreementData,
          pdf_url: pdf.url,
          status: 'pending_signatures',
          created_at: new Date()
        })
        .single();

      // Send notifications
      await notificationService.notifyNewAgreement(agreement);

      navigation.navigate('AgreementSuccess', { agreement });
    } catch (error) {
      console.error('Error creating agreement:', error);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StepIndicator
        customStyles={stepIndicatorStyles}
        currentPosition={currentStep}
        labels={steps}
        stepCount={9}
      />
      
      <ScrollView className="flex-1">
        {renderStepContent()}
      </ScrollView>

      <View className="flex-row justify-between p-4">
        {currentStep > 0 && (
          <TouchableOpacity
            onPress={() => setCurrentStep(currentStep - 1)}
            className="bg-gray-200 px-6 py-3 rounded"
          >
            <Text>Previous</Text>
          </TouchableOpacity>
        )}
        
        {currentStep < steps.length - 1 ? (
          <TouchableOpacity
            onPress={() => setCurrentStep(currentStep + 1)}
            className="bg-blue-500 px-6 py-3 rounded ml-auto"
          >
            <Text className="text-white">Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={completeAgreement}
            className="bg-green-500 px-6 py-3 rounded ml-auto"
          >
            <Text className="text-white">Create Agreement</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
```

---

## 6. DEBT TRACKING SYSTEM {#debt-tracking}

### 6.1 Informal Debt Manager

```javascript
// services/debt/debtTracker.js
class DebtTracker {
  constructor() {
    this.debtTypes = {
      FORMAL: 'prosperly_agreement',
      INFORMAL: 'quick_iou',
      EXTERNAL: 'outside_debt'
    };
  }

  async addQuickIOU(data) {
    const iou = {
      id: generateUUID(),
      type: this.debtTypes.INFORMAL,
      creditor_id: data.creditorId,
      debtor_id: data.debtorId,
      amount: data.amount,
      description: data.description,
      created_date: new Date(),
      due_date: data.dueDate,
      status: 'active',
      reminder_count: 0,
      can_convert_to_formal: true
    };

    const result = await supabase
      .from('debts')
      .insert(iou)
      .single();

    // Suggest formalization for large amounts
    if (iou.amount > 500) {
      await this.suggestFormalization(iou);
    }

    return result;
  }

  async addExternalDebt(data) {
    const debt = {
      type: this.debtTypes.EXTERNAL,
      user_id: data.userId,
      creditor_name: data.creditorName,
      amount: data.amount,
      category: data.category, // 'credit_card', 'student_loan', etc.
      minimum_payment: data.minimumPayment,
      interest_rate: data.interestRate,
      due_date: data.dueDate,
      auto_remind: true
    };

    return await supabase
      .from('external_debts')
      .insert(debt)
      .single();
  }

  async convertToFormal(informalDebtId) {
    const informal = await supabase
      .from('debts')
      .select('*')
      .eq('id', informalDebtId)
      .single();

    if (!informal) throw new Error('Debt not found');

    // Create formal agreement from informal debt
    const formalAgreement = {
      amount: informal.amount,
      lender_id: informal.creditor_id,
      borrower_id: informal.debtor_id,
      purpose: informal.description,
      converted_from: informal.id,
      status: 'pending_signatures'
    };

    const agreement = await supabase
      .from('agreements')
      .insert(formalAgreement)
      .single();

    // Update informal debt
    await supabase
      .from('debts')
      .update({
        converted_to_formal: true,
        formal_agreement_id: agreement.id
      })
      .eq('id', informalDebtId);

    return agreement;
  }

  async getDebtSummary(userId) {
    // Get all debts for user
    const [formal, informal, external] = await Promise.all([
      this.getFormalDebts(userId),
      this.getInformalDebts(userId),
      this.getExternalDebts(userId)
    ]);

    return {
      money_owed_to_me: {
        formal: formal.incoming,
        informal: informal.incoming,
        total: formal.incoming + informal.incoming
      },
      money_i_owe: {
        formal: formal.outgoing,
        informal: informal.outgoing,
        external: external.total,
        total: formal.outgoing + informal.outgoing + external.total
      },
      net_position: (formal.incoming + informal.incoming) - 
                    (formal.outgoing + informal.outgoing + external.total),
      active_debts: {
        formal: formal.count,
        informal: informal.count,
        external: external.count
      }
    };
  }

  async suggestSettlement(userId, otherUserId) {
    const mutual = await supabase
      .from('debts')
      .select('*')
      .or(`creditor_id.eq.${userId},debtor_id.eq.${userId}`)
      .or(`creditor_id.eq.${otherUserId},debtor_id.eq.${otherUserId}`);

    const iOweThey = mutual.filter(d => 
      d.debtor_id === userId && d.creditor_id === otherUserId
    ).reduce((sum, d) => sum + d.amount, 0);

    const theyOweMe = mutual.filter(d => 
      d.creditor_id === userId && d.debtor_id === otherUserId
    ).reduce((sum, d) => sum + d.amount, 0);

    if (iOweThey > 0 && theyOweMe > 0) {
      return {
        canSettle: true,
        settlementAmount: Math.abs(iOweThey - theyOweMe),
        settlementDirection: iOweThey > theyOweMe ? 'i_pay' : 'they_pay'
      };
    }

    return { canSettle: false };
  }
}

export default new DebtTracker();
```

### 6.2 Debt Dashboard Component

```javascript
// screens/Dashboard/DebtDashboard.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const DebtDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [activeDebts, setActiveDebts] = useState([]);

  useEffect(() => {
    loadDebtSummary();
  }, []);

  const loadDebtSummary = async () => {
    const data = await debtTracker.getDebtSummary(user.id);
    setSummary(data);
  };

  const renderDebtCard = (debt) => (
    <TouchableOpacity
      key={debt.id}
      className="bg-white rounded-lg p-4 mb-3 shadow"
      onPress={() => navigateToDebt(debt)}
    >
      <View className="flex-row justify-between">
        <View>
          <Text className="font-bold">{debt.other_party_name}</Text>
          <Text className="text-gray-500 text-sm">{debt.description}</Text>
        </View>
        <View className="items-end">
          <Text className={`font-bold ${debt.type === 'owed_to_me' ? 'text-green-500' : 'text-red-500'}`}>
            ${debt.amount}
          </Text>
          <Text className="text-xs text-gray-400">
            Due {formatDate(debt.due_date)}
          </Text>
        </View>
      </View>

      {debt.can_convert && (
        <TouchableOpacity
          className="mt-2 bg-blue-50 rounded p-2"
          onPress={() => convertToFormal(debt.id)}
        >
          <Text className="text-blue-500 text-center text-sm">
            Convert to Formal Agreement
          </Text>
        </TouchableOpacity>
      )}

      {debt.can_settle && (
        <TouchableOpacity
          className="mt-2 bg-green-50 rounded p-2"
          onPress={() => settleMutualDebts(debt)}
        >
          <Text className="text-green-500 text-center text-sm">
            Settle Mutual Debts
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Net Position Card */}
      <View className="bg-white m-4 p-6 rounded-lg shadow">
        <Text className="text-gray-500 text-sm">NET POSITION</Text>
        <Text className={`text-3xl font-bold ${
          summary?.net_position >= 0 ? 'text-green-500' : 'text-red-500'
        }`}>
          ${Math.abs(summary?.net_position || 0).toLocaleString()}
        </Text>
        <Text className="text-gray-500 text-sm mt-1">
          {summary?.net_position >= 0 ? 'You are owed' : 'You owe'}
        </Text>
      </View>

      {/* Quick Stats */}
      <View className="flex-row mx-4">
        <View className="flex-1 bg-green-50 p-4 rounded-lg mr-2">
          <Text className="text-green-700 text-sm">Owed to Me</Text>
          <Text className="text-green-700 text-xl font-bold">
            ${summary?.money_owed_to_me.total || 0}
          </Text>
        </View>
        <View className="flex-1 bg-red-50 p-4 rounded-lg ml-2">
          <Text className="text-red-700 text-sm">I Owe</Text>
          <Text className="text-red-700 text-xl font-bold">
            ${summary?.money_i_owe.total || 0}
          </Text>
        </View>
      </View>

      {/* Quick Add Buttons */}
      <View className="flex-row m-4">
        <TouchableOpacity
          className="flex-1 bg-blue-500 p-3 rounded-lg mr-2"
          onPress={() => navigation.navigate('QuickIOU')}
        >
          <Text className="text-white text-center">+ Quick IOU</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-purple-500 p-3 rounded-lg ml-2"
          onPress={() => navigation.navigate('AddExternalDebt')}
        >
          <Text className="text-white text-center">+ External Debt</Text>
        </TouchableOpacity>
      </View>

      {/* Active Debts List */}
      <View className="mx-4">
        <Text className="text-lg font-bold mb-3">Active Debts</Text>
        {activeDebts.map(renderDebtCard)}
      </View>
    </ScrollView>
  );
};
```

---

## 7. TRUST & VERIFICATION SYSTEM {#trust-verification}

### 7.1 Identity Verification Service

```javascript
// services/verification/identityService.js
import { Twilio } from 'twilio';
import { PlaidClient } from 'plaid';
import DeviceInfo from 'react-native-device-info';

class IdentityVerificationService {
  constructor() {
    this.twilioClient = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    this.plaidClient = new PlaidClient({
      clientID: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
      env: process.env.PLAID_ENV
    });

    this.verificationLevels = {
      BASIC: { score: 50, limit: 500 },
      VERIFIED: { score: 100, limit: 5000 },
      TRUSTED: { score: 150, limit: 25000 },
      GUARANTEED: { score: 200, limit: 'unlimited' }
    };
  }

  // Phone Verification
  async verifyPhone(phoneNumber, userId) {
    try {
      // Check if phone is VOIP
      const phoneCheck = await this.checkPhoneType(phoneNumber);
      if (phoneCheck.is_voip) {
        return {
          success: false,
          error: 'VOIP numbers not accepted for verification'
        };
      }

      // Send verification code
      const verification = await this.twilioClient.verify
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications
        .create({
          to: phoneNumber,
          channel: 'sms'
        });

      // Store verification attempt
      await supabase
        .from('verification_attempts')
        .insert({
          user_id: userId,
          type: 'phone',
          phone_number: phoneNumber,
          status: 'pending',
          attempt_id: verification.sid
        });

      return {
        success: true,
        verificationSid: verification.sid
      };
    } catch (error) {
      console.error('Phone verification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async confirmPhoneVerification(phoneNumber, code, userId) {
    try {
      const verificationCheck = await this.twilioClient.verify
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks
        .create({
          to: phoneNumber,
          code: code
        });

      if (verificationCheck.status === 'approved') {
        // Update user verification status
        await supabase
          .from('users')
          .update({
            phone_verified: true,
            phone_number: phoneNumber,
            verification_level: 'VERIFIED'
          })
          .eq('id', userId);

        // Update trust score
        await this.updateTrustScore(userId, 50);

        return { success: true };
      }

      return {
        success: false,
        error: 'Invalid verification code'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Bank Account Verification (Plaid)
  async verifyBankAccount(userId) {
    try {
      // Create Plaid link token
      const linkToken = await this.plaidClient.createLinkToken({
        user: { client_user_id: userId },
        client_name: 'Prosperly',
        products: ['auth', 'identity'],
        country_codes: ['US'],
        language: 'en'
      });

      return {
        success: true,
        linkToken: linkToken.link_token
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async processBankVerification(publicToken, userId) {
    try {
      // Exchange public token for access token
      const exchangeResponse = await this.plaidClient.exchangePublicToken(
        publicToken
      );
      const accessToken = exchangeResponse.access_token;

      // Get account details
      const accounts = await this.plaidClient.getAccounts(accessToken);
      
      // Check for duplicate accounts
      const existingAccount = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('account_id', accounts.accounts[0].account_id)
        .single();

      if (existingAccount && existingAccount.user_id !== userId) {
        return {
          success: false,
          error: 'This bank account is already linked to another user'
        };
      }

      // Store bank account
      await supabase
        .from('bank_accounts')
        .insert({
          user_id: userId,
          account_id: accounts.accounts[0].account_id,
          account_name: accounts.accounts[0].name,
          institution_id: accounts.item.institution_id,
          verified: true,
          verification_date: new Date()
        });

      // Update user verification level
      await supabase
        .from('users')
        .update({
          bank_verified: true,
          verification_level: 'TRUSTED'
        })
        .eq('id', userId);

      // Update trust score
      await this.updateTrustScore(userId, 100);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Device Fingerprinting
  async captureDeviceFingerprint() {
    const fingerprint = {
      device_id: DeviceInfo.getUniqueId(),
      device_model: DeviceInfo.getModel(),
      device_brand: DeviceInfo.getBrand(),
      os_version: DeviceInfo.getSystemVersion(),
      app_version: DeviceInfo.getVersion(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: DeviceInfo.getDeviceLocale(),
      carrier: await DeviceInfo.getCarrier(),
      ip_address: await DeviceInfo.getIpAddress(),
      is_tablet: DeviceInfo.isTablet(),
      has_notch: DeviceInfo.hasNotch(),
      fingerprint_hash: null
    };

    // Create hash of device attributes
    fingerprint.fingerprint_hash = await this.hashFingerprint(fingerprint);

    return fingerprint;
  }

  async checkForDuplicateDevice(fingerprint) {
    const similar = await supabase
      .from('device_fingerprints')
      .select('*')
      .eq('fingerprint_hash', fingerprint.fingerprint_hash);

    if (similar.length > 0) {
      // Check similarity score
      const similarityScore = this.calculateSimilarity(
        fingerprint,
        similar[0]
      );

      if (similarityScore > 0.85) {
        return {
          isDuplicate: true,
          matchedUserId: similar[0].user_id,
          similarity: similarityScore
        };
      }
    }

    return { isDuplicate: false };
  }

  // Trust Score Calculation
  async calculateTrustScore(userId) {
    const user = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    let score = 100; // Base score

    // Verification bonuses
    if (user.phone_verified) score += 50;
    if (user.email_verified) score += 25;
    if (user.bank_verified) score += 100;
    if (user.government_id_verified) score += 150;

    // Transaction history
    const transactions = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId);

    const onTimePayments = transactions.filter(t => 
      t.paid_on_time
    ).length;
    const latePayments = transactions.filter(t => 
      t.days_late > 0
    ).length;
    const defaults = transactions.filter(t => 
      t.status === 'defaulted'
    ).length;

    score += onTimePayments * 10;
    score -= latePayments * 15;
    score -= defaults * 100;

    // Network effects
    const vouches = await supabase
      .from('vouches')
      .select('*')
      .eq('vouched_for', userId);

    score += vouches.length * 20;

    // Cap score
    score = Math.max(0, Math.min(score, 500));

    // Update score
    await supabase
      .from('users')
      .update({ trust_score: score })
      .eq('id', userId);

    return score;
  }

  // Anti-fraud detection
  async detectFraudulentBehavior(userId) {
    const user = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    const suspiciousPatterns = {
      rapid_borrowing: false,
      no_reciprocity: false,
      immediate_default: false,
      connection_farming: false,
      unusual_activity_time: false
    };

    // Check for rapid borrowing
    const recentLoans = await supabase
      .from('agreements')
      .select('*')
      .eq('borrower_id', userId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

    if (recentLoans.length > 5) {
      suspiciousPatterns.rapid_borrowing = true;
    }

    // Check for no reciprocity
    const borrowed = await supabase
      .from('agreements')
      .select('count')
      .eq('borrower_id', userId);

    const lent = await supabase
      .from('agreements')
      .select('count')
      .eq('lender_id', userId);

    if (borrowed.count > 0 && lent.count === 0) {
      suspiciousPatterns.no_reciprocity = true;
    }

    // Calculate risk score
    const riskScore = Object.values(suspiciousPatterns)
      .filter(Boolean).length * 20;

    if (riskScore > 40) {
      await this.flagForReview(userId, suspiciousPatterns);
    }

    return {
      riskScore,
      patterns: suspiciousPatterns
    };
  }

  async flagForReview(userId, reasons) {
    await supabase
      .from('fraud_flags')
      .insert({
        user_id: userId,
        reasons: reasons,
        flagged_at: new Date(),
        status: 'pending_review'
      });

    // Notify admin
    await notificationService.notifyAdmin(
      'Suspicious activity detected',
      `User ${userId} flagged for review`
    );
  }
}

export default new IdentityVerificationService();
```

---

## 8. PAYMENT INTEGRATION {#payment-integration}

### 8.1 Stripe Connect Integration

```javascript
// services/payment/stripeService.js
import Stripe from 'stripe';

class StripePaymentService {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  // Onboard users to Stripe Connect
  async createConnectedAccount(userId, userData) {
    try {
      const account = await this.stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: userData.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        },
        business_type: 'individual',
        metadata: {
          prosperly_user_id: userId
        }
      });

      // Store Stripe account ID
      await supabase
        .from('users')
        .update({
          stripe_account_id: account.id,
          stripe_onboarded: false
        })
        .eq('id', userId);

      // Create account link for onboarding
      const accountLink = await this.stripe.accountLinks.create({
        account: account.id,
        refresh_url: 'https://prosperly.app/stripe/refresh',
        return_url: 'https://prosperly.app/stripe/return',
        type: 'account_onboarding'
      });

      return {
        success: true,
        onboardingUrl: accountLink.url
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Process loan payment
  async processLoanPayment(agreementId, amount, paymentMethod) {
    try {
      const agreement = await supabase
        .from('agreements')
        .select('*')
        .eq('id', agreementId)
        .single();

      const lender = await supabase
        .from('users')
        .select('stripe_account_id')
        .eq('id', agreement.lender_id)
        .single();

      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        payment_method: paymentMethod,
        confirm: true,
        transfer_data: {
          destination: lender.stripe_account_id
        },
        application_fee_amount: Math.floor(amount * 2.9), // 2.9% platform fee
        metadata: {
          agreement_id: agreementId,
          borrower_id: agreement.borrower_id,
          lender_id: agreement.lender_id
        }
      });

      // Record payment
      await supabase
        .from('payments')
        .insert({
          agreement_id: agreementId,
          amount: amount,
          stripe_payment_intent_id: paymentIntent.id,
          status: paymentIntent.status,
          paid_at: new Date(),
          platform_fee: amount * 0.029
        });

      // Update agreement status
      await this.updateAgreementStatus(agreementId, amount);

      return {
        success: true,
        paymentIntent: paymentIntent
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Set up recurring payments
  async createRecurringPayment(agreementId, schedule) {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: schedule.customer_id,
        items: [{
          price_data: {
            currency: 'usd',
            product: 'loan_repayment',
            recurring: {
              interval: schedule.interval, // 'month', 'week', etc.
              interval_count: schedule.interval_count
            },
            unit_amount: schedule.amount * 100
          }
        }],
        metadata: {
          agreement_id: agreementId
        }
      });

      return {
        success: true,
        subscription: subscription
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new StripePaymentService();
```

---

## 9. DATABASE SCHEMA UPDATES {#database-schema}

```sql
-- Complete Supabase Schema for Prosperly

-- Users table (update existing)
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  verification_level VARCHAR(20) DEFAULT 'BASIC',
  trust_score INTEGER DEFAULT 100,
  phone_verified BOOLEAN DEFAULT false,
  bank_verified BOOLEAN DEFAULT false,
  government_id_verified BOOLEAN DEFAULT false,
  stripe_account_id VARCHAR(255),
  stripe_onboarded BOOLEAN DEFAULT false,
  device_fingerprint JSONB,
  risk_flags JSONB,
  lifetime_member BOOLEAN DEFAULT false,
  subscription_tier VARCHAR(20) DEFAULT 'free',
  subscription_expires_at TIMESTAMP;

-- Agreements table
CREATE TABLE IF NOT EXISTS agreements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lender_id UUID REFERENCES users(id),
  borrower_id UUID REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2),
  purpose TEXT,
  payment_type VARCHAR(20) CHECK (payment_type IN ('lump_sum', 'installments', 'flexible')),
  payment_schedule JSONB,
  grace_period INTEGER DEFAULT 7,
  state VARCHAR(2),
  status VARCHAR(20) DEFAULT 'draft',
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  signed_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  INDEX idx_agreements_lender (lender_id),
  INDEX idx_agreements_borrower (borrower_id),
  INDEX idx_agreements_status (status)
);

-- Debts table (for informal IOUs)
CREATE TABLE IF NOT EXISTS debts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(20) CHECK (type IN ('formal', 'informal', 'external')),
  creditor_id UUID REFERENCES users(id),
  debtor_id UUID REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_date TIMESTAMP DEFAULT NOW(),
  due_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  reminder_count INTEGER DEFAULT 0,
  can_convert_to_formal BOOLEAN DEFAULT true,
  converted_to_formal BOOLEAN DEFAULT false,
  formal_agreement_id UUID REFERENCES agreements(id),
  
  INDEX idx_debts_creditor (creditor_id),
  INDEX idx_debts_debtor (debtor_id)
);

-- Messages table (for AI chat)
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID REFERENCES agreements(id),
  sender_id UUID REFERENCES users(id),
  recipient_id UUID REFERENCES users(id),
  message_text TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'user',
  is_ai_generated BOOLEAN DEFAULT false,
  ai_suggestion_used BOOLEAN DEFAULT false,
  sent_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  
  INDEX idx_messages_agreement (agreement_id),
  INDEX idx_messages_sender (sender_id)
);

-- Reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID REFERENCES agreements(id),
  debt_id UUID REFERENCES debts(id),
  reminder_type VARCHAR(20),
  message TEXT,
  is_ai_generated BOOLEAN DEFAULT false,
  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP,
  delivery_method VARCHAR(20),
  response_received BOOLEAN DEFAULT false,
  
  INDEX idx_reminders_scheduled (scheduled_for)
);

-- Trust scores table
CREATE TABLE IF NOT EXISTS trust_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  score INTEGER DEFAULT 100,
  calculation_date TIMESTAMP DEFAULT NOW(),
  factors JSONB,
  
  INDEX idx_trust_scores_user (user_id)
);

-- Verification attempts table
CREATE TABLE IF NOT EXISTS verification_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(20),
  status VARCHAR(20),
  attempt_data JSONB,
  attempted_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  INDEX idx_verification_user (user_id)
);

-- Device fingerprints table
CREATE TABLE IF NOT EXISTS device_fingerprints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  fingerprint_hash VARCHAR(64) UNIQUE,
  device_data JSONB,
  first_seen TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_fingerprint_hash (fingerprint_hash)
);

-- Fraud flags table
CREATE TABLE IF NOT EXISTS fraud_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  reasons JSONB,
  risk_score INTEGER,
  flagged_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending_review',
  
  INDEX idx_fraud_flags_user (user_id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID REFERENCES agreements(id),
  amount DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2),
  stripe_payment_intent_id VARCHAR(255),
  status VARCHAR(20),
  paid_at TIMESTAMP,
  
  INDEX idx_payments_agreement (agreement_id)
);
```

---

## 10. API ENDPOINTS {#api-endpoints}

```javascript
// api/routes.js - Complete API Structure

const routes = {
  // Auth endpoints
  'POST /auth/register': 'Create new user account',
  'POST /auth/login': 'User login',
  'POST /auth/logout': 'User logout',
  'POST /auth/refresh': 'Refresh access token',
  'POST /auth/verify-email': 'Verify email address',
  
  // Agreement endpoints
  'POST /agreements': 'Create new agreement',
  'GET /agreements': 'List user agreements',
  'GET /agreements/:id': 'Get agreement details',
  'PUT /agreements/:id': 'Update agreement',
  'POST /agreements/:id/sign': 'Sign agreement',
  'POST /agreements/:id/payment': 'Record payment',
  'GET /agreements/:id/pdf': 'Download PDF',
  
  // Debt tracking endpoints
  'POST /debts': 'Add informal debt',
  'GET /debts': 'List all debts',
  'PUT /debts/:id': 'Update debt',
  'POST /debts/:id/convert': 'Convert to formal',
  'POST /debts/:id/settle': 'Settle debt',
  
  // AI messaging endpoints
  'POST /ai/generate-reminder': 'Generate AI reminder',
  'POST /ai/suggest-responses': 'Get response suggestions',
  'POST /ai/check-tone': 'Check message tone',
  
  // Verification endpoints
  'POST /verify/phone': 'Start phone verification',
  'POST /verify/phone/confirm': 'Confirm phone code',
  'POST /verify/bank': 'Start bank verification',
  'POST /verify/bank/confirm': 'Complete bank verification',
  'POST /verify/identity': 'Upload ID for verification',
  
  // Trust score endpoints
  'GET /trust/:userId': 'Get trust score',
  'POST /trust/vouch': 'Vouch for user',
  'GET /trust/network/:userId': 'Get trust network',
  
  // Payment endpoints
  'POST /payments/setup': 'Setup Stripe account',
  'POST /payments/process': 'Process payment',
  'POST /payments/recurring': 'Setup recurring payment',
  'GET /payments/history': 'Payment history',
  
  // Analytics endpoints
  'GET /analytics/dashboard': 'Dashboard stats',
  'GET /analytics/lending': 'Lending analytics',
  'GET /analytics/trust': 'Trust analytics',
  
  // Notification endpoints
  'GET /notifications': 'Get notifications',
  'PUT /notifications/:id/read': 'Mark as read',
  'POST /notifications/preferences': 'Update preferences',
  
  // Admin endpoints
  'GET /admin/users': 'List all users',
  'GET /admin/fraud-flags': 'Review fraud flags',
  'POST /admin/verify-user': 'Manual verification',
  'GET /admin/metrics': 'Platform metrics'
};
```

---

## 11. FRONTEND COMPONENTS {#frontend-components}

### 11.1 Main Navigation Structure

```javascript
// navigation/AppNavigator.jsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main tab navigator
const MainTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Dashboard" component={DashboardStack} />
    <Tab.Screen name="Agreements" component={AgreementsStack} />
    <Tab.Screen name="Messages" component={MessagesStack} />
    <Tab.Screen name="Profile" component={ProfileStack} />
  </Tab.Navigator>
);

// Stack navigators for each tab
const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="DebtDashboard" component={DebtDashboard} />
    <Stack.Screen name="QuickIOU" component={QuickIOU} />
    <Stack.Screen name="AddExternalDebt" component={AddExternalDebt} />
    <Stack.Screen name="Analytics" component={Analytics} />
  </Stack.Navigator>
);

const AgreementsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="AgreementsList" component={AgreementsList} />
    <Stack.Screen name="CreateAgreement" component={AgreementWizard} />
    <Stack.Screen name="AgreementDetail" component={AgreementDetail} />
    <Stack.Screen name="SignAgreement" component={SignatureScreen} />
    <Stack.Screen name="ViewPDF" component={PDFViewer} />
  </Stack.Navigator>
);

const MessagesStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Conversations" component={ConversationsList} />
    <Stack.Screen name="Chat" component={AIChat} />
    <Stack.Screen name="ReminderSettings" component={ReminderSettings} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Profile" component={UserProfile} />
    <Stack.Screen name="Verification" component={VerificationCenter} />
    <Stack.Screen name="TrustScore" component={TrustScoreDetail} />
    <Stack.Screen name="Settings" component={Settings} />
    <Stack.Screen name="Subscription" component={SubscriptionManager} />
  </Stack.Navigator>
);
```

---

## 12. SECURITY IMPLEMENTATION {#security}

```javascript
// security/securityManager.js
class SecurityManager {
  // Encryption for sensitive data
  encryptData(data, key) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
  }

  decryptData(encryptedData, key) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }

  // Rate limiting
  async checkRateLimit(userId, action) {
    const key = `rate_limit:${userId}:${action}`;
    const attempts = await redis.get(key) || 0;
    
    const limits = {
      'create_agreement': { max: 10, window: 3600 },
      'send_reminder': { max: 20, window: 3600 },
      'api_call': { max: 100, window: 60 }
    };

    const limit = limits[action];
    if (attempts >= limit.max) {
      return { allowed: false, resetIn: limit.window };
    }

    await redis.incr(key);
    await redis.expire(key, limit.window);
    
    return { allowed: true };
  }

  // Input validation
  validateLoanData(data) {
    const errors = [];

    if (data.amount <= 0 || data.amount > 50000) {
      errors.push('Amount must be between $1 and $50,000');
    }

    if (data.interest_rate < 0 || data.interest_rate > 36) {
      errors.push('Interest rate must be between 0% and 36%');
    }

    if (data.grace_period < 0 || data.grace_period > 30) {
      errors.push('Grace period must be between 0 and 30 days');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Audit logging
  async logSecurityEvent(event) {
    await supabase
      .from('security_audit_log')
      .insert({
        event_type: event.type,
        user_id: event.userId,
        ip_address: event.ip,
        user_agent: event.userAgent,
        details: event.details,
        timestamp: new Date()
      });
  }
}

export default new SecurityManager();
```

---

## 13. PRICING & MONETIZATION {#pricing}

```javascript
// config/pricing.js
export const PRICING_TIERS = {
  FREE: {
    name: 'Trust Starter',
    price: 0,
    features: {
      active_transactions: 3,
      ai_reminders_per_month: 5,
      basic_templates: true,
      trust_score: true,
      manual_payment_logging: true,
      dashboard: 'basic'
    },
    restrictions: {
      ai_messaging: false,
      pdf_generation: false,
      payment_integration: false,
      advanced_analytics: false,
      verification_badges: false,
      api_access: false
    }
  },
  
  PRO_MONTHLY: {
    name: 'Trust Builder',
    price: 8.99,
    billing: 'monthly',
    features: {
      active_transactions: 'unlimited',
      ai_reminders_per_month: 100,
      ai_messaging: true,
      smart_scheduling: true,
      pdf_generation: true,
      phone_verification: true,
      tax_export: true,
      priority_support: true,
      custom_schedules: true,
      settlement_calculator: true
    }
  },
  
  PRO_YEARLY: {
    name: 'Trust Master',
    price: 71.99,
    billing: 'yearly',
    savings: '33%',
    features: {
      everything_in_monthly: true,
      unlimited_ai_messages: true,
      bank_verification: true,
      advanced_analytics: true,
      early_access: true,
      founding_member_badge: true
    }
  },
  
  LIFETIME: {
    name: 'Trust Founder',
    price: 149,
    availability: 'FIRST_500_ONLY',
    features: {
      everything_forever: true,
      all_future_features: true,
      api_access: true,
      white_label_option: true,
      founding_500_badge: true,
      founder_access: true,
      investment_priority: true
    }
  }
};

// Subscription manager
class SubscriptionManager {
  async createSubscription(userId, tier) {
    const pricing = PRICING_TIERS[tier];
    
    if (tier === 'LIFETIME') {
      return await this.createLifetimeSubscription(userId);
    }
    
    // Create Stripe subscription
    const subscription = await stripe.subscriptions.create({
      customer: userId,
      items: [{
        price: pricing.stripe_price_id
      }],
      metadata: {
        prosperly_user_id: userId,
        tier: tier
      }
    });
    
    // Update user record
    await supabase
      .from('users')
      .update({
        subscription_tier: tier,
        subscription_id: subscription.id,
        subscription_expires_at: new Date(subscription.current_period_end * 1000)
      })
      .eq('id', userId);
    
    return subscription;
  }
  
  async createLifetimeSubscription(userId) {
    // Check if still available
    const lifetimeCount = await supabase
      .from('users')
      .select('count')
      .eq('lifetime_member', true);
    
    if (lifetimeCount >= 500) {
      throw new Error('Lifetime memberships sold out');
    }
    
    // Process one-time payment
    const payment = await stripe.paymentIntents.create({
      amount: 14900, // $149
      currency: 'usd',
      metadata: {
        user_id: userId,
        type: 'lifetime_membership'
      }
    });
    
    // Update user
    await supabase
      .from('users')
      .update({
        lifetime_member: true,
        subscription_tier: 'lifetime',
        lifetime_member_number: lifetimeCount + 1
      })
      .eq('id', userId);
    
    return payment;
  }
}
```

---

## 14. LAUNCH CHECKLIST {#launch-checklist}

### Week 1: Core Features (CRITICAL)
- [ ] Fix auth navigation bug
- [ ] Integrate Claude API for messaging
- [ ] Build signature capture component
- [ ] Implement PDF generation
- [ ] Add phone verification
- [ ] Create debt tracking screens
- [ ] Test full loan creation flow

### Week 2: Polish & Security
- [ ] Add rate limiting
- [ ] Implement device fingerprinting
- [ ] Set up fraud detection
- [ ] Create analytics dashboard
- [ ] Build subscription management
- [ ] Add Terms of Service
- [ ] Create Privacy Policy

### Week 3: Launch Preparation
- [ ] Set up production environment
- [ ] Configure monitoring (Sentry)
- [ ] Set up analytics (Mixpanel)
- [ ] Create landing page
- [ ] Prepare marketing materials
- [ ] Set up customer support
- [ ] Beta test with 50 users

### Launch Week
- [ ] Monday: Soft launch to email list
- [ ] Tuesday: ProductHunt launch
- [ ] Wednesday: Press release
- [ ] Thursday: Social media campaign
- [ ] Friday: Influencer outreach
- [ ] Weekend: Iterate based on feedback

---

## DEPLOYMENT COMMANDS

```bash
# Install dependencies
npm install

# Environment setup
cp .env.example .env
# Add all API keys to .env

# Database migrations
npx supabase db push

# Run development
npm run dev

# Build for production
npm run build

# Deploy to production
npm run deploy

# Run tests
npm test
```

---

## SUPPORT & DOCUMENTATION

- Technical Documentation: `/docs`
- API Reference: `/docs/api`
- User Guide: `/docs/user-guide`
- Admin Panel: `/admin`
- Support: support@prosperly.app

---

## CONCLUSION

This document contains everything needed to complete Prosperly. The priority is:

1. **AI Messaging** (differentiator)
2. **Digital Signatures** (legal validity)
3. **PDF Generation** (core value)
4. **Verification System** (trust)

Focus on launching with these four features working perfectly. Everything else can be added post-launch based on user feedback.

Remember: **Launch with AI or don't launch at all.** That's your moat against the big players.

Good luck with the build! 🚀
