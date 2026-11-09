import {
  Tenant,
  User,
  FinancialAccount,
  Transaction,
  DailyClosing,
  BudgetCategory,
  Invoice,
  Employee,
  LeaveRequest,
  PayrollRecord,
  Asset,
  AssetAssignment,
  Customer,
  CrmDeal,
  AuditLog,
  AppNotification,
  ERPModuleId
} from '../types';

export const defaultModulesCatalog: Record<ERPModuleId, { name: string; description: string; monthlyPrice: number }> = {
  finances: {
    name: 'Journal Financier & Caisse',
    description: 'Suivi journalier, entrées/sorties, caisses physiques, Mobile Money (MTN/Orange), clôtures et prévisions',
    monthlyPrice: 15000,
  },
  invoices: {
    name: 'Facturation & Devis',
    description: 'Devis, factures proforma, factures définitives avec TVA 19.25%, QR code et relance WhatsApp',
    monthlyPrice: 10000,
  },
  hr: {
    name: 'Ressources Humaines',
    description: 'Dossiers employés, immatriculation CNPS, contrats, attestations et congés',
    monthlyPrice: 15000,
  },
  payroll: {
    name: 'Paie & Salaires Cameroun',
    description: 'Moteur de calcul CNPS 4.2%, IRPP, CAC, CFC, bulletins de paie et ordres de virement',
    monthlyPrice: 20000,
  },
  assets: {
    name: 'Parc Matériel & Décharges',
    description: 'Inventaire, fiches de décharge signées numériquement, amortissement et maintenance',
    monthlyPrice: 10000,
  },
  crm: {
    name: 'CRM & Pipeline Commercial',
    description: 'Pipeline de vente Kanban, fiches clients, segmentation et contact direct WhatsApp',
    monthlyPrice: 10000,
  },
  reports: {
    name: 'Bilans & Analyses Financières',
    description: 'Bilans périodiques OHADA, calcul de la marge nette et ventilation par service',
    monthlyPrice: 10000,
  },
};

