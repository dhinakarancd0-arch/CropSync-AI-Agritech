/**
 * Centralized formatting helpers for AgriDirect
 */

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '₹0';
  }
  const num = Number(amount);
  // If integer or zero decimal, don't show cents unless fractional
  const rounded = Math.round(num * 100) / 100;
  if (Number.isInteger(rounded)) {
    return `₹${rounded.toLocaleString('en-IN')}`;
  }
  return `₹${rounded.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNumber(val: number | string | null | undefined): string {
  if (val === null || val === undefined || isNaN(Number(val))) {
    return '0';
  }
  const num = Number(val);
  return num.toLocaleString('en-IN');
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}
