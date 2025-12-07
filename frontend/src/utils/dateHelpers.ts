import { format, formatDistanceToNow, isPast, differenceInDays } from 'date-fns';

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
}

/**
 * Format date relative to now (e.g., "2 days ago")
 */
export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Check if date is overdue
 */
export function isOverdue(dueDate: string | Date): boolean {
  const dateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  return isPast(dateObj) && !isToday(dateObj);
}

/**
 * Check if date is today
 */
export function isToday(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Get days until due
 */
export function getDaysUntilDue(dueDate: string | Date): number {
  const dateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  return differenceInDays(dateObj, new Date());
}

/**
 * Check if payment was on time
 */
export function wasPaymentOnTime(dueDate: string | Date, paidDate?: string | Date): boolean {
  if (!paidDate) return false;
  
  const dueDateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const paidDateObj = typeof paidDate === 'string' ? new Date(paidDate) : paidDate;
  
  return paidDateObj <= dueDateObj;
}
