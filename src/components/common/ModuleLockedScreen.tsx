import React from 'react';
import { Lock, AlertCircle, Phone, Calendar, ArrowRight, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ERPModuleId } from '../../types';
import { defaultModulesCatalog } from '../../data/mockData';
import { formatDate, formatCurrency } from '../../utils/formatters';

interface ModuleLockedScreenProps {
  moduleId: ERPModuleId;
}

export const ModuleLockedScreen: React.FC<ModuleLockedScreenProps> = ({ moduleId }) => {
  const { currentTenant, currency, language, isSuperAdmin, superAdminReturnToConsole, addModuleToTenant } = useApp();
  const moduleInfo = defaultModulesCatalog[moduleId] || {
    name: 'Module',
    description: '',
    monthlyPrice: 10000,
  };

  const tenantModule = currentTenant.modules?.[moduleId];
  const isExpired = tenantModule?.isEnabled && tenantModule.expiresAt < new Date().toISOString().split('T')[0];
  const isNotSubscribed = !tenantModule || !tenantModule.isEnabled;
  const isTenantSuspended = currentTenant.subscriptionStatus === 'suspended' || currentTenant.subscriptionStatus === 'expired';
  const effectivePrice = tenantModule ? tenantModule.monthlyPrice : moduleInfo.monthlyPrice;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isTenantSuspended
              ? 'Abonnement d’Entreprise Expiré'
              : isExpired
              ? `Accès au Module « ${moduleInfo.name} » Expiré`
              : `Module « ${moduleInfo.name} » Non Souscrit`}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {isTenantSuspended
              ? `L'accès global de l'entreprise ${currentTenant.name} a atteint son échéance. Le service est automatiquement suspendu en attente de renouvellement.`
              : isExpired
              ? `La durée de validité de ce module pour ${currentTenant.name} a pris fin le ${formatDate(tenantModule?.expiresAt, language)}. Conformément à votre formule SaaS, les fonctionnalités sont coupées jusqu'à régularisation.`
              : `Votre formule actuelle pour ${currentTenant.name} n'inclut pas ce module. Vous pouvez l'ajouter à la carte auprès du Super Administrateur Mbǎ'Ntām.`}
          </p>
        </div>

        {/* Pricing & Module details */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
          <div className="flex justify-between font-bold text-slate-900 dark:text-white">
            <span>Tarif unitaire négocié :</span>
            <span className="text-emerald-600 font-mono text-sm">{formatCurrency(effectivePrice, currency)} / mois</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {moduleInfo.description}
          </p>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-[11px] text-slate-500">
            <span>Activation instantanée :</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">1, 2, 3, 6 ou 12 mois</span>
          </div>
        </div>

        {/* Instant Module Subscription Expansion or Super Admin Action */}
        <div className="pt-2 space-y-3">
          {isSuperAdmin ? (
            <button
              onClick={superAdminReturnToConsole}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
            >
              👑 Activer ce module depuis la Console Super Admin
            </button>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-left space-y-2">
                <div className="font-bold text-xs text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-indigo-500" />
                  Souscrire et Ajouter ce Module à votre Entreprise
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Votre entreprise souhaite utiliser <strong>{moduleInfo.name}</strong> ? Vous pouvez l'ajouter immédiatement à votre abonnement pour 1, 3, 6 ou 12 mois.
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (confirm(`Confirmez-vous l'ajout et l'activation du module "${moduleInfo.name}" pour ${currentTenant.name} ?`)) {
                        addModuleToTenant(currentTenant.id, moduleId, 1, effectivePrice);
                      }
                    }}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Ajouter & Activer ce Module (+1 Mois)</span>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <div className="font-bold flex items-center justify-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  Assistance Commerciale Mbǎ'Ntām
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Support & Service Commercial : <strong>+237 677 89 45 12</strong> (MTN MoMo / Orange Money / Facture).
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
