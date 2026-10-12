import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Tenant,
  User,
  UserRole,
  Currency,
  Language,
  FinancialAccount,
  Transaction,
  DailyClosing,
  BudgetCategory,
  Invoice,
  InvoiceType,
  Employee,
  LeaveRequest,
  PayrollRecord,
  Asset,
  AssetAssignment,
  Customer,
  CrmDeal,
  AuditLog,
  AppNotification,
  ERPModuleId,
  ModuleSubscription,
} from '../types';
import {
  initialTenants,
  initialUsers,
  initialAccounts,
  initialTransactions,
  initialDailyClosings,
  initialBudgetCategories,
  initialInvoices,
  initialEmployees,
  initialLeaves,
  initialPayrolls,
  initialAssets,
  initialAssetAssignments,
  initialCustomers,
  initialCrmDeals,
  initialAuditLogs,
  initialNotifications,
  defaultModulesCatalog,
} from '../data/mockData';

interface AppContextType {
  // Navigation & Preferences
  activeModule: string;
  setActiveModule: (module: string) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Tenant, User & Auth Session
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isImpersonating: boolean;
  login: (tenantId: string, email: string, role: UserRole) => void;
  loginSuperAdmin: () => void;
  superAdminImpersonate: (tenantId: string) => void;
  superAdminReturnToConsole: () => void;
  logout: () => void;
  registerTenant: (tenantData: Omit<Tenant, 'id'>, adminUser: { name: string; email: string; phone: string; password?: string }) => void;
  createTenantBySuperAdmin: (
    tenantData: Omit<Tenant, 'id' | 'modules'>,
    adminUser: { name: string; email: string; phone: string },
    selectedModuleIds: ERPModuleId[],
    durationMonths: number,
    customModulePrices?: Partial<Record<ERPModuleId, number>>
  ) => void;
  updateTenantModules: (
    tenantId: string,
    modules: Record<ERPModuleId, ModuleSubscription>,
    newGlobalExpirationDate?: string
  ) => void;
  renewTenantSubscription: (tenantId: string, monthsToAdd: number) => void;
  suspendTenant: (tenantId: string) => void;
  activateTenant: (tenantId: string) => void;
  deleteTenant: (tenantId: string) => void;
  addModuleToTenant: (tenantId: string, moduleId: ERPModuleId, months: number, price?: number) => void;
  isModuleAccessible: (moduleId: ERPModuleId) => boolean;
  isSubscriptionActive: () => boolean;

  currentTenant: Tenant;
  tenants: Tenant[];
  switchTenant: (tenantId: string) => void;
  updateTenantProfile: (updated: Partial<Tenant>) => void;
  currentUser: User;
  switchRole: (role: UserRole) => void;
  users: User[];

  // Finances
  accounts: FinancialAccount[];
  transactions: Transaction[];
  dailyClosings: DailyClosing[];
  budgets: BudgetCategory[];
  addTransaction: (data: Omit<Transaction, 'id' | 'tenantId'>) => void;
  archiveTransaction: (id: string) => void;
  addDailyClosing: (data: Omit<DailyClosing, 'id' | 'tenantId'>) => void;
  addAccount: (data: Omit<FinancialAccount, 'id' | 'tenantId'>) => void;

  // Invoicing
  invoices: Invoice[];
  addInvoice: (data: Omit<Invoice, 'id' | 'tenantId' | 'createdAt'>) => void;
  updateInvoiceStatus: (id: string, status: Invoice['status'], amountPaid?: number) => void;
  convertInvoice: (id: string, targetType: InvoiceType) => void;
  archiveInvoice: (id: string) => void;

  // HR & Payroll
  employees: Employee[];
  leaves: LeaveRequest[];
  payrolls: PayrollRecord[];
  addEmployee: (data: Omit<Employee, 'id' | 'tenantId'>) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  archiveEmployee: (id: string) => void;
  addLeaveRequest: (data: Omit<LeaveRequest, 'id' | 'tenantId' | 'createdAt'>) => void;
  updateLeaveStatus: (id: string, status: 'approved' | 'rejected') => void;
  addPayrollRecord: (data: Omit<PayrollRecord, 'id' | 'tenantId'>) => void;
  markPayrollPaid: (id: string, accountId: string) => void;

  // Assets
  assets: Asset[];
  assetAssignments: AssetAssignment[];
  addAsset: (data: Omit<Asset, 'id' | 'tenantId'>) => void;
  assignAsset: (assetId: string, employeeId: string, notes?: string) => void;
  returnAsset: (assetId: string, condition: 'good' | 'fair' | 'damaged') => void;
  archiveAsset: (id: string) => void;

  // CRM
  customers: Customer[];
  crmDeals: CrmDeal[];
  addCustomer: (data: Omit<Customer, 'id' | 'tenantId'>) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  archiveCustomer: (id: string) => void;
  addDeal: (data: Omit<CrmDeal, 'id' | 'tenantId'>) => void;
  updateDealStage: (id: string, stage: CrmDeal['stage'], lostReason?: string) => void;

  // Audit & Notifications
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  addAuditLog: (action: string, module: string, details: string) => void;

