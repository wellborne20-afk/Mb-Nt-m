import React, { useState } from 'react';
import {
  Building2,
  UserCheck,
  Globe,
  Coins,
  Sun,
  Moon,
  Bell,
  Menu,
  Shield,
  CheckCircle2,
  Download,
  RotateCcw,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole, Currency, Language } from '../../types';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const {
    currentTenant,
    tenants,
    switchTenant,
    currentUser,
    switchRole,
    currency,
    setCurrency,
    language,
    setLanguage,
    darkMode,
    toggleDarkMode,
    notifications,
    markNotificationRead,
    clearNotifications,
    setActiveModule,
    resetToDemoData,
    exportFullBackup,
    logout
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showTenantMenu, setShowTenantMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const roleLabels: Record<UserRole, string> = {
    owner: language === 'fr' ? 'Dirigeant / Propriétaire' : 'Owner / Director',
    director: language === 'fr' ? 'Directeur Général' : 'General Manager',
    accountant: language === 'fr' ? 'Chef Comptable' : 'Accountant',
    hr: language === 'fr' ? 'Responsable RH' : 'HR Manager',
    sales: language === 'fr' ? 'Commercial' : 'Sales Representative',
    employee: language === 'fr' ? 'Employé' : 'Employee',
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_mbantam_${currentTenant.id}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Tenant Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowTenantMenu(!showTenantMenu)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                {currentTenant.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="truncate max-w-[140px] md:max-w-[190px]">{currentTenant.name}</span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-semibold px-1.5 py-0.2 rounded">
                    {currentTenant.city}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  NIU: {currentTenant.taxId}
                </div>
              </div>
            </button>

            {showTenantMenu && (
              <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {language === 'fr' ? 'Changer d’entreprise' : 'Switch Organization'}
                </div>
                {tenants.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      switchTenant(t.id);
                      setShowTenantMenu(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between text-xs transition-colors ${
                      t.id === currentTenant.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-[10px] text-slate-400">{t.city}, {t.country}</div>
                    </div>
                    {t.id === currentTenant.id && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Role Tester (Crucial for testing RBAC) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Tester les permissions par rôle"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden md:inline">{roleLabels[currentUser.role]}</span>
              <span className="md:hidden text-[11px] uppercase font-bold">{currentUser.role}</span>
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {language === 'fr' ? 'Simuler le rôle (RBAC)' : 'Simulate Role (RBAC)'}
                </div>
                {(['owner', 'accountant', 'hr', 'sales', 'employee'] as UserRole[]).map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                      currentUser.role === r
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{roleLabels[r]}</span>
                    {currentUser.role === r && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Currency Switcher */}
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            title="Devise d'affichage"
          >
            <option value="XAF">FCFA (XAF)</option>
            <option value="XOF">FCFA (XOF)</option>
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
          </select>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors uppercase"
            title="Changer de langue / Switch language"
          >
            {language === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
          </button>

          {/* Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={darkMode ? 'Passer au mode clair' : 'Passer au mode sombre'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Quick Backup Export */}
          <button
            onClick={handleDownloadBackup}
            className="hidden sm:flex p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Télécharger une sauvegarde complète"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              title="Centre d'alertes"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {language === 'fr' ? 'Alertes & Notifications' : 'Alerts & Notifications'}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                    >
                      {language === 'fr' ? 'Tout marquer comme lu' : 'Mark all read'}
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto mt-2 space-y-2">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      {language === 'fr' ? 'Aucune notification' : 'No notifications'}
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.linkModule) setActiveModule(n.linkModule);
                          setShowNotifications(false);
                        }}
                        className={`p-2.5 rounded-xl text-xs cursor-pointer transition-colors border ${
                          n.isRead
                            ? 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-500'
                            : n.type === 'danger'
                            ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 text-rose-900 dark:text-rose-300'
                            : n.type === 'warning'
                            ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 text-amber-900 dark:text-amber-300'
                            : 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-200 text-blue-900 dark:text-blue-300'
                        }`}
                      >
                        <div className="font-bold">{n.title}</div>
                        <div className="mt-0.5 text-[11px] leading-relaxed">{n.message}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-bold transition-colors cursor-pointer"
            title="Se déconnecter de l'entreprise"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
};
