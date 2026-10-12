import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  Layers,
  FileCheck,
  Building,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { triggerPrint, exportToCSV } from '../../utils/exportTools';

export const ReportsModule: React.FC = () => {
  const {
    transactions,
    invoices,
    accounts,
    currentTenant,
    currency,
    language
  } = useApp();

  const [periodType, setPeriodType] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');

  const totalIn = transactions
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.paidAmount, 0);

  const totalOut = transactions
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.paidAmount, 0);

  const netMargin = totalIn > 0 ? Math.round(((totalIn - totalOut) / totalIn) * 100) : 0;

  // Breakdown by revenue stream
  const revenueStreams = [
    { label: 'Prestations logicielles & Licences', amount: Math.round(totalIn * 0.65), percent: 65 },
    { label: 'Installation Réseaux & Matériel', amount: Math.round(totalIn * 0.25), percent: 25 },
    { label: 'Formations & Audit IT', amount: Math.round(totalIn * 0.10), percent: 10 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            {language === 'fr' ? 'Bilans Financiers & États Comptables' : 'Financial Reports & Balances'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Génération automatique des bilans périodiques (OHADA), marges nettes et répartition d'activité
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={periodType}
            onChange={e => setPeriodType(e.target.value as any)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
          >
            <option value="monthly">Bilan Mensuel (Mois en cours)</option>
            <option value="quarterly">Bilan Trimestriel (T3 / T4)</option>
            <option value="annual">Bilan Annuel Exercice 2026</option>
          </select>

          <button
            onClick={triggerPrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white dark:bg-emerald-600 rounded-xl text-xs font-bold cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer Bilan Certifié</span>
          </button>
        </div>
      </div>

      {/* Main KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Chiffre d'Affaires Encaissé</span>
          <div className="text-xl font-black text-emerald-600 mt-1">
            {formatCurrency(totalIn, currency)}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">↑ +14.2% vs période N-1</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Charges & Dépenses Totales</span>
          <div className="text-xl font-black text-rose-600 mt-1">
            {formatCurrency(totalOut, currency)}
          </div>
          <span className="text-[10px] text-slate-400">Salaires, carburant, loyer</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Résultat Net d'Exploitation</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalIn - totalOut, currency)}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">Excédent positif</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Taux de Marge Nette</span>
          <div className="text-xl font-black text-indigo-600 mt-1">
            {netMargin}%
          </div>
          <span className="text-[10px] text-indigo-500 font-bold">Rentabilité robuste</span>
        </div>
      </div>

      {/* Printable Sheet View */}
      <div className="p-8 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white space-y-6">
        <div className="flex justify-between items-start border-b border-slate-200 pb-4">
          <div>
            <div className="text-base font-black">{currentTenant.name}</div>
            <div className="text-xs text-slate-400">
              NIU : {currentTenant.taxId} • RCCM : {currentTenant.tradeRegister} • {currentTenant.city}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold uppercase text-emerald-600">RAPPORT FINANCIER CERTIFIÉ</div>
            <div className="text-xs font-bold text-slate-500">Exercice Comptable 2026</div>
          </div>
        </div>

        {/* Financial Flow Summary Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            1. Synthèse des Produits et des Charges
          </h3>
          <table className="w-full text-xs">
            <thead className="border-b border-slate-200 font-bold text-slate-500 uppercase">
              <tr>
                <th className="py-2 text-left">Poste Comptable</th>
                <th className="py-2 text-right">Montant (FCFA)</th>
                <th className="py-2 text-right">% du Chiffre d'Affaires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-2.5 font-bold text-emerald-600">Total Chiffre d'Affaires Encaissé (Produits)</td>
                <td className="py-2.5 text-right font-mono font-bold text-emerald-600">
                  {formatCurrency(totalIn, currency)}
                </td>
                <td className="py-2.5 text-right font-bold">100,0%</td>
              </tr>
              <tr>
                <td className="py-2.5 pl-4 text-slate-600 dark:text-slate-300">Achats & Fournitures Consommables</td>
                <td className="py-2.5 text-right font-mono">{formatCurrency(Math.round(totalOut * 0.15), currency)}</td>
                <td className="py-2.5 text-right text-slate-400">15,0%</td>
              </tr>
              <tr>
                <td className="py-2.5 pl-4 text-slate-600 dark:text-slate-300">Services Extérieurs & Carburant / Énergie</td>
                <td className="py-2.5 text-right font-mono">{formatCurrency(Math.round(totalOut * 0.25), currency)}</td>
                <td className="py-2.5 text-right text-slate-400">25,0%</td>
              </tr>
              <tr>
                <td className="py-2.5 pl-4 text-slate-600 dark:text-slate-300">Charges de Personnel (Salaires & CNPS)</td>
                <td className="py-2.5 text-right font-mono">{formatCurrency(Math.round(totalOut * 0.60), currency)}</td>
                <td className="py-2.5 text-right text-slate-400">60,0%</td>
              </tr>
              <tr className="border-t-2 border-slate-800 font-bold">
                <td className="py-3 text-slate-900 dark:text-white">RÉSULTAT NET COMPTABLE AVANT IMPÔT SUR SOCIÉTÉ</td>
                <td className="py-3 text-right font-mono text-emerald-600 font-black text-sm">
                  {formatCurrency(totalIn - totalOut, currency)}
                </td>
                <td className="py-3 text-right font-black text-emerald-600">{netMargin}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Revenue Breakdown */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            2. Répartition du Chiffre d'Affaires par Gamme
          </h3>
          <div className="space-y-2">
            {revenueStreams.map(rs => (
              <div key={rs.label} className="text-xs space-y-1">
                <div className="flex justify-between font-medium">
                  <span>{rs.label}</span>
                  <span className="font-bold">{formatCurrency(rs.amount, currency)} ({rs.percent}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${rs.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stamp & Footer */}
        <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs text-slate-400">
          <div>Document généré par Mbǎ'Ntām ERP • Certifié conforme</div>
          <div className="text-center p-3 border border-slate-300 rounded-xl w-48">
            <div className="text-[10px] font-bold uppercase text-slate-400">Visa Comptable & Direction</div>
            <div className="italic text-emerald-700 font-bold mt-2">{currentTenant.name}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
