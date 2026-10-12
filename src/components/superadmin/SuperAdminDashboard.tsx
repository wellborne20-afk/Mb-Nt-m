import React, { useState } from 'react';
import {
  ShieldAlert,
  Building2,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Layers,
  Calendar,
  LogOut,
  ExternalLink,
  PauseCircle,
  PlayCircle,
  Trash2,
  DollarSign,
  TrendingUp,
  Settings,
  Users,
  CreditCard,
  Zap,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ERPModuleId, Tenant, ModuleSubscription } from '../../types';
import { defaultModulesCatalog } from '../../data/mockData';

export const SuperAdminDashboard: React.FC = () => {
  const {
    tenants,
    superAdminImpersonate,
    logout,
    updateTenantModules,
    renewTenantSubscription,
    suspendTenant,
    activateTenant,
    deleteTenant,
    createTenantBySuperAdmin,
    currency,
    language
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'expired'>('all');

  // Modal: Create New Tenant
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLegalForm, setNewLegalForm] = useState('SARL');
  const [newCity, setNewCity] = useState('Douala');
  const [newTaxId, setNewTaxId] = useState('');
  const [newTradeRegister, setNewTradeRegister] = useState('');
  const [newPhone, setNewPhone] = useState('+237 6');
  const [newEmail, setNewEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('+237 6');
  const [newDurationMonths, setNewDurationMonths] = useState(1);
  const [selectedModules, setSelectedModules] = useState<ERPModuleId[]>([
    'finances',
    'invoices',
  ]);

  // Modal: Manage Tenant Modules & Duration
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [editModulesState, setEditModulesState] = useState<Record<ERPModuleId, ModuleSubscription> | null>(null);
  const [monthsToAdd, setMonthsToAdd] = useState(1);

  const allModuleKeys = Object.keys(defaultModulesCatalog) as ERPModuleId[];

  // Filter tenants
  const filteredTenants = tenants.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.taxId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.subscriptionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate platform metrics
  const activeTenantsCount = tenants.filter(t => t.subscriptionStatus === 'active').length;
  const expiredTenantsCount = tenants.filter(t => t.subscriptionStatus === 'expired').length;
  const suspendedTenantsCount = tenants.filter(t => t.subscriptionStatus === 'suspended').length;

  // Monthly Recurring Revenue (MRR) based on enabled modules across all active tenants
  const totalPlatformMRR = tenants
    .filter(t => t.subscriptionStatus === 'active')
    .reduce((sum, t) => {
      let tenantMonthly = 0;
      if (t.modules) {
        Object.values(t.modules).forEach(m => {
          if (m.isEnabled) tenantMonthly += m.monthlyPrice;
        });
      }
      return sum + tenantMonthly;
    }, 0);

  const handleOpenEditModules = (tenant: Tenant) => {
    setEditingTenant(tenant);
    // clone modules state
    const clone: Record<ERPModuleId, ModuleSubscription> = {} as any;
    allModuleKeys.forEach(mId => {
      if (tenant.modules && tenant.modules[mId]) {
        clone[mId] = { ...tenant.modules[mId] };
      } else {
        clone[mId] = {
          moduleId: mId,
          name: defaultModulesCatalog[mId].name,
          description: defaultModulesCatalog[mId].description,
          isEnabled: false,
          expiresAt: tenant.expiresAt,
          monthlyPrice: defaultModulesCatalog[mId].monthlyPrice,
        };
      }
    });
    setEditModulesState(clone);
  };

  const handleSaveModules = () => {
    if (!editingTenant || !editModulesState) return;
    updateTenantModules(editingTenant.id, editModulesState);
    setEditingTenant(null);
  };

  const handleApplyRenewal = () => {
    if (!editingTenant) return;
    renewTenantSubscription(editingTenant.id, monthsToAdd);
    setEditingTenant(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAdminName || !newAdminEmail) return;

    createTenantBySuperAdmin(
      {
        name: newName,
        legalForm: newLegalForm,
        taxId: newTaxId || `M${Math.floor(100000000000 + Math.random() * 900000000000)}B`,
        tradeRegister: newTradeRegister || `RC/${newCity.slice(0, 3).toUpperCase()}/2026/B/${Math.floor(100 + Math.random() * 900)}`,
        address: `${newCity} Centre`,
        city: newCity,
        country: 'Cameroun',
        phone: newPhone,
        email: newEmail || newAdminEmail,
        currency: 'XAF',
        vatRate: 19.25,
        stampDuty: 1000,
        subscriptionPlan: selectedModules.length > 5 ? 'enterprise' : 'starter',
        subscriptionStatus: 'active',
        expiresAt: '', // set in createTenantBySuperAdmin
      },
      {
        name: newAdminName,
        email: newAdminEmail,
        phone: newAdminPhone,
      },
      selectedModules,
      newDurationMonths
    );

    setIsCreateModalOpen(false);
    // Reset form
    setNewName('');
    setNewAdminName('');
    setNewAdminEmail('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Super Admin Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-purple-600 to-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-purple-500/20">
            👑
          </div>
          <div>
            <div className="text-base font-black text-white flex items-center gap-2">
              Console Super Administrateur Mbǎ'Ntām
              <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                Master SaaS Control
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Gestion centralisée des entreprises clientes, licences modulaires et coupures automatiques
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Entreprise Cliente</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="Quitter la console"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Entreprises Totales</span>
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">{tenants.length}</div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">{activeTenantsCount} actives</span>
              <span>•</span>
              <span className="text-rose-400 font-bold">{expiredTenantsCount} coupées</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Revenu Récurrent MRR</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {formatCurrency(totalPlatformMRR, currency)}
            </div>
            <div className="text-xs text-slate-400">Facturation mensuelle cumulée</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Abonnements Coupés / Expirés</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400">
              {expiredTenantsCount + suspendedTenantsCount}
            </div>
            <div className="text-xs text-slate-400">Accès restreint pour non-paiement</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Modules au Catalogue</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-400">{allModuleKeys.length}</div>
            <div className="text-xs text-slate-400">Personnalisables par client</div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher entreprise, ville, NIU..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 font-semibold focus:outline-none"
            >
              <option value="all">Tous les états</option>
              <option value="active">Actives uniquement</option>
              <option value="expired">Expirées / Coupées</option>
              <option value="suspended">Suspendues manuellement</option>
            </select>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 border-b border-slate-700/80 text-slate-400 uppercase font-bold">
                <tr>
                  <th className="px-4 py-3.5">Entreprise Cliente</th>
                  <th className="px-4 py-3.5">Ville & Identifiants</th>
                  <th className="px-4 py-3.5">Modules Souscrits</th>
                  <th className="px-4 py-3.5">Échéance & Durée</th>
                  <th className="px-4 py-3.5 text-center">Statut d'Accès</th>
                  <th className="px-4 py-3.5 text-center">Actions Super Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTenants.map(tenant => {
                  const today = new Date().toISOString().split('T')[0];
                  const isExpired = tenant.expiresAt < today || tenant.subscriptionStatus === 'expired';
                  const isSuspended = tenant.subscriptionStatus === 'suspended';

                  // Count active modules
                  const activeModulesCount = tenant.modules
                    ? Object.values(tenant.modules).filter(m => m.isEnabled && m.expiresAt >= today).length
                    : 0;

                  return (
                    <tr key={tenant.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-sm text-white">{tenant.name}</div>
                        <div className="text-[11px] text-slate-400">{tenant.legalForm} • {tenant.email}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-300">{tenant.city}, {tenant.country}</div>
                        <div className="text-[10px] font-mono text-slate-500">NIU : {tenant.taxId}</div>
                      </td>

                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {tenant.modules &&
                            Object.values(tenant.modules).map(mod => (
                              <span
                                key={mod.moduleId}
                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                  mod.isEnabled && mod.expiresAt >= today
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700 line-through'
                                }`}
                                title={`${mod.name} (${mod.isEnabled ? `Expire le ${mod.expiresAt}` : 'Désactivé'})`}
                              >
                                {mod.moduleId === 'finances' ? 'Caisse' :
                                 mod.moduleId === 'invoices' ? 'Facturation' :
                                 mod.moduleId === 'hr' ? 'RH' :
                                 mod.moduleId === 'payroll' ? 'Paie CMR' :
                                 mod.moduleId === 'assets' ? 'Matériel' :
                                 mod.moduleId === 'crm' ? 'CRM' : 'Bilans'}
                              </span>
                            ))}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 font-semibold">
                          {activeModulesCount} / {allModuleKeys.length} modules en service
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-white">
                          {formatDate(tenant.expiresAt, language)}
                        </div>
                        <div className="text-[10px]">
                          {isExpired ? (
                            <span className="text-rose-400 font-bold">⛔ Coupé (Échu)</span>
                          ) : isSuspended ? (
                            <span className="text-amber-400 font-bold">⚠️ Accès Suspendu</span>
                          ) : (
                            <span className="text-emerald-400 font-bold">✓ Actif</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <Badge
                          variant={
                            isExpired ? 'danger' : isSuspended ? 'warning' : 'success'
                          }
                        >
                          {isExpired ? 'Expiré (Coupé)' : isSuspended ? 'Suspendu' : 'En Règle'}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Impersonate */}
                          <button
                            onClick={() => superAdminImpersonate(tenant.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] cursor-pointer"
                            title="Se connecter dans l'interface de cette entreprise"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Accéder</span>
                          </button>

                          {/* Manage Modules & Validity */}
                          <button
                            onClick={() => handleOpenEditModules(tenant)}
                            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                            title="Ajuster modules & durée d'abonnement"
                          >
                            <Settings className="w-4 h-4 text-emerald-400" />
                          </button>

                          {/* Toggle Suspend */}
                          {tenant.subscriptionStatus === 'active' ? (
                            <button
                              onClick={() => suspendTenant(tenant.id)}
                              className="p-1.5 rounded-lg border border-rose-900 bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 cursor-pointer"
                              title="Couper l'accès temporairement (non-paiement)"
                            >
                              <PauseCircle className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => activateTenant(tenant.id)}
                              className="p-1.5 rounded-lg border border-emerald-900 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60 cursor-pointer"
                              title="Réactiver l'accès client"
                            >
                              <PlayCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'entreprise "${tenant.name}" ?`)) {
                                deleteTenant(tenant.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Supprimer l'entreprise"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal: CREATE TENANT BY SUPER ADMIN */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Créer une Nouvelle Entreprise Cliente (Super Admin)"
        maxWidth="3xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Raison Sociale *</label>
              <input
                type="text"
                placeholder="Ex: ETS Douala BTP, Société Forestière..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Forme Juridique</label>
              <select
                value={newLegalForm}
                onChange={e => setNewLegalForm(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="SARL">SARL</option>
                <option value="SA">SA</option>
                <option value="SAS">SAS</option>
                <option value="ETS">ETS (Entreprise Individuelle)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Ville du Siège</label>
              <select
                value={newCity}
                onChange={e => setNewCity(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="Douala">Douala</option>
                <option value="Yaoundé">Yaoundé</option>
                <option value="Bafoussam">Bafoussam</option>
                <option value="Garoua">Garoua</option>
                <option value="Kribi">Kribi</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Numéro NIU</label>
              <input
                type="text"
                placeholder="Ex: M0219..."
                value={newTaxId}
                onChange={e => setNewTaxId(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Téléphone Entreprise</label>
              <input
                type="text"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Admin User */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-emerald-400">
              Administrateur Client (Accès Initial)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Nom complet"
                value={newAdminName}
                onChange={e => setNewAdminName(e.target.value)}
                className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                required
              />
              <input
                type="email"
                placeholder="Email de connexion"
                value={newAdminEmail}
                onChange={e => setNewAdminEmail(e.target.value)}
                className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                required
              />
              <input
                type="text"
                placeholder="Téléphone direct"
                value={newAdminPhone}
                onChange={e => setNewAdminPhone(e.target.value)}
                className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
          </div>

          {/* Modules Selection with Prices */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-300">
                Modules Souscrits par l'Entreprise (À la carte) *
              </label>
              <span className="text-[11px] text-emerald-400 font-bold">
                {selectedModules.length} module(s) sélectionné(s)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
              {allModuleKeys.map(mId => {
                const info = defaultModulesCatalog[mId];
                const isChecked = selectedModules.includes(mId);

                return (
                  <label
                    key={mId}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-emerald-950/40 border-emerald-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedModules([...selectedModules, mId]);
                          } else {
                            setSelectedModules(selectedModules.filter(id => id !== mId));
                          }
                        }}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="text-xs font-bold">{info.name}</div>
                        <div className="text-[10px] text-slate-400">{formatCurrency(info.monthlyPrice, currency)} / mois</div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Duration selection */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">Durée d'Engagement Initiale</div>
              <div className="text-[11px] text-slate-400">Si non renouvelé à terme, le service se coupe automatiquement.</div>
            </div>

            <select
              value={newDurationMonths}
              onChange={e => setNewDurationMonths(parseInt(e.target.value) || 1)}
              className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-emerald-400"
            >
              <option value={1}>1 Mois</option>
              <option value={2}>2 Mois</option>
              <option value={3}>3 Mois (Trimestre)</option>
              <option value={6}>6 Mois (Semestre)</option>
              <option value={12}>12 Mois (Annuel)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 border border-slate-700 rounded-xl text-xs font-bold text-slate-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              Créer l'Entreprise & Activer les Licences
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: MANAGE TENANT MODULES & RENEWAL */}
      {editingTenant && editModulesState && (
        <Modal
          isOpen={!!editingTenant}
          onClose={() => setEditingTenant(null)}
          title={`Gestion des Modules & Validité : ${editingTenant.name}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-slate-100">
            {/* Expiration and Status Overview */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Échéance globale actuelle :</span>
                <div className="text-sm font-mono font-bold text-white mt-0.5">
                  {formatDate(editingTenant.expiresAt, language)}
                </div>
              </div>
              <Badge variant={editingTenant.subscriptionStatus === 'active' ? 'success' : 'danger'}>
                {editingTenant.subscriptionStatus === 'active' ? 'Compte Actif' : 'Accès Coupé'}
              </Badge>
            </div>

            {/* Modules Checkbox and Individual Expirations */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Activer / Désactiver les modules pour ce client
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto p-1">
                {allModuleKeys.map(mId => {
                  const mod = editModulesState[mId];
                  const catalogInfo = defaultModulesCatalog[mId];

                  return (
                    <div
                      key={mId}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                        mod.isEnabled
                          ? 'bg-slate-900 border-emerald-500/50'
                          : 'bg-slate-950 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={mod.isEnabled}
                          onChange={e => {
                            setEditModulesState({
                              ...editModulesState,
                              [mId]: {
                                ...mod,
                                isEnabled: e.target.checked,
                              },
                            });
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-white">{catalogInfo.name}</div>
                          <div className="text-[10px] text-slate-400">
                            Tarif : {formatCurrency(catalogInfo.monthlyPrice, currency)} / mois
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">Expire le :</span>
                        <input
                          type="date"
                          value={mod.expiresAt}
                          onChange={e => {
                            setEditModulesState({
                              ...editModulesState,
                              [mId]: {
                                ...mod,
                                expiresAt: e.target.value,
                              },
                            });
                          }}
                          className="p-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-white"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Renewal Box */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Prolonger / Renouveler l'Abonnement</div>
                <div className="text-[11px] text-slate-400">Ajoute du temps à tous les modules activés</div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={monthsToAdd}
                  onChange={e => setMonthsToAdd(parseInt(e.target.value) || 1)}
                  className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white"
                >
                  <option value={1}>+1 Mois</option>
                  <option value={2}>+2 Mois</option>
                  <option value={3}>+3 Mois</option>
                  <option value={6}>+6 Mois</option>
                  <option value={12}>+12 Mois (1 An)</option>
                </select>
                <button
                  type="button"
                  onClick={handleApplyRenewal}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Appliquer Renouvellement
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingTenant(null)}
                className="px-4 py-2 border border-slate-700 rounded-xl text-xs font-bold text-slate-300"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={handleSaveModules}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
              >
                Enregistrer les Modifications
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
