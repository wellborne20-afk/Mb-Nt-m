import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Receipt,
  Coins,
  Shield,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Save,
  Globe,
  Lock,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';

export const SettingsModule: React.FC = () => {
  const {
    currentTenant,
    updateTenantProfile,
    currency,
    setCurrency,
    language,
    setLanguage,
    exportFullBackup,
    importFullBackup,
    resetToDemoData
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'taxes' | 'currencies' | 'backup' | 'subscription'>('profile');

  // Company Profile form
  const [name, setName] = useState(currentTenant.name);
  const [legalForm, setLegalForm] = useState(currentTenant.legalForm);
  const [taxId, setTaxId] = useState(currentTenant.taxId);
  const [tradeRegister, setTradeRegister] = useState(currentTenant.tradeRegister);
  const [address, setAddress] = useState(currentTenant.address);
  const [city, setCity] = useState(currentTenant.city);
  const [phone, setPhone] = useState(currentTenant.phone);
  const [email, setEmail] = useState(currentTenant.email);
  const [website, setWebsite] = useState(currentTenant.website || '');
  const [vatRate, setVatRate] = useState(currentTenant.vatRate);
  const [stampDuty, setStampDuty] = useState(currentTenant.stampDuty);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantProfile({
      name,
      legalForm,
      taxId,
      tradeRegister,
      address,
      city,
      phone,
      email,
      website,
      vatRate,
      stampDuty,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
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

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importFullBackup(content);
      if (success) {
        setImportStatus('Sauvegarde restaurée avec succès !');
      } else {
        setImportStatus('Erreur : le fichier JSON est corrompu ou invalide.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          {language === 'fr' ? 'Paramètres & Configuration de l’Entreprise' : 'Company Settings & Preferences'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Identifiants fiscaux (NIU / RCCM), taux TVA légaux, multi-devises et sauvegardes intégrales
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-slate-900 text-white dark:bg-emerald-600'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          Fiche Entreprise & Coordonnées
        </button>
        <button
          onClick={() => setActiveTab('taxes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'taxes'
              ? 'bg-slate-900 text-white dark:bg-emerald-600'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          Barèmes Fiscaux & Sociaux (Cameroun)
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'backup'
              ? 'bg-slate-900 text-white dark:bg-emerald-600'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          Sauvegarde & Restauration
        </button>
        <button
          onClick={() => setActiveTab('subscription')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'subscription'
              ? 'bg-slate-900 text-white dark:bg-emerald-600'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          Abonnement SaaS & Quotas
        </button>
      </div>

      {/* Tab: Company Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Identité Légale & En-tête de Facture</h3>
              <p className="text-xs text-slate-400">Ces mentions apparaîtront automatiquement sur tous vos devis, factures et bilans officiels.</p>
            </div>
            {saveSuccess && (
              <Badge variant="success">Enregistré avec succès !</Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Raison Sociale *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Forme Juridique *</label>
              <select
                value={legalForm}
                onChange={e => setLegalForm(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
              >
                <option value="SARL">SARL (Société à Responsabilité Limitée)</option>
                <option value="SA">SA (Société Anonyme)</option>
                <option value="SAS">SAS (Société par Actions Simplifiée)</option>
                <option value="ETS">ETS (Établissement Individuel)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Numéro d'Identifiant Unique (NIU) *</label>
              <input
                type="text"
                value={taxId}
                onChange={e => setTaxId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Registre de Commerce (RCCM) *</label>
              <input
                type="text"
                value={tradeRegister}
                onChange={e => setTradeRegister(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ville de Siège</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Adresse Complète</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Téléphone Principal (Standard & MoMo)</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Officiel</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer les Modifications</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab: Taxes & Fiscal settings */}
      {activeTab === 'taxes' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Paramètres Fiscaux et Sociaux Modifiables
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Conformes aux barèmes de la loi de finances en vigueur au Cameroun (vérifiables auprès de votre comptable).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-xs font-bold text-emerald-600 uppercase">Fiscalité sur les Factures (DGI)</span>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Taux de TVA Normal (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={vatRate}
                    onChange={e => setVatRate(parseFloat(e.target.value) || 0)}
                    className="w-32 p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold"
                  />
                  <span className="text-xs text-slate-400">19,25% (17,5% + 10% CAC)</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Droit de Timbre Fiscal par Décharge (FCFA)
                </label>
                <input
                  type="number"
                  value={stampDuty}
                  onChange={e => setStampDuty(parseInt(e.target.value) || 0)}
                  className="w-32 p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-xs font-bold text-blue-600 uppercase">Charges Sociales & Retenues Salariales</span>
              <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Part Salariale CNPS :</span>
                  <strong>4,20%</strong>
                </div>
                <div className="flex justify-between">
                  <span>Plafond Mensuel CNPS :</span>
                  <strong>750 000 FCFA</strong>
                </div>
                <div className="flex justify-between">
                  <span>Crédit Foncier (CFC) :</span>
                  <strong>1,00%</strong>
                </div>
                <div className="flex justify-between">
                  <span>Centimes Communaux (CAC) :</span>
                  <strong>10% du montant de l'IRPP</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Backup & Restore */}
      {activeTab === 'backup' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Sauvegardes et Sécurité des Données
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Exportez à tout moment l'intégralité de vos comptes, employés, factures et matériels sous format JSON cryptable ou réinitialisez les données.
            </p>
          </div>

          {importStatus && (
            <div className={`p-3 rounded-xl text-xs font-bold ${importStatus.includes('succès') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
              {importStatus}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Download */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
              <div className="p-3 w-fit rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                <Download className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Export Complet JSON</h4>
              <p className="text-[11px] text-slate-400">
                Télécharger une copie instantanée de toutes les tables pour archivage local ou externe.
              </p>
              <button
                onClick={handleDownloadBackup}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Télécharger la Sauvegarde
              </button>
            </div>

            {/* Upload */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
              <div className="p-3 w-fit rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                <Upload className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Restaurer Sauvegarde</h4>
              <p className="text-[11px] text-slate-400">
                Recharger un fichier JSON pour restaurer l'état exact de l'entreprise.
              </p>
              <label className="w-full py-2 bg-slate-900 text-white dark:bg-slate-700 hover:bg-slate-800 rounded-xl text-xs font-bold block text-center cursor-pointer">
                <span>Importer un fichier JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>

            {/* Reset to Demo */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
              <div className="p-3 w-fit rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Données de Démo</h4>
              <p className="text-[11px] text-slate-400">
                Réinitialiser la base avec les exemples camerounais réalistes pour démonstration.
              </p>
              <button
                onClick={() => {
                  if (confirm('Voulez-vous réinitialiser toutes les données aux valeurs de démo de base ?')) {
                    resetToDemoData();
                  }
                }}
                className="w-full py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Subscription Plans */}
      {activeTab === 'subscription' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Formule SaaS & Limites Actuelles
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Votre organisation bénéficie actuellement du plan <strong>Pro Entreprise</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-400">PLAN STARTER</span>
              <div className="text-xl font-bold">15 000 FCFA <span className="text-xs text-slate-400 font-normal">/ mois</span></div>
              <ul className="text-xs space-y-2 text-slate-500">
                <li>• 1 utilisateur</li>
                <li>• Jusqu'à 5 employés</li>
                <li>• Facturation illimitée</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-3 relative">
              <span className="absolute top-3 right-3 text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">Actif</span>
              <span className="text-xs font-bold text-emerald-600">PLAN PRO</span>
              <div className="text-xl font-bold">35 000 FCFA <span className="text-xs text-slate-400 font-normal">/ mois</span></div>
              <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <li>• 5 utilisateurs avec rôles distincts</li>
                <li>• Jusqu'à 25 employés</li>
                <li>• Paie & calcul CNPS/IRPP</li>
                <li>• Gestion du matériel & décharges</li>
                <li>• PWA Hors-ligne & WhatsApp</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-indigo-600">PLAN ENTREPRISE</span>
              <div className="text-xl font-bold">75 000 FCFA <span className="text-xs text-slate-400 font-normal">/ mois</span></div>
              <ul className="text-xs space-y-2 text-slate-500">
                <li>• Utilisateurs illimités</li>
                <li>• Multi-agences (Douala, Yaoundé...)</li>
                <li>• Support 24/7 & sauvegarde cloud</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
