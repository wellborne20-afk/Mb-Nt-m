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
  Coins,
  Sun,
  Moon,
  Zap,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole, Currency } from '../../types';
import { Badge } from '../common/Badge';

export const AuthModule: React.FC = () => {
  const {
    tenants,
    login,
    registerTenant,
    language,
    setLanguage,
    darkMode,
    toggleDarkMode,
    currency
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login state
  const [selectedTenantId, setSelectedTenantId] = useState(tenants[0]?.id || '');
  const [loginEmail, setLoginEmail] = useState('alexandre.mbida@kemet-tech.cm');
  const [loginPassword, setLoginPassword] = useState('••••••••••');
  const [loginRole, setLoginRole] = useState<UserRole>('owner');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register new company state
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newLegalForm, setNewLegalForm] = useState('SARL');
  const [newTaxId, setNewTaxId] = useState('');
  const [newTradeRegister, setNewTradeRegister] = useState('');
  const [newCity, setNewCity] = useState('Douala');
  const [newCountry, setNewCountry] = useState('Cameroun');
  const [newAddress, setNewAddress] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('+237 6');
  const [newCurrency, setNewCurrency] = useState<Currency>('XAF');
  const [newPlan, setNewPlan] = useState<'pro' | 'starter' | 'enterprise'>('pro');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId) {
      setLoginError('Veuillez sélectionner votre entreprise.');
      return;
    }
    setLoginError(null);
    login(selectedTenantId, loginEmail, loginRole);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName || !newAdminName || !newAdminEmail) {
      return;
    }

    registerTenant(
      {
        name: newCompanyName,
        legalForm: newLegalForm,
        taxId: newTaxId || `M${Math.floor(100000000000 + Math.random() * 900000000000)}X`,
        tradeRegister: newTradeRegister || `RC/${newCity.slice(0, 3).toUpperCase()}/2026/B/${Math.floor(100 + Math.random() * 900)}`,
        address: newAddress || `${newCity} Centre`,
        city: newCity,
        country: newCountry,
        phone: newAdminPhone,
        email: newAdminEmail,
        currency: newCurrency,
        vatRate: 19.25,
        stampDuty: 1000,
        subscriptionPlan: newPlan,
        subscriptionStatus: 'active',
      },
      {
        name: newAdminName,
        email: newAdminEmail,
        phone: newAdminPhone,
      }
    );
  };

  const quickDemoLogin = (tenantId: string, email: string, role: UserRole) => {
    login(tenantId, email, role);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / Nav */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800/80 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-emerald-500/20">
            M
          </div>
          <div>
            <div className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              Mbǎ'Ntām
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-bold">
                SaaS Multi-Entreprise
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              ERP de Gestion & Trésorerie PME Afrique
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switch */}
          <button
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            {language === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
          </button>

          {/* Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 relative z-10">
        {/* Left: Presentation / Pitch */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plateforme Dédiée aux Entreprises d'Afrique</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Centralisez toute la gestion de votre entreprise en <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">un seul outil</span>.
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
            Trésorerie avec Mobile Money (MTN MoMo & Orange Money), facturation OHADA avec TVA 19,25%, paie camerounaise (CNPS & IRPP), parc matériel et CRM unifié.
          </p>

          {/* Key Advantages Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-left max-w-lg mx-auto lg:mx-0">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-white">Multi-Tenant Étanche</div>
                <div className="text-[11px] text-slate-400">Données 100% isolées par entreprise</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-white">Mobile Money & Banques</div>
                <div className="text-[11px] text-slate-400">MTN MoMo, Orange Money, Afriland...</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-white">Lois Sociales Cameroun</div>
                <div className="text-[11px] text-slate-400">CNPS 4,2%, IRPP, CAC, CFC, RAV</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-white">PWA & Hors-Ligne</div>
                <div className="text-[11px] text-slate-400">Consultez vos comptes sans coupure</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Auth Card */}
        <div className="w-full max-w-md bg-slate-800/90 border border-slate-700 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
          {/* Tabs: Login vs Register */}
          <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-2xl mb-6 text-xs font-bold">
            <button
              onClick={() => setMode('login')}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Connexion Entreprise
            </button>
            <button
              onClick={() => setMode('register')}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Créer mon Entreprise
            </button>
          </div>

          {/* Form: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Entreprise / Organisation *
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
                        {t.name} ({t.city}, {t.country})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Rôle & Périmètre d'accès *
                </label>
                <select
                  value={loginRole}
                  onChange={e => setLoginRole(e.target.value as UserRole)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none"
                >
                  <option value="owner">Directeur Général / Propriétaire (Accès Complet)</option>
                  <option value="accountant">Chef Comptable (Trésorerie, Factures, Paie)</option>
                  <option value="hr">Responsable Ressources Humaines (Agents, Paie)</option>
                  <option value="sales">Commercial (CRM, Devis, Factures)</option>
                  <option value="employee">Employé (Espace Personnel)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Email professionnel *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="directeur@entreprise.cm"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-300">Mot de passe *</label>
                  <span className="text-[10px] text-emerald-400 cursor-pointer hover:underline">Mot de passe oublié ?</span>
                </div>
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
                <span>Accéder à mon Espace Entreprise</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* 1-Click Quick Demo Accounts Box */}
              <div className="pt-4 border-t border-slate-700/60 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Accès Démo Immédiat en 1 Clic :</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => quickDemoLogin('tenant-kemet-dla', 'alexandre.mbida@kemet-tech.cm', 'owner')}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-white truncate">Kemet (Douala)</div>
                    <div className="text-[10px] text-emerald-400">👑 Dirigeant</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => quickDemoLogin('tenant-kemet-dla', 'b.ngo@kemet-tech.cm', 'accountant')}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-white truncate">Kemet (Douala)</div>
                    <div className="text-[10px] text-blue-400">📊 Chef Comptable</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => quickDemoLogin('tenant-kemet-dla', 'p.fotso@kemet-tech.cm', 'hr')}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-white truncate">Kemet (Douala)</div>
                    <div className="text-[10px] text-purple-400">👥 Responsable RH</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => quickDemoLogin('tenant-etoile-yde', 'info@conseil-etoile.cm', 'owner')}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-white truncate">Étoile (Yaoundé)</div>
                    <div className="text-[10px] text-amber-400">🏛️ Cabinet Conseil</div>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Form: REGISTER / ONBOARDING */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="text-xs text-slate-300 pb-1">
                Configurez votre espace en 30 secondes. Chaque entreprise dispose d'une base totalement hermétique.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nom de l'entreprise *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pharmacie du Wouri SARL, BTP Sahel..."
                  value={newCompanyName}
                  onChange={e => setNewCompanyName(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Forme Juridique</label>
                  <select
                    value={newLegalForm}
                    onChange={e => setNewLegalForm(e.target.value)}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="SARL">SARL</option>
                    <option value="SA">SA</option>
                    <option value="SAS">SAS</option>
                    <option value="ETS">ETS (Individuel)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Ville</label>
                  <select
                    value={newCity}
                    onChange={e => setNewCity(e.target.value)}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="Douala">Douala</option>
                    <option value="Yaoundé">Yaoundé</option>
                    <option value="Bafoussam">Bafoussam</option>
                    <option value="Garoua">Garoua</option>
                    <option value="Kribi">Kribi</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Numéro NIU</label>
                  <input
                    type="text"
                    placeholder="M0219..."
                    value={newTaxId}
                    onChange={e => setNewTaxId(e.target.value)}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Devise Principale</label>
                  <select
                    value={newCurrency}
                    onChange={e => setNewCurrency(e.target.value as Currency)}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold"
                  >
                    <option value="XAF">FCFA (XAF)</option>
                    <option value="XOF">FCFA (XOF)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-emerald-400">
                  Administrateur de l'Entreprise
                </span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <input
                      type="text"
                      placeholder="Nom & Prénom"
                      value={newAdminName}
                      onChange={e => setNewAdminName(e.target.value)}
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Téléphone direct"
                      value={newAdminPhone}
                      onChange={e => setNewAdminPhone(e.target.value)}
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                      required
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <input
                    type="email"
                    placeholder="Email de connexion administrateur"
                    value={newAdminEmail}
                    onChange={e => setNewAdminEmail(e.target.value)}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Créer l'Entreprise & Démarrer l'ERP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-800 text-center text-xs text-slate-500 relative z-10">
        <div>
          © 2026 <strong>Mbǎ'Ntām Technologies</strong> • ERP Cloud & PWA pour l'Afrique francophone (Cameroun, Gabon, Côte d'Ivoire, Sénégal...)
        </div>
        <div className="text-[10px] text-slate-600 mt-1">
          Sécurité certifiée • Sauvegardes chiffrées • Isolation stricte des données multi-entreprises
        </div>
      </footer>
    </div>
  );
};
