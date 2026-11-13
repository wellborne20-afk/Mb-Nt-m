import React, { useState } from 'react';
import {
  UserPlus,
  Link2,
  Copy,
  Check,
  RefreshCw,
  Shield,
  Lock,
  Edit3,
  Power,
  ExternalLink,
  X,
  Briefcase
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppModuleKey, DEFAULT_ROLE_MODULES, User, UserRole } from '../../types';

const MODULE_OPTIONS: {
  id: AppModuleKey;
  label: string;
  description: string;
  confidential?: boolean;
}[] = [
  { id: 'workspace', label: 'Espace de Travail & Tâches', description: 'Consignes, tâches par poste, validations & rapports' },
  { id: 'dashboard', label: 'Tableau de Bord Général', description: 'Vue globale & indicateurs de chiffre d’affaires', confidential: true },
  { id: 'finances', label: 'Journal Financier & Caisse', description: 'Entrées, sorties, soldes caisses & Mobile Money', confidential: true },
  { id: 'invoices', label: 'Factures & Devis', description: 'Création factures, devis, proforma & relances' },
  { id: 'hr', label: 'Ressources Humaines', description: 'Dossiers employés, CNI, CNPS, contrats & congés', confidential: true },
  { id: 'payroll', label: 'Paie & Salaires', description: 'Bulletins de paie, salaires, CNPS & IRPP', confidential: true },
  { id: 'assets', label: 'Parc & Matériel', description: 'Équipements, affectations & fiches de décharge' },
  { id: 'crm', label: 'CRM & Clients', description: 'Fiches clients, prospects & pipeline commercial' },
  { id: 'reports', label: 'Bilans & Analyses', description: 'Bilans périodiques, marges & résultats nets', confidential: true },
  { id: 'audit', label: 'Journal d’Audit', description: 'Historique de sécurité & traçabilité des actions', confidential: true },
  { id: 'settings', label: 'Paramètres & Accès', description: 'Configuration entreprise, fiscalité & liens d’équipe', confidential: true },
];

const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  owner: 'Propriétaire / Dirigeant',
  director: 'Directeur Général',
  accountant: 'Comptable',
  hr: 'Responsable RH',
  sales: 'Commercial',
  employee: 'Travailleur / Collaborateur',
};