export const initialTenants: Tenant[] = [
  {
    id: 'tenant-kemet-dla',
    name: 'Kemet Technologies SARL',
    legalForm: 'SARL',
    taxId: 'M021912839210B',
    tradeRegister: 'RC/DLA/2019/B/1420',
    address: '142 Rue Sylvani, Akwa',
    city: 'Douala',
    country: 'Cameroun',
    phone: '+237 677 89 45 12',
    email: 'contact@kemet-tech.cm',
    website: 'https://kemet-tech.cm',
    currency: 'XAF',
    vatRate: 19.25,
    stampDuty: 1000,
    subscriptionPlan: 'enterprise',
    subscriptionStatus: 'active',
    expiresAt: '2026-11-30',
    createdAt: '2024-01-15',
    modules: {
      finances: { moduleId: 'finances', name: 'Journal Financier & Caisse', description: defaultModulesCatalog.finances.description, isEnabled: true, expiresAt: '2026-11-30', monthlyPrice: 15000 },
      invoices: { moduleId: 'invoices', name: 'Facturation & Devis', description: defaultModulesCatalog.invoices.description, isEnabled: true, expiresAt: '2026-11-30', monthlyPrice: 10000 },
      hr: { moduleId: 'hr', name: 'Ressources Humaines', description: defaultModulesCatalog.hr.description, isEnabled: true, expiresAt: '2026-11-30', monthlyPrice: 15000 },
      payroll: { moduleId: 'payroll', name: 'Paie & Salaires Cameroun', description: defaultModulesCatalog.payroll.description, isEnabled: true, expiresAt: '2026-11-30', monthlyPrice: 20000 },
      assets: { moduleId: 'assets', name: 'Parc Matériel & Décharges', description: defaultModulesCatalog.assets.description, isEnabled: true, expiresAt: '2026-11-30', monthlyPrice: 10000 },
      crm: { moduleId: 'crm', name: 'CRM & Pipeline Commercial', description: defaultModulesCatalog.crm.description, isEnabled: true, expiresAt: '2026-11-30', monthlyPrice: 10000 },
      reports: { moduleId: 'reports', name: 'Bilans & Analyses Financières', description: defaultModulesCatalog.reports.description, isEnabled: true, expiresAt: '2026-11-30', monthlyPrice: 10000 },
    },
    notes: 'Client grand compte avec suite logicielle intégrale active.',
  },
  {
    id: 'tenant-etoile-yde',
    name: 'Cabinet Conseil Étoile',
    legalForm: 'ETS',
    taxId: 'M082119482011K',
    tradeRegister: 'RC/YAO/2021/A/890',
    address: 'Avenue Kennedy, Bastos',
    city: 'Yaoundé',
    country: 'Cameroun',
    phone: '+237 699 12 34 56',
    email: 'info@conseil-etoile.cm',
    currency: 'XAF',
    vatRate: 19.25,
    stampDuty: 1000,
    subscriptionPlan: 'starter',
    subscriptionStatus: 'active',
    expiresAt: '2026-11-15',
    createdAt: '2025-05-10',
    modules: {
      finances: { moduleId: 'finances', name: 'Journal Financier & Caisse', description: defaultModulesCatalog.finances.description, isEnabled: true, expiresAt: '2026-11-15', monthlyPrice: 15000 },
      invoices: { moduleId: 'invoices', name: 'Facturation & Devis', description: defaultModulesCatalog.invoices.description, isEnabled: true, expiresAt: '2026-11-15', monthlyPrice: 10000 },
      hr: { moduleId: 'hr', name: 'Ressources Humaines', description: defaultModulesCatalog.hr.description, isEnabled: false, expiresAt: '2026-10-01', monthlyPrice: 15000 },
      payroll: { moduleId: 'payroll', name: 'Paie & Salaires Cameroun', description: defaultModulesCatalog.payroll.description, isEnabled: false, expiresAt: '2026-10-01', monthlyPrice: 20000 },
      assets: { moduleId: 'assets', name: 'Parc Matériel & Décharges', description: defaultModulesCatalog.assets.description, isEnabled: false, expiresAt: '2026-10-01', monthlyPrice: 10000 },
      crm: { moduleId: 'crm', name: 'CRM & Pipeline Commercial', description: defaultModulesCatalog.crm.description, isEnabled: false, expiresAt: '2026-10-01', monthlyPrice: 10000 },
      reports: { moduleId: 'reports', name: 'Bilans & Analyses Financières', description: defaultModulesCatalog.reports.description, isEnabled: false, expiresAt: '2026-10-01', monthlyPrice: 10000 },
    },
    notes: 'Abonnement sur-mesure : Uniquement Caisse + Facturation.',
  },
  {
    id: 'tenant-bassa-exp',
    name: 'Boulangerie Bassa SARL',
    legalForm: 'SARL',
    taxId: 'M112399482012P',
    tradeRegister: 'RC/DLA/2023/B/801',
    address: 'Zone Industrielle Bassa',
    city: 'Douala',
    country: 'Cameroun',
    phone: '+237 655 22 33 44',
    email: 'contact@boulangerie-bassa.cm',
    currency: 'XAF',
    vatRate: 19.25,
    stampDuty: 1000,
    subscriptionPlan: 'starter',
    subscriptionStatus: 'expired',
    expiresAt: '2026-10-01', // Date expirée !
    createdAt: '2026-06-01',
    modules: {
      finances: { moduleId: 'finances', name: 'Journal Financier & Caisse', description: defaultModulesCatalog.finances.description, isEnabled: true, expiresAt: '2026-10-01', monthlyPrice: 15000 },
      invoices: { moduleId: 'invoices', name: 'Facturation & Devis', description: defaultModulesCatalog.invoices.description, isEnabled: true, expiresAt: '2026-10-01', monthlyPrice: 10000 },
      hr: { moduleId: 'hr', name: 'Ressources Humaines', description: defaultModulesCatalog.hr.description, isEnabled: false, expiresAt: '2026-10-01', monthlyPrice: 15000 },
      payroll: { moduleId: 'payroll', name: 'Paie & Salaires Cameroun', description: defaultModulesCatalog.payroll.description, isEnabled: false, expiresAt: '2026-10-01', monthlyPrice: 20000 },
      assets: { moduleId: 'assets', name: 'Parc Matériel & Décharges', description: defaultModulesCatalog.assets.description, isEnabled: false, expiresAt: '2026-10-01', monthlyPrice: 10000 },
      crm: { moduleId: 'crm', name: 'CRM & Pipeline Commercial', description: defaultModulesCatalog.crm.description, isEnabled: false, expiresAt: '2026-10-01', monthlyPrice: 10000 },
      reports: { moduleId: 'reports', name: 'Bilans & Analyses Financières', description: defaultModulesCatalog.reports.description, isEnabled: false, expiresAt: '2026-10-01', monthlyPrice: 10000 },
    },
    notes: 'Abonnement arrivé à échéance sans paiement. Accès temporairement coupé.',
  }
];

