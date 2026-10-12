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
  const { currentTenant, currency, language, isSuperAdmin, superAdminReturnToConsole } = useApp();
  const moduleInfo = defaultModulesCatalog[moduleId] || {
    name: 'Module',
    description: '',
    monthlyPrice: 10000,
  };

  const tenantModule = currentTenant.modules?.[moduleId];
  const isExpired = tenantModule?.isEnabled && tenantModule.expiresAt < new Date().toISOString().split('T')[0];
  const isNotSubscribed = !tenantModule || !tenantModule.isEnabled;
  const isTenantSuspended = currentTenant.subscriptionStatus === 'suspended' || currentTenant.subscriptionStatus === 'expired';

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
            <span>Tarif unitaire du module :</span>
            <span className="text-emerald-600">{formatCurrency(moduleInfo.monthlyPrice, currency)} / mois</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {moduleInfo.description}
          </p>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-[11px] text-slate-500">
            <span>Activation instantanée :</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">1, 2, 3, 6 ou 12 mois</span>
          </div>
        </div>

        {/* Contact or Super Admin Action */}
        <div className="pt-2 space-y-3">
          {isSuperAdmin ? (
            <button
              onClick={superAdminReturnToConsole}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
            >
              👑 Activer ce module depuis la Console Super Admin
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
              <div className="font-bold flex items-center justify-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                Service Client & Facturation Mbǎ'Ntām
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Contactez votre chargé de compte au <strong>+237 677 89 45 12</strong> ou par WhatsApp pour activer ou prolonger ce module.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