export const TeamAccessManager: React.FC = () => {
  const {
    currentTenant,
    users,
    positions,
    addCompanyUser,
    updateCompanyUser,
    regenerateUserAccessToken,
    toggleCompanyUserActive,
    getUserAllowedModules,
    loginWithToken,
  } = useApp();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+237 6');
  const [positionTitle, setPositionTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [selectedModules, setSelectedModules] = useState<AppModuleKey[]>(['workspace']);
  const [formError, setFormError] = useState<string | null>(null);

  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  const buildAccessLink = (user: User): string => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const token = user.accessToken || '';
    return `${origin}/?tenant=${encodeURIComponent(currentTenant.id)}&token=${encodeURIComponent(token)}`;
  };

  const handleCopyLink = async (user: User) => {
    const link = buildAccessLink(user);
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const input = document.createElement('input');
      input.value = link;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopiedUserId(user.id);
    setTimeout(() => setCopiedUserId(null), 2500);
  };

  const resetForm = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPhone('+237 6');
    setPositionTitle('');
    setDepartment('');
    setRole('employee');
    setSelectedModules(['workspace']);
    setFormError(null);
    setIsFormOpen(false);
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone || '+237 6');
    setPositionTitle(u.positionTitle || '');
    setDepartment(u.department || '');
    setRole(u.role);
    setSelectedModules(getUserAllowedModules(u));
    setFormError(null);
    setIsFormOpen(true);
  };

  const applyRolePreset = (nextRole: UserRole) => {
    setRole(nextRole);
    setSelectedModules(DEFAULT_ROLE_MODULES[nextRole] || ['workspace']);
  };

  const toggleModule = (modId: AppModuleKey) => {
    setSelectedModules(prev => {
      if (prev.includes(modId)) {
        if (prev.length === 1) return prev; // Toujours garder au moins 1 module
        return prev.filter(m => m !== modId);
      }
      return [...prev, modId];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Veuillez saisir le nom du collaborateur.');
      return;
    }
    if (!email.trim()) {
      setFormError('Veuillez saisir un email ou identifiant interne.');
      return;
    }
    if (selectedModules.length === 0) {
      setFormError('Sélectionnez au moins un module autorisé pour ce collaborateur.');
      return;
    }

    if (editingUser) {
      updateCompanyUser(editingUser.id, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        positionTitle: positionTitle.trim() || ROLE_LABELS[role],
        department: department.trim() || 'Général',
        role,
        allowedModules: selectedModules,
      });
    } else {
      addCompanyUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        positionTitle: positionTitle.trim() || ROLE_LABELS[role],
        department: department.trim() || 'Général',
        role,
        allowedModules: selectedModules,
      });
    }
    resetForm();
  };

  const confidentialIds: AppModuleKey[] = ['finances', 'payroll', 'hr', 'reports', 'dashboard'];
  const hidesConfidentialData = !selectedModules.some(m => confidentialIds.includes(m));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Accès par Responsabilité & Liens Directs de Connexion</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Affectez exactement les modules autorisés à chaque personne (comptable, RH, commercial, travailleur) et partagez son lien personnel. Les modules non cochés (ex. salaires, caisse, bilans) restent totalement invisibles.
          </p>
        </div>

        {!isFormOpen && (
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nouvel Accès / Lien</span>
          </button>
        )}
      </div>

      {/* Add / Edit Collaborator Access Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 space-y-5"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {editingUser
                ? `Modifier les accès de ${editingUser.name}`
                : 'Créer un Collaborateur & Générer son Lien de Connexion'}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nom & Prénom *
              </label>
              <input
                type="text"
                placeholder="Ex : Clarisse Ngono"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email ou Identifiant *
              </label>
              <input
                type="text"
                placeholder="Ex : clarisse@entreprise.cm"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Téléphone / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Profil / Responsabilité *
              </label>
              <select
                value={role}
                onChange={e => applyRolePreset(e.target.value as UserRole)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="employee">Travailleur (Espace de Travail seul)</option>
                <option value="accountant">Comptable (Finances, Caisse, Factures)</option>
                <option value="hr">Responsable RH (Personnel & Paie)</option>
                <option value="sales">Commercial (CRM & Factures)</option>
                <option value="director">Directeur / Co-gérant</option>
                <option value="owner">Propriétaire (Accès complet)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Poste dans l’entreprise
              </label>
              <input
                type="text"
                list="team-positions-datalist"
                placeholder="Ex : Caissière, Livreur, Comptable..."
                value={positionTitle}
                onChange={e => setPositionTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
              <datalist id="team-positions-datalist">
                {positions.map(p => (
                  <option key={p.id} value={p.title} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Département / Service
              </label>
              <input
                type="text"
                placeholder="Ex : Opérations, Comptabilité..."
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Preset shortcuts */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Modules autorisés pour cette personne ({selectedModules.length} sélectionné{selectedModules.length > 1 ? 's' : ''})
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Cochez uniquement les espaces nécessaires à sa fonction.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedModules(['workspace'])}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Espace de Travail seul
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedModules(['dashboard', 'workspace', 'finances', 'invoices', 'reports'])}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Comptable
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedModules(['workspace', 'hr', 'payroll', 'assets'])}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  RH
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedModules(['workspace', 'crm', 'invoices'])}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Commercial
                </button>
              </div>
            </div>

            {hidesConfidentialData && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Isolation garantie :</strong> Ce collaborateur n’aura aucun accès aux salaires, à la caisse, aux bilans ni aux données RH confidentielles.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {MODULE_OPTIONS.map(mod => {
                const checked = selectedModules.includes(mod.id);
                return (
                  <label
                    key={mod.id}
                    className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-start gap-2.5 ${
                      checked
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleModule(mod.id)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="truncate">{mod.label}</span>
                        {mod.confidential && (
                          <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                            · Sensible
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {mod.description}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{editingUser ? 'Enregistrer les Droits' : 'Créer & Générer le Lien'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Collaborators & Personal Links List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Collaborateurs & Liens d’accès configurés ({users.length})
          </div>
          <div className="text-[11px] text-slate-400">
            Partagez chaque lien uniquement avec la personne concernée
          </div>
        </div>

        {users.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            Aucun collaborateur configuré. Cliquez sur « Nouvel Accès / Lien » pour créer un lien personnel.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map(u => {
              const allowed = getUserAllowedModules(u);
              const link = buildAccessLink(u);
              const isCopied = copiedUserId === u.id;

              return (
                <div
                  key={u.id}
                  className={`p-5 space-y-3 transition-colors ${
                    u.isActive ? 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30' : 'opacity-55 bg-slate-50 dark:bg-slate-900/60'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{u.name}</span>
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {u.positionTitle || ROLE_LABELS[u.role]}
                        </span>
                        {!u.isActive && (
                          <span className="text-[11px] font-bold text-rose-600">· Désactivé</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {u.email} {u.phone ? `· ${u.phone}` : ''} {u.department ? `· ${u.department}` : ''}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 pt-0.5">
                        <span className="font-semibold text-slate-500">Modules autorisés : </span>
                        {allowed
                          .map(mId => MODULE_OPTIONS.find(o => o.id === mId)?.label || mId)
                          .join(' · ')}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(u)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 dark:bg-emerald-600 hover:opacity-90 text-white'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Lien copié !' : 'Copier le lien d’accès'}</span>
                      </button>

                      {u.isActive && u.accessToken && (
                        <button
                          type="button"
                          onClick={() => loginWithToken(currentTenant.id, u.accessToken!)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer whitespace-nowrap"
                          title="Ouvrir immédiatement la session de cette personne pour vérifier ses accès"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tester cet espace</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => openEditForm(u)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Modifier les modules autorisés"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Régénérer le lien personnel de ${u.name} ? L’ancien lien cessera immédiatement de fonctionner.`)) {
                            regenerateUserAccessToken(u.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Régénérer le lien (révoquer l’ancien)"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleCompanyUserActive(u.id)}
                        className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                          u.isActive ? 'text-slate-400 hover:text-rose-600' : 'text-emerald-600'
                        }`}
                        title={u.isActive ? 'Désactiver cet accès' : 'Réactiver cet accès'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Direct Link Preview */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-mono text-slate-600 dark:text-slate-300 overflow-x-auto">
                    <Link2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate select-all">{link}</span>
                    <span className="ml-auto text-[10px] font-sans font-semibold text-slate-400 shrink-0">
                      Code : {u.accessToken}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