export const initialUsers: User[] = [
  {
    id: 'user-1',
    tenantId: 'tenant-kemet-dla',
    name: 'Alexandre Mbida',
    email: 'alexandre.mbida@kemet-tech.cm',
    role: 'owner',
    phone: '+237 677 89 45 12',
    department: 'Direction Générale',
    isActive: true,
    lastLogin: '2026-10-12T08:30:00Z',
  },
  {
    id: 'user-2',
    tenantId: 'tenant-kemet-dla',
    name: 'Bernadette Ngo Mandeng',
    email: 'b.ngo@kemet-tech.cm',
    role: 'accountant',
    phone: '+237 694 22 11 00',
    department: 'Comptabilité & Trésorerie',
    isActive: true,
    lastLogin: '2026-10-12T09:15:00Z',
  },
  {
    id: 'user-3',
    tenantId: 'tenant-kemet-dla',
    name: 'Patrick Fotso',
    email: 'p.fotso@kemet-tech.cm',
    role: 'hr',
    phone: '+237 675 33 44 88',
    department: 'Ressources Humaines',
    isActive: true,
    lastLogin: '2026-10-11T16:00:00Z',
  },
  {
    id: 'user-4',
    tenantId: 'tenant-kemet-dla',
    name: 'Stéphanie Eboué',
    email: 's.eboue@kemet-tech.cm',
    role: 'sales',
    phone: '+237 651 88 99 22',
    department: 'Commercial & Partenariats',
    isActive: true,
    lastLogin: '2026-10-12T07:45:00Z',
  },
];

export const initialAccounts: FinancialAccount[] = [
  {
    id: 'acc-1',
    tenantId: 'tenant-kemet-dla',
    name: 'Caisse Principale (Akwa)',
    type: 'cash',
    balance: 0,
    initialBalance: 0,
    currency: 'XAF',
  },
  {
    id: 'acc-2',
    tenantId: 'tenant-kemet-dla',
    name: 'MTN Mobile Money Pro',
    type: 'momo',
    accountNumber: '+237 677 89 45 12',
    balance: 0,
    initialBalance: 0,
    currency: 'XAF',
  },
  {
    id: 'acc-3',
    tenantId: 'tenant-kemet-dla',
    name: 'Orange Money Entreprise',
    type: 'orange_money',
    accountNumber: '+237 699 44 55 66',
    balance: 0,
    initialBalance: 0,
    currency: 'XAF',
  },
  {
    id: 'acc-4',
    tenantId: 'tenant-kemet-dla',
    name: 'Afriland First Bank (Compte Courant)',
    type: 'bank',
    accountNumber: 'CM21 10005 00012 049581902 43',
    balance: 0,
    initialBalance: 0,
    currency: 'XAF',
  },
  {
    id: 'acc-etoile-1',
    tenantId: 'tenant-etoile-yde',
    name: 'Caisse Principale (Bastos)',
    type: 'cash',
    balance: 0,
    initialBalance: 0,
    currency: 'XAF',
  },
  {
    id: 'acc-bassa-1',
    tenantId: 'tenant-bassa-exp',
    name: 'Caisse Principale (Bassa)',
    type: 'cash',
    balance: 0,
    initialBalance: 0,
    currency: 'XAF',
  },
];

export const initialTransactions: Transaction[] = [];

export const initialBudgetCategories: BudgetCategory[] = [
  {
    id: 'b-1',
    tenantId: 'tenant-kemet-dla',
    category: 'Carburant & Énergie',
    monthlyLimit: 250000,
    currentSpent: 0,
  },
  {
    id: 'b-2',
    tenantId: 'tenant-kemet-dla',
    category: 'Loyer & Charges',
    monthlyLimit: 500000,
    currentSpent: 0,
  },
  {
    id: 'b-3',
    tenantId: 'tenant-kemet-dla',
    category: 'Télécoms & Internet',
    monthlyLimit: 200000,
    currentSpent: 0,
  },
  {
    id: 'b-4',
    tenantId: 'tenant-kemet-dla',
    category: 'Fournitures de bureau',
    monthlyLimit: 150000,
    currentSpent: 0,
  },
  {
    id: 'b-5',
    tenantId: 'tenant-kemet-dla',
    category: 'Marketing & Déplacements',
    monthlyLimit: 400000,
    currentSpent: 0,
  }
];

export const initialDailyClosings: DailyClosing[] = [];

export const initialCustomers: Customer[] = [];

export const initialInvoices: Invoice[] = [];

export const initialEmployees: Employee[] = [];

export const initialLeaves: LeaveRequest[] = [];

export const initialPayrolls: PayrollRecord[] = [];

export const initialAssets: Asset[] = [];

export const initialAssetAssignments: AssetAssignment[] = [];

export const initialCrmDeals: CrmDeal[] = [];

export const initialAuditLogs: AuditLog[] = [];

export const initialNotifications: AppNotification[] = [];
