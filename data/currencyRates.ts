// Approximate conversion rates from EUR. Last checked mid-2024.
// For a real application, this should be replaced by a live currency conversion API.
export const rates: Record<string, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.85,
  CHF: 0.97,
  CAD: 1.48,
  AUD: 1.64,
  XOF: 655.96, // West African CFA franc
  XAF: 655.96, // Central African CFA franc
  MAD: 10.87, // Moroccan Dirham
  DZD: 145.45, // Algerian Dinar
  TND: 3.37,  // Tunisian Dinar
  MXN: 18.25, // Mexican Peso
  ARS: 975.35, // Argentine Peso
};
