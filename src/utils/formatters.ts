import { Currency, Language } from '../types';

export const formatCurrency = (amount: number, currency: Currency = 'XAF'): string => {
  if (isNaN(amount)) amount = 0;
  
  if (currency === 'XAF' || currency === 'XOF') {
    // Format without decimal points, space separated
    const formatted = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${formatted} FCFA`;
  }

  if (currency === 'EUR') {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  }

  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  return `${amount} ${currency}`;
};

export const formatDate = (dateString?: string, language: Language = 'fr'): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString?: string, language: Language = 'fr'): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
};

export interface CameroonTaxBreakdown {
  grossSalary: number;
  cnpsEmployee: number;
  irppTax: number;
  cacTax: number;
  cfcTax: number;
  ravTax: number;
  totalDeductions: number;
  netSalary: number;
}

/**
 * Calcul des charges sociales et fiscales selon la législation camerounaise (standard indicatif)
 * CNPS part salariale : 4.2% plafonné à 750 000 FCFA de salaire de base
 * CFC : 1% du salaire brut imposable
 * RAV : Redevance audiovisuelle (tranches forfaitaires)
 * IRPP : Barème progressif avec déduction 30% frais professionnels
 * CAC : 10% de l'IRPP
 */
export const calculateCameroonPayroll = (
  baseSalary: number,
  transportAllowance: number = 0,
  housingAllowance: number = 0,
  bonuses: number = 0,
  advances: number = 0,
  customTaxRates?: {
    cnpsRate?: number;
    cnpsCeiling?: number;
    cfcRate?: number;
  }
): CameroonTaxBreakdown => {
  const grossSalary = baseSalary + transportAllowance + housingAllowance + bonuses;

  const cnpsRate = customTaxRates?.cnpsRate ?? 0.042; // 4.2%
  const cnpsCeiling = customTaxRates?.cnpsCeiling ?? 750000;
  const cnpsBase = Math.min(baseSalary, cnpsCeiling);
  const cnpsEmployee = Math.round(cnpsBase * cnpsRate);

  // CFC : 1%
  const cfcRate = customTaxRates?.cfcRate ?? 0.01;
  const cfcTax = Math.round(grossSalary * cfcRate);

  // RAV forfaitaire
  let ravTax = 0;
  if (grossSalary > 500000) ravTax = 13000;
  else if (grossSalary > 400000) ravTax = 10000;
  else if (grossSalary > 300000) ravTax = 7000;
  else if (grossSalary > 200000) ravTax = 4000;
  else if (grossSalary > 100000) ravTax = 2000;
  else if (grossSalary > 50000) ravTax = 750;

  // IRPP simplifié indicatif (après abattement forf. 30%)
  const taxableBase = Math.max(0, (grossSalary - cnpsEmployee) * 0.7);
  let irppTax = 0;
  if (taxableBase > 500000) {
    irppTax = Math.round(taxableBase * 0.22);
  } else if (taxableBase > 300000) {
    irppTax = Math.round(taxableBase * 0.15);
  } else if (taxableBase > 150000) {
    irppTax = Math.round(taxableBase * 0.10);
  } else if (taxableBase > 60000) {
    irppTax = Math.round(taxableBase * 0.05);
  }

  // CAC : 10% de l'IRPP
  const cacTax = Math.round(irppTax * 0.1);

  const totalDeductions = cnpsEmployee + irppTax + cacTax + cfcTax + ravTax + advances;
  const netSalary = Math.max(0, grossSalary - totalDeductions);

  return {
    grossSalary,
    cnpsEmployee,
    irppTax,
    cacTax,
    cfcTax,
    ravTax,
    totalDeductions,
    netSalary,
  };
};
