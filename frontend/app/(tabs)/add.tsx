import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { LoanService } from '../../src/services/loan.service';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Colors } from '../../src/constants/colors';
import { Typography } from '../../src/constants/typography';
import {
  Borrower,
  RelationshipType,
  RepaymentType,
  ReminderChannel,
  LoanFormData,
} from '../../src/types';
import {
  Step1RelationshipBorrower,
  Step2LoanBasics,
  Step3RepaymentStructure,
  Step4DatesSchedule,
  Step5ReminderStrategy,
  Step6MessagePreview,
  Step7Summary,
} from '../../src/components/LoanWizard';

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface WizardState {
  // Step 1
  relationshipType?: RelationshipType;
  borrowerId?: string;
  newBorrowerName?: string;
  newBorrowerPhone?: string;
  newBorrowerEmail?: string;
  
  // Step 2
  amount?: number;
  currency: string;
  interestRate?: number;
  notes?: string;
  
  // Step 3
  repaymentType?: RepaymentType;
  numberOfPayments?: number;
  
  // Step 4
  startDate?: string;
  finalDueDate?: string;
  
  // Step 5
  daysBeforeDue: number;
  daysAfterDue: number;
  channels: ReminderChannel[];
  useToneEscalation: boolean;
}

export default function AddLoanScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [loading, setLoading] = useState(false);
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);

  const [wizardState, setWizardState] = useState<WizardState>({
    currency: 'USD',
    daysBeforeDue: 3,
    daysAfterDue: 1,
    channels: ['in_app'],
    useToneEscalation: true,
  });

  useEffect(() => {
    loadBorrowers();
  }, []);

  const loadBorrowers = async () => {
    if (!user) return;
    try {
      const data = await LoanService.getBorrowers(user.id);
      setBorrowers(data);
    } catch (error) {
      console.error('Error loading borrowers:', error);
    }
  };

  const updateState = (updates: Partial<WizardState>) => {
    setWizardState(prev => ({ ...prev, ...updates }));
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(wizardState.relationshipType && 
          (wizardState.borrowerId || wizardState.newBorrowerName));
      case 2:
        return !!(wizardState.amount && wizardState.amount > 0);
      case 3:
        return !!(wizardState.repaymentType);
      case 4:
        return !!(wizardState.startDate && wizardState.finalDueDate);
      case 5:
        return wizardState.channels.length > 0;
      case 6:
        return true;
      case 7:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 7) {
      setCurrentStep((currentStep + 1) as WizardStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep);
    }
  };

  const handleCreateLoan = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const formData: LoanFormData = {
        borrower_id: wizardState.borrowerId,
        borrower_name: wizardState.newBorrowerName,
        borrower_phone: wizardState.newBorrowerPhone,
        borrower_email: wizardState.newBorrowerEmail,
        principal_amount: wizardState.amount!,
        currency: wizardState.currency,
        interest_rate: wizardState.interestRate,
        start_date: wizardState.startDate!,
        final_due_date: wizardState.finalDueDate!,
        repayment_type: wizardState.repaymentType!,
        installment_count: wizardState.numberOfPayments,
        notes: wizardState.notes,
        reminder_days_before: wizardState.daysBeforeDue,
        reminder_channels: wizardState.channels,
      };

      await LoanService.createLoan(formData, user.id);

      Alert.alert(
        'Success! 🎉',
        'Loan created successfully',
        [
          {
            text: 'View Dashboard',
            onPress: () => router.replace('/(tabs)/dashboard'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating loan:', error);
      Alert.alert('Error', error.message || 'Failed to create loan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4, 5, 6, 7].map((step) => (
        <View key={step} style={styles.stepDot}>
          <View
            style={[
              styles.stepDotInner,
              step === currentStep && styles.stepDotActive,
              step < currentStep && styles.stepDotComplete,
            ]}
          >
            {step < currentStep ? (
              <Ionicons name="checkmark" size={12} color={Colors.white} />
            ) : (
              <Text
                style={[
                  styles.stepDotText,
                  step === currentStep && styles.stepDotTextActive,
                ]}
              >
                {step}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const renderCurrentStep = () => {
    const commonProps = {
      wizardState,
      updateState,
      borrowers,
      onLoadBorrowers: loadBorrowers,
    };

    switch (currentStep) {
      case 1:
        return <Step1RelationshipBorrower {...commonProps} />;
      case 2:
        return <Step2LoanBasics {...commonProps} />;
      case 3:
        return <Step3RepaymentStructure {...commonProps} />;
      case 4:
        return <Step4DatesSchedule {...commonProps} />;
      case 5:
        return <Step5ReminderStrategy {...commonProps} />;
      case 6:
        return <Step6MessagePreview {...commonProps} borrowers={borrowers} />;
      case 7:
        return (
          <Step7Summary 
            {...commonProps} 
            borrowers={borrowers}
            onCreateLoan={handleCreateLoan}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => currentStep > 1 ? handleBack() : router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.prosperlyNavy} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Create Loan</Text>
            <Text style={styles.headerSubtitle}>Step {currentStep} of 7</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderCurrentStep()}
        </ScrollView>

        {/* Navigation Buttons */}
        {currentStep < 7 && (
          <View style={styles.navigationButtons}>
            {currentStep > 1 && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={!canProceed()}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.prosperlyNavy,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray[600],
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  stepDot: {
    flex: 1,
  },
  stepDotInner: {
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: Colors.prosperlyBlue,
  },
  stepDotComplete: {
    backgroundColor: Colors.prosperlyMint,
  },
  stepDotText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.gray[600],
  },
  stepDotTextActive: {
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  navigationButtons: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.gray[700],
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.prosperlyBlue,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.gray[300],
  },
  nextButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
});