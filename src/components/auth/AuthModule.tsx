import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Phone,
  Globe,
  Sun,
  Moon,
  Zap,
  Crown,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const AuthModule: React.FC = () => {
  const {
    tenants,
    login,
    loginSuperAdmin,
    language,
    setLanguage,
    darkMode,
    toggleDarkMode
  } = useApp();

  // ONLY 2 LOGIN MODES: 'tenant' OR 'superadmin'
  const [authMode, setAuthMode] = useState<'tenant' | 'superadmin'>('tenant');

  // Enterprise login state
  const [selectedTenantId, setSelectedTenantId] = useState(tenants[0]?.id || '');
  const [loginEmail, setLoginEmail] = useState('alexandre.mbida@kemet-tech.cm');
  const [loginPassword, setLoginPassword] = useState('••••••••••');
  const [loginRole, setLoginRole] = useState<UserRole>('owner');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Super Admin login state
  const [superAdminEmail, setSuperAdminEmail] = useState('superadmin@mbantam.cm');
  const [superAdminPassword, setSuperAdminPassword] = useState('admin2026!');

  const handleEnterpriseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId) {
      setLoginError('Veuillez sélectionner votre entreprise.');
      return;
    }
    setLoginError(null);
    login(selectedTenantId, loginEmail, loginRole);
  };

  const handleSuperAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginSuperAdmin();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800/80 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-emerald-500/20">
            M
          </div>
          <div>
            <div className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              Mbǎ'Ntām
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                SaaS B2B
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              ERP de Gestion, Caisse & Trésorerie Afrique
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switch */}
          <button
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {language === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
          </button>

          {/* Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 relative z-10">
        {/* Left: Presentation */}
        <div className="flex-1 space-y-5 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portail SaaS Multi-Entreprises Dédié</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Accédez à l'espace de gestion de votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">entreprise</span>.
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
            Chaque entreprise dispose d'une infrastructure étanche et sécurisée avec ses modules sur-mesure (Caisse, Facturation, RH, Paie Cameroun, Matériel, CRM).
          </p>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-1.5 max-w-lg mx-auto lg:mx-0 text-left">
            <div className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Politique d'Accès Sécurisé
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Les nouvelles entreprises clientes sont configurées et provisionnées exclusivement par l'administrateur de la plateforme avec les modules et la durée souscrits.
            </p>
          </div>
        </div>

        {/* Right: Auth Card with STRICTLY 2 OPTIONS */}
        <div className="w-full max-w-md bg-slate-800/90 border border-slate-700 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
          {/* THE 2 ONLY CHOICES: Entreprise VS Super Admin */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-900 rounded-2xl mb-6 text-xs font-bold gap-1">
            <button
              onClick={() => setAuthMode('tenant')}
              className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'tenant'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>1. Connexion Entreprise</span>
            </button>
            <button
              onClick={() => setAuthMode('superadmin')}
              className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'superadmin'
                  ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>2. Super Admin</span>
            </button>
          </div>

          {/* OPTION 1: CONNEXION DE L'ENTREPRISE */}
          {authMode === 'tenant' && (
            <form onSubmit={handleEnterpriseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Sélectionnez votre Entreprise *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={selectedTenantId}
                    onChange={e => setSelectedTenantId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  >
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.city}) {t.subscriptionStatus === 'expired' ? '⛔ [Abonnement Expiré]' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Rôle de connexion *
                </label>
                <select
                  value={loginRole}
                  onChange={e => setLoginRole(e.target.value as UserRole)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none"
                >
                  <option value="owner">Directeur Général / Dirigeant</option>
                  <option value="accountant">Chef Comptable</option>
                  <option value="hr">Responsable Ressources Humaines</option>
                  <option value="sales">Commercial</option>
                  <option value="employee">Employé</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Email professionnel ou Identifiant *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="agent@entreprise.cm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mot de passe *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Connexion à l'Espace Entreprise</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Demo Access Box for rapid evaluation */}
              <div className="pt-4 border-t border-slate-700/60 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Accès Démo 1-Clic :</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => login('tenant-kemet-dla', 'alexandre.mbida@kemet-tech.cm', 'owner')}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-white truncate">Kemet (Douala)</div>
                    <div className="text-[10px] text-emerald-400">👑 Tous les modules</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => login('tenant-etoile-yde', 'info@conseil-etoile.cm', 'owner')}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-white truncate">Étoile (Yaoundé)</div>
                    <div className="text-[10px] text-indigo-400">💼 Caisse + Factures</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => login('tenant-bassa-exp', 'contact@boulangerie-bassa.cm', 'owner')}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-500 text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-white truncate">Boulangerie Bassa</div>
                    <div className="text-[10px] text-rose-400">⛔ Test Expire / Coupé</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => login('tenant-kemet-dla', 'b.ngo@kemet-tech.cm', 'accountant')}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-white truncate">Kemet (Douala)</div>
                    <div className="text-[10px] text-blue-400">📊 Chef Comptable</div>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* OPTION 2: CONNEXION DU SUPER ADMIN */}
          {authMode === 'superadmin' && (
            <form onSubmit={handleSuperAdminSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <Crown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Espace Super Administrateur</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Accès réservé au gestionnaire de la plateforme Mbǎ'Ntām pour créer, configurer les modules et renouveler les abonnements clients.
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Identifiant Super Admin *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={superAdminEmail}
                    onChange={e => setSuperAdminEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Code Secret / Mot de passe Super Admin *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={superAdminPassword}
                    onChange={e => setSuperAdminPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Crown className="w-4 h-4 text-amber-300" />
                <span>Ouvrir la Console Super Administrateur</span>
              </button>

              <div className="text-center pt-2">
                <span className="text-[11px] text-slate-500 font-mono">
                  Identifiants pré-remplis pour la démonstration
                </span>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-800 text-center text-xs text-slate-500 relative z-10">
        <div>
          © 2026 <strong>Mbǎ'Ntām Technologies</strong> • ERP SaaS B2B Multi-Entreprise
        </div>
        <div className="text-[10px] text-slate-600 mt-1">
          2 modes d'accès sécurisés : Entreprise cliente & Console Super Admin
        </div>
      </footer>
    </div>
  );
};