  // Backup & Reset
  clearAllTenantData: (tenantId: string) => void;
  exportFullBackup: () => string;
  importFullBackup: (jsonData: string) => boolean;
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'mbantam_erp_v1_';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load state or default to initial mock data
  const loadStored = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => loadStored('isAuthenticated', false));
  const [isSuperAdminSession, setIsSuperAdminSession] = useState<boolean>(() => loadStored('isSuperAdminSession', false));
  const [isImpersonating, setIsImpersonating] = useState<boolean>(() => loadStored('isImpersonating', false));
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [currency, setCurrency] = useState<Currency>(() => loadStored('currency', 'XAF'));
  const [language, setLanguage] = useState<Language>(() => loadStored('language', 'fr'));
  const [darkMode, setDarkMode] = useState<boolean>(() => loadStored('darkMode', false));

  const [tenants, setTenants] = useState<Tenant[]>(() => loadStored('tenants', initialTenants));
  const [currentTenantId, setCurrentTenantId] = useState<string>(() => loadStored('currentTenantId', 'tenant-kemet-dla'));

  const [users, setUsers] = useState<User[]>(() => loadStored('users', initialUsers));
  const [currentRole, setCurrentRole] = useState<UserRole>(() => loadStored('currentRole', 'owner'));

  const [accounts, setAccounts] = useState<FinancialAccount[]>(() => loadStored('accounts', initialAccounts));
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadStored('transactions', initialTransactions));
  const [dailyClosings, setDailyClosings] = useState<DailyClosing[]>(() => loadStored('dailyClosings', initialDailyClosings));
  const [budgets, setBudgets] = useState<BudgetCategory[]>(() => loadStored('budgets', initialBudgetCategories));

  const [invoices, setInvoices] = useState<Invoice[]>(() => loadStored('invoices', initialInvoices));
  const [employees, setEmployees] = useState<Employee[]>(() => loadStored('employees', initialEmployees));
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => loadStored('leaves', initialLeaves));
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>(() => loadStored('payrolls', initialPayrolls));

  const [assets, setAssets] = useState<Asset[]>(() => loadStored('assets', initialAssets));
  const [assetAssignments, setAssetAssignments] = useState<AssetAssignment[]>(() => loadStored('assetAssignments', initialAssetAssignments));

  const [customers, setCustomers] = useState<Customer[]>(() => loadStored('customers', initialCustomers));
  const [crmDeals, setCrmDeals] = useState<CrmDeal[]>(() => loadStored('crmDeals', initialCrmDeals));

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadStored('auditLogs', initialAuditLogs));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadStored('notifications', initialNotifications));

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'currency', JSON.stringify(currency));
    localStorage.setItem(STORAGE_PREFIX + 'language', JSON.stringify(language));
    localStorage.setItem(STORAGE_PREFIX + 'darkMode', JSON.stringify(darkMode));
    localStorage.setItem(STORAGE_PREFIX + 'tenants', JSON.stringify(tenants));
    localStorage.setItem(STORAGE_PREFIX + 'currentTenantId', JSON.stringify(currentTenantId));
    localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(users));
    localStorage.setItem(STORAGE_PREFIX + 'currentRole', JSON.stringify(currentRole));
    localStorage.setItem(STORAGE_PREFIX + 'accounts', JSON.stringify(accounts));
    localStorage.setItem(STORAGE_PREFIX + 'transactions', JSON.stringify(transactions));
    localStorage.setItem(STORAGE_PREFIX + 'dailyClosings', JSON.stringify(dailyClosings));
    localStorage.setItem(STORAGE_PREFIX + 'budgets', JSON.stringify(budgets));
    localStorage.setItem(STORAGE_PREFIX + 'invoices', JSON.stringify(invoices));
    localStorage.setItem(STORAGE_PREFIX + 'employees', JSON.stringify(employees));
    localStorage.setItem(STORAGE_PREFIX + 'leaves', JSON.stringify(leaves));
    localStorage.setItem(STORAGE_PREFIX + 'payrolls', JSON.stringify(payrolls));
    localStorage.setItem(STORAGE_PREFIX + 'assets', JSON.stringify(assets));
    localStorage.setItem(STORAGE_PREFIX + 'assetAssignments', JSON.stringify(assetAssignments));
    localStorage.setItem(STORAGE_PREFIX + 'customers', JSON.stringify(customers));
    localStorage.setItem(STORAGE_PREFIX + 'crmDeals', JSON.stringify(crmDeals));
    localStorage.setItem(STORAGE_PREFIX + 'auditLogs', JSON.stringify(auditLogs));
    localStorage.setItem(STORAGE_PREFIX + 'isAuthenticated', JSON.stringify(isAuthenticated));
    localStorage.setItem(STORAGE_PREFIX + 'notifications', JSON.stringify(notifications));

    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [
    isAuthenticated,
    currency, language, darkMode, tenants, currentTenantId, users, currentRole,
    accounts, transactions, dailyClosings, budgets, invoices, employees, leaves,
    payrolls, assets, assetAssignments, customers, crmDeals, auditLogs, notifications
  ]);

  const currentTenant = tenants.find(t => t.id === currentTenantId) || tenants[0];
  const currentUser: User = (isSuperAdminSession && !isImpersonating) ? {
    id: 'user-superadmin',
    tenantId: 'platform-master',
    name: 'Super Administrateur Mbǎ\'Ntām',
    email: 'superadmin@mbantam.cm',
    role: 'superadmin',
    isActive: true,
  } : {
    id: 'user-active',
    tenantId: currentTenant.id,
    name: currentRole === 'owner' ? 'Alexandre Mbida (Directeur)' :
          currentRole === 'accountant' ? 'Bernadette Ngo Mandeng (Comptable)' :
          currentRole === 'hr' ? 'Patrick Fotso (RH)' :
          currentRole === 'sales' ? 'Stéphanie Eboué (Commerciale)' :
          'Jean-Paul Tchinda (Employé)',
    email: 'user@kemet-tech.cm',
    role: currentRole,
    isActive: true,
  };

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const login = (tenantId: string, email: string, role: UserRole) => {
    setCurrentTenantId(tenantId);
    setCurrentRole(role);
    setIsSuperAdminSession(false);
    setIsImpersonating(false);
    setIsAuthenticated(true);
    addAuditLog('Connexion réussie', 'Authentification', `Connexion de ${email} (Rôle: ${role})`);
  };

  const loginSuperAdmin = () => {
    setIsAuthenticated(true);
    setIsSuperAdminSession(true);
    setIsImpersonating(false);
    setCurrentRole('superadmin');
    setActiveModule('superadmin_console');
    addAuditLog('Connexion Super Administrateur', 'Sécurité Plateforme', 'Accès direct à la console centrale SaaS');
  };

  const superAdminImpersonate = (tenantId: string) => {
    setCurrentTenantId(tenantId);
    setIsImpersonating(true);
    setCurrentRole('owner');
    setActiveModule('dashboard');
    addAuditLog('Prise en main entreprise (Impersonation)', 'Support Super Admin', `Accès à l'environnement client ${tenantId}`);
  };

  const superAdminReturnToConsole = () => {
    setIsImpersonating(false);
    setCurrentRole('superadmin');
    setActiveModule('superadmin_console');
    addAuditLog('Retour console centrale', 'Support Super Admin', 'Fermeture de l\'environnement client');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsSuperAdminSession(false);
    setIsImpersonating(false);
    addAuditLog('Déconnexion manuelle', 'Authentification', 'Déconnexion utilisateur');
  };

  const updateTenantModules = (
    tenantId: string,
    updatedModules: Record<ERPModuleId, ModuleSubscription>,
    newGlobalExpirationDate?: string
  ) => {
    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        return {
          ...t,
          modules: updatedModules,
          expiresAt: newGlobalExpirationDate || t.expiresAt,
          subscriptionStatus: 'active',
        };
      }
      return t;
    }));
    addAuditLog('Mise à jour modules & droits', 'Super Admin', `Ajustement des modules pour l'entreprise ${tenantId}`);
  };

  const renewTenantSubscription = (tenantId: string, monthsToAdd: number) => {
    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        const currentExp = t.expiresAt;
        const now = new Date();
        const base = new Date(currentExp) < now ? now : new Date(currentExp);
        base.setMonth(base.getMonth() + monthsToAdd);
        const newExpDate = base.toISOString().split('T')[0];

        // Also update modules expiration dates if enabled
        const updatedMods = { ...t.modules };
        (Object.keys(updatedMods) as ERPModuleId[]).forEach(mId => {
          if (updatedMods[mId].isEnabled) {
            updatedMods[mId] = {
              ...updatedMods[mId],
              expiresAt: newExpDate,
            };
          }
        });

        return {
          ...t,
          expiresAt: newExpDate,
          subscriptionStatus: 'active',
          modules: updatedMods,
        };
      }
      return t;
    }));
    addAuditLog('Renouvellement abonnement', 'Super Admin', `Prolongation de ${monthsToAdd} mois pour ${tenantId}`);
  };

  const suspendTenant = (tenantId: string) => {
    setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, subscriptionStatus: 'suspended' } : t));
    addAuditLog('Suspension entreprise', 'Super Admin', `Accès suspendu pour non-paiement pour ${tenantId}`);
  };

  const activateTenant = (tenantId: string) => {
    setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, subscriptionStatus: 'active' } : t));
    addAuditLog('Réactivation entreprise', 'Super Admin', `Rétablissement des accès pour ${tenantId}`);
  };

  const deleteTenant = (tenantId: string) => {
    setTenants(prev => prev.filter(t => t.id !== tenantId));
    addAuditLog('Suppression entreprise', 'Super Admin', `Suppression définitive du tenant ${tenantId}`);
  };

  const addModuleToTenant = (tenantId: string, moduleId: ERPModuleId, months: number, price?: number) => {
    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        const expDate = new Date();
        expDate.setMonth(expDate.getMonth() + months);
        const expDateStr = expDate.toISOString().split('T')[0];

        const catalog = defaultModulesCatalog[moduleId];
        const chosenPrice = price !== undefined ? price : (t.modules?.[moduleId]?.monthlyPrice || catalog.monthlyPrice);

        const updatedModules = {
          ...t.modules,
          [moduleId]: {
            moduleId,
            name: catalog.name,
            description: catalog.description,
            isEnabled: true,
            expiresAt: expDateStr,
            monthlyPrice: chosenPrice,
          }
        };

        return {
          ...t,
          modules: updatedModules,
          subscriptionStatus: 'active',
        };
      }
      return t;
    }));
    addAuditLog('Ajout d\'un nouveau module', 'Abonnements', `Module ${moduleId} ajouté pour l'entreprise ${tenantId} (${months} mois)`);
  };

  const createTenantBySuperAdmin = (
    tenantData: Omit<Tenant, 'id' | 'modules'>,
    adminUser: { name: string; email: string; phone: string },
    selectedModuleIds: ERPModuleId[],
    durationMonths: number,
    customModulePrices?: Partial<Record<ERPModuleId, number>>
  ) => {
    const newTenantId = `tenant-${Date.now()}`;
    const expDate = new Date();
    expDate.setMonth(expDate.getMonth() + durationMonths);
    const expDateStr = expDate.toISOString().split('T')[0];

    const initialModules = {} as Record<ERPModuleId, ModuleSubscription>;
    (Object.keys(defaultModulesCatalog) as ERPModuleId[]).forEach(mId => {
      const isSelected = selectedModuleIds.includes(mId);
      const configuredPrice = customModulePrices && customModulePrices[mId] !== undefined
        ? Number(customModulePrices[mId])
        : defaultModulesCatalog[mId].monthlyPrice;

      initialModules[mId] = {
        moduleId: mId,
        name: defaultModulesCatalog[mId].name,
        description: defaultModulesCatalog[mId].description,
        isEnabled: isSelected,
        expiresAt: isSelected ? expDateStr : new Date().toISOString().split('T')[0],
        monthlyPrice: configuredPrice,
      };
    });

    const newTenant: Tenant = {
      ...tenantData,
      id: newTenantId,
      expiresAt: expDateStr,
      subscriptionStatus: 'active',
      modules: initialModules,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const newAdminUser: User = {
      id: `user-${Date.now()}`,
      tenantId: newTenantId,
      name: adminUser.name,
      email: adminUser.email,
      phone: adminUser.phone,
      role: 'owner',
      department: 'Direction Générale',
      isActive: true,
      lastLogin: new Date().toISOString(),
    };

    // ZERO INITIAL BALANCE - The client starts with an empty cash journal and inputs all amounts themselves
    const newAccount: FinancialAccount = {
      id: `acc-${Date.now()}`,
      tenantId: newTenantId,
      name: `Caisse Principale (${tenantData.city || 'Siège'})`,
      type: 'cash',
      balance: 0,
      initialBalance: 0,
      currency: tenantData.currency || 'XAF',
    };

    setTenants(prev => [...prev, newTenant]);
    setUsers(prev => [...prev, newAdminUser]);
    setAccounts(prev => [...prev, newAccount]);

    addAuditLog('Création entreprise par Super Admin', 'Super Admin', `Nouvelle entreprise : ${newTenant.name} (${newTenant.city}) avec ${selectedModuleIds.length} modules pour ${durationMonths} mois. Solde initial à 0.`);
  };

  const isModuleAccessible = (moduleId: ERPModuleId): boolean => {
    if (currentUser.role === 'superadmin' && !isImpersonating) return true;
    if (currentTenant.subscriptionStatus === 'suspended' || currentTenant.subscriptionStatus === 'expired') {
      return false;
    }
    const today = new Date().toISOString().split('T')[0];
    if (currentTenant.expiresAt < today) {
      return false;
    }
    const mod = currentTenant.modules?.[moduleId];
    if (!mod || !mod.isEnabled) return false;
    if (mod.expiresAt < today) return false;
    return true;
  };

  const isSubscriptionActive = (): boolean => {
    if (currentUser.role === 'superadmin' && !isImpersonating) return true;
    if (currentTenant.subscriptionStatus === 'suspended' || currentTenant.subscriptionStatus === 'expired') {
      return false;
    }
    const today = new Date().toISOString().split('T')[0];
    if (currentTenant.expiresAt < today) {
      return false;
    }
    return true;
  };

  const registerTenant = (
    tenantData: Omit<Tenant, 'id'>,
    adminUser: { name: string; email: string; phone: string; password?: string }
  ) => {
    const newTenantId = `tenant-${Date.now()}`;
    const newTenant: Tenant = {
      ...tenantData,
      id: newTenantId,
    };

    const newAdminUser: User = {
      id: `user-${Date.now()}`,
      tenantId: newTenantId,
      name: adminUser.name,
      email: adminUser.email,
      phone: adminUser.phone,
      role: 'owner',
      department: 'Direction Générale',
      isActive: true,
      lastLogin: new Date().toISOString(),
    };

    const newAccount: FinancialAccount = {
      id: `acc-${Date.now()}`,
      tenantId: newTenantId,
      name: `Caisse Principale (${tenantData.city || 'Siège'})`,
      type: 'cash',
      balance: 200000,
      initialBalance: 200000,
      currency: tenantData.currency || 'XAF',
    };

    setTenants(prev => [...prev, newTenant]);
    setUsers(prev => [...prev, newAdminUser]);
    setAccounts(prev => [...prev, newAccount]);
    setCurrentTenantId(newTenantId);
    setCurrentRole('owner');
    setIsAuthenticated(true);

    addAuditLog('Création nouvelle organisation SaaS', 'Multi-tenant', `Entreprise : ${newTenant.name} (${newTenant.city}) par ${adminUser.name}`);
  };

  const switchTenant = (tenantId: string) => {
    setCurrentTenantId(tenantId);
    addAuditLog('Changement d’entreprise active', 'Multi-tenant', `Bascule vers ${tenantId}`);
  };

  const updateTenantProfile = (updated: Partial<Tenant>) => {
    setTenants(prev => prev.map(t => t.id === currentTenant.id ? { ...t, ...updated } : t));
    addAuditLog('Mise à jour profil entreprise', 'Paramètres', `Modifications des coordonnées de ${currentTenant.name}`);
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    addAuditLog(`Changement de rôle vers ${role}`, 'Sécurité', 'Basculement de simulation de permissions');
  };

  const addAuditLog = (action: string, module: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      tenantId: currentTenant.id,
      timestamp: new Date().toISOString(),
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      module,
      details,
      ipAddress: '154.72.168.12 (CMR)',
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Finances
  const addTransaction = (data: Omit<Transaction, 'id' | 'tenantId'>) => {
    const newTx: Transaction = {
      ...data,
      id: `tx-${Date.now()}`,
      tenantId: currentTenant.id,
    };

    // Update account balance
    setAccounts(prev => prev.map(acc => {
      if (acc.id === data.accountId) {
        const delta = data.type === 'income' ? data.paidAmount : -data.paidAmount;
        return { ...acc, balance: acc.balance + delta };
      }
      return acc;
    }));

    // Update budget if expense
    if (data.type === 'expense') {
      setBudgets(prev => prev.map(b => {
        if (b.category.toLowerCase() === data.category.toLowerCase()) {
          const newSpent = b.currentSpent + data.paidAmount;
          if (newSpent >= b.monthlyLimit * 0.8) {
            // trigger alert
            setNotifications(n => [{
              id: `notif-${Date.now()}`,
              tenantId: currentTenant.id,
              title: `Alerte Budget : ${b.category}`,
              message: `Le seuil d'alerte budget a été dépassé (${Math.round((newSpent / b.monthlyLimit) * 100)}%).`,
              type: newSpent >= b.monthlyLimit ? 'danger' : 'warning',
              date: new Date().toISOString(),
              isRead: false,
              linkModule: 'finances'
            }, ...n]);
          }
          return { ...b, currentSpent: newSpent };
        }
        return b;
      }));
    }

    setTransactions(prev => [newTx, ...prev]);
    addAuditLog(
      `Création opération de caisse (${data.type === 'income' ? 'Entrée' : 'Sortie'})`,
      'Journal Financier',
      `${data.description} - ${data.paidAmount} ${currency}`
    );
  };

  const archiveTransaction = (id: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, isArchived: true } : t));
    addAuditLog('Archivage opération financière', 'Journal Financier', `Opération #${id} archivée`);
  };

  const addDailyClosing = (data: Omit<DailyClosing, 'id' | 'tenantId'>) => {
    const newClosing: DailyClosing = {
      ...data,
      id: `close-${Date.now()}`,
      tenantId: currentTenant.id,
    };
    setDailyClosings(prev => [newClosing, ...prev]);
    addAuditLog('Clôture journalière de caisse', 'Finances', `Clôture validée pour la date ${data.date}. Écart: ${data.difference} ${currency}`);
  };

  const addAccount = (data: Omit<FinancialAccount, 'id' | 'tenantId'>) => {
    const newAcc: FinancialAccount = {
      ...data,
      id: `acc-${Date.now()}`,
      tenantId: currentTenant.id,
    };
    setAccounts(prev => [...prev, newAcc]);
    addAuditLog('Ajout compte / caisse', 'Finances', `Nouveau compte: ${data.name}`);
  };

  // Invoicing
  const addInvoice = (data: Omit<Invoice, 'id' | 'tenantId' | 'createdAt'>) => {
    const newInv: Invoice = {
      ...data,
      id: `inv-${Date.now()}`,
      tenantId: currentTenant.id,
      createdAt: new Date().toISOString(),
    };
    setInvoices(prev => [newInv, ...prev]);
    addAuditLog(`Création pièce comptable (${data.type})`, 'Facturation', `${data.number} pour ${data.customerName} - ${data.totalAmount} ${currency}`);

    // If invoice is fully paid on creation or has deposit, register in cash journal
    if (data.amountPaid > 0 && data.type === 'invoice') {
      const defaultAccount = accounts[0]?.id || 'acc-1';
      addTransaction({
        accountId: defaultAccount,
        date: new Date().toISOString(),
        type: 'income',
        category: 'Ventes & Prestations',
        description: `Règlement Facture ${data.number} (${data.customerName})`,
        totalAmount: data.totalAmount,
        paidAmount: data.amountPaid,
        remainingAmount: data.amountDue,
        paymentMethod: 'momo_mtn',
        status: data.amountDue === 0 ? 'paid' : 'advance',
        partyName: data.customerName,
        partyType: 'client',
        reference: data.number,
        createdBy: currentUser.name,
      });
    }
  };

  const updateInvoiceStatus = (id: string, status: Invoice['status'], amountPaid?: number) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        const newPaid = amountPaid !== undefined ? amountPaid : inv.amountPaid;
        const newDue = Math.max(0, inv.totalAmount - newPaid);
        return {
          ...inv,
          status,
          amountPaid: newPaid,
          amountDue: newDue,
        };
      }
      return inv;
    }));
    addAuditLog('Mise à jour statut facture', 'Facturation', `Facture #${id} passée au statut ${status}`);
  };

  const convertInvoice = (id: string, targetType: InvoiceType) => {
    const source = invoices.find(i => i.id === id);
    if (!source) return;

    const prefix = targetType === 'invoice' ? 'FAC' : targetType === 'receipt' ? 'REC' : 'DEV';
    const newNumber = `${prefix}-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newInv: Invoice = {
      ...source,
      id: `inv-${Date.now()}`,
      number: newNumber,
      type: targetType,
      status: targetType === 'receipt' ? 'paid' : 'sent',
      createdAt: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      amountPaid: targetType === 'receipt' ? source.totalAmount : source.amountPaid,
      amountDue: targetType === 'receipt' ? 0 : source.amountDue,
    };

    setInvoices(prev => [newInv, ...prev]);
    addAuditLog(`Conversion de document`, 'Facturation', `Conversion ${source.number} (${source.type}) vers ${newNumber} (${targetType})`);
  };

  const archiveInvoice = (id: string) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, isArchived: true } : i));
    addAuditLog('Archivage facture', 'Facturation', `Facture #${id} archivée`);
  };

  // HR & Payroll
  const addEmployee = (data: Omit<Employee, 'id' | 'tenantId'>) => {
    const newEmp: Employee = {
      ...data,
      id: `emp-${Date.now()}`,
      tenantId: currentTenant.id,
    };
    setEmployees(prev => [newEmp, ...prev]);
    addAuditLog('Enregistrement employé', 'Ressources Humaines', `${data.firstName} ${data.lastName} - Poste: ${data.position}`);
  };

  const updateEmployee = (id: string, data: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
    addAuditLog('Mise à jour dossier employé', 'Ressources Humaines', `Modification employé #${id}`);
  };

  const archiveEmployee = (id: string) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, isArchived: true } : e));
    addAuditLog('Archivage dossier employé', 'Ressources Humaines', `Employé #${id} archivé`);
  };

  const addLeaveRequest = (data: Omit<LeaveRequest, 'id' | 'tenantId' | 'createdAt'>) => {
    const newLeave: LeaveRequest = {
      ...data,
      id: `leave-${Date.now()}`,
      tenantId: currentTenant.id,
      createdAt: new Date().toISOString(),
    };
    setLeaves(prev => [newLeave, ...prev]);
    addAuditLog('Demande de congés déposée', 'Ressources Humaines', `${data.employeeName} (${data.daysCount} jours)`);
  };

  const updateLeaveStatus = (id: string, status: 'approved' | 'rejected') => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status, approvedBy: currentUser.name } : l));
    addAuditLog('Validation demande congés', 'Ressources Humaines', `Demande #${id} ${status}`);
  };

  const addPayrollRecord = (data: Omit<PayrollRecord, 'id' | 'tenantId'>) => {
    const newPayroll: PayrollRecord = {
      ...data,
      id: `pay-${Date.now()}`,
      tenantId: currentTenant.id,
    };
    setPayrolls(prev => [newPayroll, ...prev]);
    addAuditLog('Génération bulletin de paie', 'Paie & Salaires', `Bulletin ${data.employeeName} (${data.month}) - Net: ${data.netSalary} ${currency}`);
  };

  const markPayrollPaid = (id: string, accountId: string) => {
    const payroll = payrolls.find(p => p.id === id);
    if (!payroll) return;

    setPayrolls(prev => prev.map(p => p.id === id ? {
      ...p,
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0]
    } : p));

    // Automatically create expense in cash journal
    addTransaction({
      accountId,
      date: new Date().toISOString(),
      type: 'expense',
      category: 'Salaires & Rémunérations',
      description: `Paiement Salaire Net ${payroll.month} - ${payroll.employeeName} (${payroll.matricule})`,
      totalAmount: payroll.netSalary,
      paidAmount: payroll.netSalary,
      remainingAmount: 0,
      paymentMethod: payroll.paymentMethod,
      status: 'paid',
      partyName: payroll.employeeName,
      partyType: 'employee',
      reference: `SAL-${payroll.month}-${payroll.matricule}`,
      createdBy: currentUser.name,
    });

    addAuditLog('Paiement de salaire effectué', 'Paie & Salaires', `Salaire versé à ${payroll.employeeName} (${payroll.netSalary} ${currency})`);
  };

  // Assets
  const addAsset = (data: Omit<Asset, 'id' | 'tenantId'>) => {
    const newAsset: Asset = {
      ...data,
      id: `asset-${Date.now()}`,
      tenantId: currentTenant.id,
    };
    setAssets(prev => [newAsset, ...prev]);
    addAuditLog('Ajout matériel / équipement', 'Parc Matériel', `${data.name} (${data.code})`);
  };

  const assignAsset = (assetId: string, employeeId: string, notes?: string) => {
    const employee = employees.find(e => e.id === employeeId);
    const asset = assets.find(a => a.id === assetId);
    if (!employee || !asset) return;

    const assignment: AssetAssignment = {
      id: `assign-${Date.now()}`,
      tenantId: currentTenant.id,
      assetId,
      assetName: asset.name,
      employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      assignedDate: new Date().toISOString().split('T')[0],
      conditionAtHandover: 'Bon état de fonctionnement',
      signedDigitally: true,
      notes: notes || 'Fiche de décharge signée électroniquement',
    };

    setAssetAssignments(prev => [assignment, ...prev]);
    setAssets(prev => prev.map(a => a.id === assetId ? {
      ...a,
      status: 'assigned',
      assignedToEmployeeId: employeeId,
      assignedToEmployeeName: `${employee.firstName} ${employee.lastName}`,
      assignedDate: new Date().toISOString().split('T')[0]
    } : a));

    addAuditLog('Affectation de matériel avec décharge', 'Parc Matériel', `${asset.name} remis à ${employee.firstName} ${employee.lastName}`);
  };

  const returnAsset = (assetId: string, condition: 'good' | 'fair' | 'damaged') => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    setAssets(prev => prev.map(a => a.id === assetId ? {
      ...a,
      status: 'available',
      assignedToEmployeeId: undefined,
      assignedToEmployeeName: undefined,
      assignedDate: undefined,
      condition,
    } : a));

    addAuditLog('Restitution de matériel', 'Parc Matériel', `Retour de ${asset.name} (État: ${condition})`);
  };

  const archiveAsset = (id: string) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, isArchived: true } : a));
    addAuditLog('Archivage équipement', 'Parc Matériel', `Matériel #${id} archivé`);
  };

  // CRM
  const addCustomer = (data: Omit<Customer, 'id' | 'tenantId'>) => {
    const newCust: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      tenantId: currentTenant.id,
    };
    setCustomers(prev => [newCust, ...prev]);
    addAuditLog('Création client / prospect', 'CRM', `${data.name} (${data.city}, ${data.country})`);
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    addAuditLog('Mise à jour fiche client', 'CRM', `Modification contact #${id}`);
  };

  const archiveCustomer = (id: string) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, isArchived: true } : c));
    addAuditLog('Archivage client', 'CRM', `Contact #${id} archivé`);
  };

  const addDeal = (data: Omit<CrmDeal, 'id' | 'tenantId'>) => {
    const newDeal: CrmDeal = {
      ...data,
      id: `deal-${Date.now()}`,
      tenantId: currentTenant.id,
    };
    setCrmDeals(prev => [newDeal, ...prev]);
    addAuditLog('Création opportunité commerciale', 'CRM Pipeline', `${data.title} (${data.value} ${currency})`);
  };

  const updateDealStage = (id: string, stage: CrmDeal['stage'], lostReason?: string) => {
    setCrmDeals(prev => prev.map(d => d.id === id ? { ...d, stage, lostReason } : d));
    addAuditLog('Évolution pipeline de vente', 'CRM Pipeline', `Opportunité #${id} passée à l'étape "${stage}"`);
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Backup & Restore
  const exportFullBackup = (): string => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      app: "Mbǎ'Ntām ERP",
      version: "1.0.0",
      tenants,
      accounts,
      transactions,
      dailyClosings,
      budgets,
      invoices,
      employees,
      leaves,
      payrolls,
      assets,
      assetAssignments,
      customers,
      crmDeals,
      auditLogs,
    };
    addAuditLog('Export sauvegarde complète', 'Sécurité & Système', 'Génération d’une sauvegarde JSON intégrale');
    return JSON.stringify(backupData, null, 2);
  };

  const importFullBackup = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (!data.tenants || !data.transactions) {
        throw new Error('Format de fichier de sauvegarde invalide');
      }
      if (data.tenants) setTenants(data.tenants);
      if (data.accounts) setAccounts(data.accounts);
      if (data.transactions) setTransactions(data.transactions);
      if (data.dailyClosings) setDailyClosings(data.dailyClosings);
      if (data.budgets) setBudgets(data.budgets);
      if (data.invoices) setInvoices(data.invoices);
      if (data.employees) setEmployees(data.employees);
      if (data.leaves) setLeaves(data.leaves);
      if (data.payrolls) setPayrolls(data.payrolls);
      if (data.assets) setAssets(data.assets);
      if (data.assetAssignments) setAssetAssignments(data.assetAssignments);
      if (data.customers) setCustomers(data.customers);
      if (data.crmDeals) setCrmDeals(data.crmDeals);
      if (data.auditLogs) setAuditLogs(data.auditLogs);

      addAuditLog('Restauration sauvegarde complète', 'Sécurité & Système', 'Import réussi des données');
      return true;
    } catch {
      return false;
    }
  };

  const clearAllTenantData = (tenantId: string) => {
    // Reset account balances to 0
    setAccounts(prev => prev.map(a => a.tenantId === tenantId ? { ...a, balance: 0, initialBalance: 0 } : a));
    // Remove all transactions
    setTransactions(prev => prev.filter(t => t.tenantId !== tenantId));
    // Remove all daily closings
    setDailyClosings(prev => prev.filter(c => c.tenantId !== tenantId));
    // Remove all invoices
    setInvoices(prev => prev.filter(i => i.tenantId !== tenantId));
    // Remove all payroll records
    setPayrolls(prev => prev.filter(p => p.tenantId !== tenantId));
    // Remove all leave requests
    setLeaves(prev => prev.filter(l => l.tenantId !== tenantId));
    // Remove all employees except leave empty
    setEmployees(prev => prev.filter(e => e.tenantId !== tenantId));
    // Remove all assets
    setAssets(prev => prev.filter(a => a.tenantId !== tenantId));
    setAssetAssignments(prev => prev.filter(a => a.tenantId !== tenantId));
    // Remove all customers
    setCustomers(prev => prev.filter(c => c.tenantId !== tenantId));
    setCrmDeals(prev => prev.filter(d => d.tenantId !== tenantId));
    // Reset budgets
    setBudgets(prev => prev.map(b => b.tenantId === tenantId ? { ...b, currentSpent: 0 } : b));

    addAuditLog('Remise à zéro intégrale des données', 'Administration', `Toutes les données de l'entreprise ${tenantId} ont été remises à 0 pour une utilisation vierge.`);
  };

  const resetToDemoData = () => {
    setTenants(initialTenants);
    setUsers(initialUsers);
    setAccounts(initialAccounts);
    setTransactions(initialTransactions);
    setDailyClosings(initialDailyClosings);
    setBudgets(initialBudgetCategories);
    setInvoices(initialInvoices);
    setEmployees(initialEmployees);
    setLeaves(initialLeaves);
    setPayrolls(initialPayrolls);
    setAssets(initialAssets);
    setAssetAssignments(initialAssetAssignments);
    setCustomers(initialCustomers);
    setCrmDeals(initialCrmDeals);
    setAuditLogs(initialAuditLogs);
    setNotifications(initialNotifications);
    addAuditLog('Réinitialisation données de démo', 'Système', 'Rétablissement complet du jeu de démonstration camerounais');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        isSuperAdmin: isSuperAdminSession,
        isImpersonating,
        login,
        loginSuperAdmin,
        superAdminImpersonate,
        superAdminReturnToConsole,
        logout,
        registerTenant,
        createTenantBySuperAdmin,
        updateTenantModules,
        renewTenantSubscription,
        suspendTenant,
        activateTenant,
        deleteTenant,
        addModuleToTenant,
        isModuleAccessible,
        isSubscriptionActive,
        activeModule,
        setActiveModule,
        currency,
        setCurrency,
        language,
        setLanguage,
        darkMode,
        toggleDarkMode,
        currentTenant,
        tenants,
        switchTenant,
        updateTenantProfile,
        currentUser,
        switchRole,
        users,
        accounts,
        transactions: transactions.filter(t => !t.isArchived && t.tenantId === currentTenant.id),
        dailyClosings: dailyClosings.filter(c => c.tenantId === currentTenant.id),
        budgets: budgets.filter(b => b.tenantId === currentTenant.id),
        addTransaction,
        archiveTransaction,
        addDailyClosing,
        addAccount,
        invoices: invoices.filter(i => !i.isArchived && i.tenantId === currentTenant.id),
        addInvoice,
        updateInvoiceStatus,
        convertInvoice,
        archiveInvoice,
        employees: employees.filter(e => !e.isArchived && e.tenantId === currentTenant.id),
        leaves: leaves.filter(l => l.tenantId === currentTenant.id),
        payrolls: payrolls.filter(p => p.tenantId === currentTenant.id),
        addEmployee,
        updateEmployee,
        archiveEmployee,
        addLeaveRequest,
        updateLeaveStatus,
        addPayrollRecord,
        markPayrollPaid,
        assets: assets.filter(a => !a.isArchived && a.tenantId === currentTenant.id),
        assetAssignments: assetAssignments.filter(a => a.tenantId === currentTenant.id),
        addAsset,
        assignAsset,
        returnAsset,
        archiveAsset,
        customers: customers.filter(c => !c.isArchived && c.tenantId === currentTenant.id),
        crmDeals: crmDeals.filter(d => d.tenantId === currentTenant.id),
        addCustomer,
        updateCustomer,
        archiveCustomer,
        addDeal,
        updateDealStage,
        auditLogs: auditLogs.filter(l => l.tenantId === currentTenant.id),
        notifications: notifications.filter(n => n.tenantId === currentTenant.id),
        markNotificationRead,
        clearNotifications,
        addAuditLog,
        exportFullBackup,
        importFullBackup,
        clearAllTenantData,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
