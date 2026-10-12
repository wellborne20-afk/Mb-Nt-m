import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  ReceiptText,
  Users,
  Coins,
  Package,
  Handshake,
  BarChart3,
  ShieldCheck,
  Settings,
  Wifi,
  Sparkles,
  Building,
  CheckCircle,
  HelpCircle,
  Crown,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ERPModuleId } from '../../types';
import { formatDate } from '../../utils/formatters';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    activeModule,
    setActiveModule,
    language,
    currentTenant,
    currentUser,
    isModuleAccessible,
    isSuperAdmin,
    isImpersonating,
    superAdminReturnToConsole
  } = useApp();

  const navigationItems = [
    {
      id: 'dashboard',
      label: language === 'fr' ? 'Tableau de bord' : 'Dashboard',
      icon: LayoutDashboard,
      roles: ['owner', 'director', 'accountant', 'hr', 'sales', 'employee'],
    },
    {
      id: 'finances',
      label: language === 'fr' ? 'Journal Financier' : 'Cash Journal',
      icon: Wallet,
      badge: 'MoMo',
      roles: ['owner', 'director', 'accountant'],
    },
    {
      id: 'invoices',
      label: language === 'fr' ? 'Factures & Devis' : 'Invoices & Quotes',
      icon: ReceiptText,
      roles: ['owner', 'director', 'accountant', 'sales'],
    },
    {
      id: 'hr',
      label: language === 'fr' ? 'Ressources Humaines' : 'Human Resources',
      icon: Users,
      roles: ['owner', 'director', 'hr'],
    },
    {
      id: 'payroll',
      label: language === 'fr' ? 'Paie Camerounaise' : 'Payroll (CNPS/IRPP)',
      icon: Coins,
      roles: ['owner', 'director', 'accountant', 'hr'],
    },
    {
      id: 'assets',
      label: language === 'fr' ? 'Parc & Matériel' : 'Assets & Equipment',
      icon: Package,
      roles: ['owner', 'director', 'accountant', 'hr'],
    },
    {
      id: 'crm',
      label: language === 'fr' ? 'CRM & Pipeline' : 'CRM & Deals',
      icon: Handshake,
      roles: ['owner', 'director', 'sales'],
    },
    {
      id: 'reports',
      label: language === 'fr' ? 'Bilans & Analyses' : 'Financial Reports',
      icon: BarChart3,
      roles: ['owner', 'director', 'accountant'],
    },
    {
      id: 'audit',
      label: language === 'fr' ? 'Journal d’Audit' : 'Audit Logs',
      icon: ShieldCheck,
      roles: ['owner', 'director'],
    },
    {
      id: 'settings',
      label: language === 'fr' ? 'Paramètres & Fiscalité' : 'Settings & Tax',
      icon: Settings,
      roles: ['owner', 'director'],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-slate-800 gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black text-white text-xl">
            M
          </div>
          <div>
            <div className="font-extrabold text-base tracking-tight flex items-center gap-1.5 text-white">
              Mbǎ'Ntām
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-1.5 py-0.2 rounded-full">
                SaaS
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]">
              {currentTenant.name}
            </div>
          </div>
        </div>

        {/* Super Admin Impersonation Banner */}
        {(isImpersonating || isSuperAdmin) && (
          <div className="p-2.5 bg-gradient-to-r from-purple-950 to-indigo-950 border-b border-purple-800/80">
            <button
              onClick={superAdminReturnToConsole}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-md transition-colors"
              title="Retourner à la Console Master"
            >
              <span className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                Console Super Admin
              </span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Navigation Modules */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {language === 'fr' ? 'Modules Métiers' : 'Business Modules'}
          </div>

          {navigationItems.map(item => {
            const hasRolePermission = item.roles.includes(currentUser.role) || currentUser.role === 'superadmin';
            const isSubscribedAndActive = (item.id === 'dashboard' || item.id === 'audit' || item.id === 'settings')
              ? true
              : isModuleAccessible(item.id as ERPModuleId);

            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (hasRolePermission) {
                    setActiveModule(item.id);
                    onClose();
                  }
                }}
                disabled={!hasRolePermission}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : !isSubscribedAndActive
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 opacity-75'
                    : hasRolePermission
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    : 'text-slate-600 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : !isSubscribedAndActive ? 'text-slate-500' : 'text-slate-400 group-hover:text-emerald-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1">
                  {!isSubscribedAndActive && (
                    <span className="text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" />
                      Coupé
                    </span>
                  )}
                  {isSubscribedAndActive && item.badge && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                      {item.badge}
                    </span>
                  )}
                  {!hasRolePermission && (
                    <span className="text-[9px] text-slate-600 uppercase font-mono">
                      Verrouillé
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* PWA & System Badge Footer with Subscription Validity */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                PWA Offline
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                currentTenant.subscriptionStatus === 'active'
                  ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800'
                  : 'text-rose-400 bg-rose-950/80 border-rose-800'
              }`}>
                {currentTenant.subscriptionStatus === 'active' ? 'Abonnement Actif' : 'Abonnement Expiré'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between">
              <span>Échéance :</span>
              <span className="font-mono font-bold text-slate-200">{formatDate(currentTenant.expiresAt, language)}</span>
            </div>
            <div className="text-[10px] text-slate-500 flex justify-between pt-1 border-t border-slate-800">
              <span>Monnaie : {currentTenant.currency}</span>
              <span className="text-emerald-400 font-semibold">TVA 19.25%</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
