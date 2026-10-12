export type Currency = 'XAF' | 'XOF' | 'EUR' | 'USD';
export type Language = 'fr' | 'en';
export type UserRole = 'superadmin' | 'owner' | 'director' | 'accountant' | 'hr' | 'sales' | 'employee';

export type ERPModuleId = 'finances' | 'invoices' | 'hr' | 'payroll' | 'assets' | 'crm' | 'reports';

export interface ModuleSubscription {
  moduleId: ERPModuleId;
  name: string;
  description: string;
  isEnabled: boolean;
  expiresAt: string; // 'YYYY-MM-DD'
  monthlyPrice: number; // in XAF
}

export interface Tenant {
  id: string;
  name: string;
  legalForm: string; // SARL, SA, SAS, ETS
  taxId: string; // NIU (Numéro d'Identifiant Unique)
  tradeRegister: string; // RCCM
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  currency: Currency;
  vatRate: number; // e.g. 19.25
  stampDuty: number; // droit de timbre fiscal
  subscriptionPlan: 'starter' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'suspended' | 'expired';
  expiresAt: string; // Global expiration date (YYYY-MM-DD)
  modules: Record<ERPModuleId, ModuleSubscription>;
  createdAt?: string;
  notes?: string;
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  department?: string;
  isActive: boolean;
  lastLogin?: string;
}

export type PaymentMethod = 'cash' | 'momo_mtn' | 'om_orange' | 'bank_transfer' | 'check' | 'card';
export type PaymentStatus = 'paid' | 'advance' | 'pending' | 'unpaid';
export type TransactionType = 'income' | 'expense';

export interface FinancialAccount {
  id: string;
  tenantId: string;
  name: string;
  type: 'cash' | 'momo' | 'orange_money' | 'bank';
  accountNumber?: string;
  balance: number;
  initialBalance: number;
  currency: Currency;
}

export interface Transaction {
  id: string;
  tenantId: string;
  accountId: string;
  date: string; // ISO date
  type: TransactionType;
  category: string;
  description: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  partyName: string; // Client or Supplier name
  partyType: 'client' | 'supplier' | 'employee' | 'other';
  reference?: string;
  attachmentName?: string;
  createdBy: string;
  isArchived?: boolean;
}

export interface DailyClosing {
  id: string;
  tenantId: string;
  date: string;
  accountId: string;
  openingBalance: number;
  totalIncome: number;
  totalExpense: number;
  calculatedClosingBalance: number;
  actualClosingBalance: number;
  difference: number;
  notes?: string;
  validatedBy: string;
  status: 'draft' | 'validated';
}

export interface BudgetCategory {
  id: string;
  tenantId: string;
  category: string;
  monthlyLimit: number;
  currentSpent: number;
}

export type InvoiceType = 'estimate' | 'proforma' | 'invoice' | 'credit_note' | 'receipt';
export type InvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  tenantId: string;
  number: string;
  type: InvoiceType;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  customerTaxId?: string;
  date: string;
  dueDate: string;
  subject: string;
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  taxRate: number; // 19.25%
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: InvoiceStatus;
  paymentTerms?: string;
  notes?: string;
  qrCodeUrl?: string;
  isArchived?: boolean;
  createdAt: string;
}

export interface Employee {
  id: string;
  tenantId: string;
  matricule: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  nationalId: string; // CNI
  birthDate: string;
  birthPlace: string;
  gender: 'M' | 'F';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  childrenCount: number;
  phone: string;
  email: string;
  address: string;
  city: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  cnpsNumber: string;
  paymentMode: 'bank' | 'momo_mtn' | 'om_orange' | 'cash';
  paymentDetails: string; // IBAN or MoMo phone
  position: string;
  department: string;
  managerName?: string;
  contractType: 'CDI' | 'CDD' | 'stage' | 'prestataire';
  hireDate: string;
  trialPeriodEndDate?: string;
  contractEndDate?: string;
  baseSalary: number;
  transportAllowance: number;
  housingAllowance: number;
  performanceBonus: number;
  status: 'active' | 'on_leave' | 'terminated';
  isArchived?: boolean;
}

export interface LeaveRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  type: 'paid' | 'sick' | 'maternity' | 'paternity' | 'unpaid' | 'exceptional';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  createdAt: string;
}

export interface PayrollRecord {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  matricule: string;
  position: string;
  department: string;
  month: string; // e.g. "2026-10"
  baseSalary: number;
  transportAllowance: number;
  housingAllowance: number;
  overtimeAmount: number;
  bonusAmount: number;
  grossSalary: number;
  // Deductions Cameroun
  cnpsEmployee: number; // 4.2%
  irppTax: number; // Impôt sur le revenu
  cacTax: number; // Centimes additionnels (10% IRPP)
  cfcTax: number; // Crédit foncier (1%)
  ravTax: number; // Redevance audiovisuelle
  salaryAdvanceDeduction: number;
  totalDeductions: number;
  netSalary: number;
  status: 'pending' | 'paid';
  paidDate?: string;
  paymentMethod: PaymentMethod;
}

export interface Asset {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  category: 'it' | 'vehicle' | 'furniture' | 'machinery' | 'telecom' | 'other';
  brand?: string;
  model?: string;
  serialNumber: string;
  purchaseDate: string;
  purchaseCost: number;
  currentValue: number;
  lifespanYears: number;
  warrantyExpiration?: string;
  location: string;
  status: 'available' | 'assigned' | 'in_repair' | 'rented' | 'decommissioned';
  assignedToEmployeeId?: string;
  assignedToEmployeeName?: string;
  assignedDate?: string;
  condition: 'new' | 'good' | 'fair' | 'damaged';
  isArchived?: boolean;
}

export interface AssetAssignment {
  id: string;
  tenantId: string;
  assetId: string;
  assetName: string;
  employeeId: string;
  employeeName: string;
  assignedDate: string;
  returnDate?: string;
  conditionAtHandover: string;
  conditionAtReturn?: string;
  signedDigitally: boolean;
  notes?: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  companyName?: string;
  type: 'individual' | 'company';
  taxId?: string;
  email: string;
  phone: string;
  whatsapp: string;
  city: string;
  country: string;
  address: string;
  sector: string;
  source: string;
  salesRep: string;
  status: 'lead' | 'prospect' | 'customer' | 'vip' | 'inactive';
  totalPurchases: number;
  lifetimeValue: number;
  lastPurchaseDate?: string;
  notes: string;
  isArchived?: boolean;
}

export interface CrmDeal {
  id: string;
  tenantId: string;
  title: string;
  customerId: string;
  customerName: string;
  value: number;
  stage: 'new' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  lostReason?: string;
  expectedCloseDate: string;
  assignedTo: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
}

export interface AppNotification {
  id: string;
  tenantId: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'danger';
  date: string;
  isRead: boolean;
  linkModule?: string;
}
