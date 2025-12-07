import { ProsperlyRating } from '../types';

/**
 * Calculate Prosperly Rating based on payment history
 * Modular design allows for future enhancements (weighting by amount, streaks, etc.)
 */
export function calculateProsperlyRating(
  totalPayments: number,
  onTimePayments: number
): ProsperlyRating | null {
  // Not enough history
  if (totalPayments === 0) {
    return null;
  }

  const ratio = onTimePayments / totalPayments;

  if (ratio >= 0.90) {
    return { stars: 5, label: 'Excellent', ratio };
  } else if (ratio >= 0.75) {
    return { stars: 4, label: 'Reliable', ratio };
  } else if (ratio >= 0.60) {
    return { stars: 3, label: 'Mixed', ratio };
  } else if (ratio >= 0.40) {
    return { stars: 2, label: 'At Risk', ratio };
  } else {
    return { stars: 1, label: 'Unreliable', ratio };
  }
}

/**
 * Get tips for improving rating
 */
export function getRatingTips(rating: ProsperlyRating | null): string[] {
  if (!rating) {
    return [
      'Complete your first transaction to start building your rating',
      'Pay on time to establish a strong track record',
      'Set up reminders to never miss a payment',
    ];
  }

  if (rating.stars >= 4) {
    return [
      'Great work! Keep making on-time payments',
      'Your excellent rating shows strong financial discipline',
      'Continue this pattern to maintain your rating',
    ];
  }

  if (rating.stars === 3) {
    return [
      'Focus on making payments before the due date',
      'Enable reminders for all your transactions',
      'A few more on-time payments will boost your rating',
    ];
  }

  return [
    'Make on-time payments to improve your rating',
    'Set up daily reminders for upcoming payments',
    'Your next on-time payment will help rebuild trust',
  ];
}
