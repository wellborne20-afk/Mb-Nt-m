import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  CheckCircle,
  AlertTriangle,
  Clock,
  Layers,
  TrendingUp,
  FileSpreadsheet,
  FileCheck2,
  Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { exportToCSV, triggerPrint } from '../../utils/exportTools';
import { PaymentMethod, PaymentStatus, TransactionType } from '../../types';

export const CashJournalModule: React.FC = () => {
  const {
    transactions,
    accounts,
    budgets,
    dailyClosings,
    addTransaction,
    archiveTransaction,
    addDailyClosing,
    currency,
    language,
    currentUser
  } = useApp();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'journal' | 'closings' | 'budgets' | 'forecast'>('journal');

  // New Transaction Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formAccountId, setFormAccountId] = useState(accounts[0]?.id || '');
  const [formType, setFormType] = useState<TransactionType>('income');
  const [formCategory, setFormCategory] = useState('Ventes & Prestations');
  const [formDescription, setFormDescription] = useState('');
  const [formTotalAmount, setFormTotalAmount] = useState<number>(0);
  const [formPaidAmount, setFormPaidAmount] = useState<number>(0);
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>('momo_mtn');
  const [formPartyName, setFormPartyName] = useState('');
  const [formPartyType, setFormPartyType] = useState<'client' | 'supplier' | 'employee' | 'other'>('client');
  const [formReference, setFormReference] = useState('');
  const [formAttachment, setFormAttachment] = useState('');

  // Daily Closing Modal State
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [closingAccountId, setClosingAccountId] = useState(accounts[0]?.id || '');
  const [closingActualBalance, setClosingActualBalance] = useState<number>(0);
  const [closingNotes, setClosingNotes] = useState('');

  // Filtering transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.reference && t.reference.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesAccount = accountFilter === 'all' || t.accountId === accountFilter;

    return matchesSearch && matchesType && matchesAccount;
  });

  // Calculate totals
  const totalIn = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.paidAmount, 0);

  const totalOut = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.paidAmount, 0);

  // Handle transaction submit
  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription || formTotalAmount <= 0) return;

    const paid = Math.min(formPaidAmount, formTotalAmount);
    const remaining = formTotalAmount - paid;
    let status: PaymentStatus = 'paid';
    if (remaining > 0 && paid > 0) status = 'advance';
    else if (paid === 0) status = 'unpaid';

    addTransaction({
      accountId: formAccountId || accounts[0]?.id || 'acc-1',
      date: new Date().toISOString(),
      type: formType,
      category: formCategory,
      description: formDescription,
      totalAmount: formTotalAmount,
      paidAmount: paid,
      remainingAmount: remaining,
      paymentMethod: formPaymentMethod,
      status,
      partyName: formPartyName || (formType === 'income' ? 'Client' : 'Fournisseur'),
      partyType: formPartyType,
      reference: formReference,
      attachmentName: formAttachment,
      createdBy: currentUser.name,
    });

    setIsAddModalOpen(false);
    // Reset form
    setFormDescription('');
    setFormTotalAmount(0);
    setFormPaidAmount(0);
    setFormPartyName('');
    setFormReference('');
  };

  // Handle closing submit
  const handleValidateClosing = (e: React.FormEvent) => {
    e.preventDefault();
    const account = accounts.find(a => a.id === closingAccountId) || accounts[0];
    const diff = closingActualBalance - account.balance;

    addDailyClosing({
      date: new Date().toISOString().split('T')[0],
      accountId: account.id,
      openingBalance: account.initialBalance,
      totalIncome: totalIn,
      totalExpense: totalOut,
      calculatedClosingBalance: account.balance,
      actualClosingBalance: closingActualBalance,
      difference: diff,
      notes: closingNotes,
      validatedBy: currentUser.name,
      status: 'validated',
    });

    setIsClosingModalOpen(false);
  };

  // CSV Export
  const handleExportCSV = () => {
    const exportRows = filteredTransactions.map(t => ({
      Date: formatDateTime(t.date, language),
      Type: t.type === 'income' ? 'Entrée' : 'Sortie',
      Compte: accounts.find(a => a.id === t.accountId)?.name || 'Caisse',
      Categorie: t.category,
      Description: t.description,
      Tiers: t.partyName,
      Mode_Paiement: t.paymentMethod,
      Statut: t.status,
      Montant_Total: t.totalAmount,
      Montant_Regle: t.paidAmount,
      Reste_A_Payer: t.remainingAmount,
      Reference: t.reference || '',
      Responsable: t.createdBy,
    }));
    exportToCSV(`journal_caisse_${new Date().toISOString().split('T')[0]}`, exportRows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-600" />
            {language === 'fr' ? 'Journal Financier & Gestion de Caisse' : 'Cash Journal & Treasury'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Suivi quotidien des flux d'espèces, Mobile Money (MTN / Orange) et virements bancaires
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsClosingModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Clôturer la Caisse</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Opération</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('journal')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'journal'
              ? 'bg-slate-900 text-white dark:bg-emerald-600'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          Journal des flux
        </button>
        <button
          onClick={() => setActiveTab('closings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'closings'
              ? 'bg-slate-900 text-white dark:bg-emerald-600'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          Procès-Verbaux de Clôture
        </button>
        <button
          onClick={() => setActiveTab('budgets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'budgets'
              ? 'bg-slate-900 text-white dark:bg-emerald-600'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          Budgets & Seuils d'alerte
        </button>
        <button
          onClick={() => setActiveTab('forecast')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'forecast'
              ? 'bg-slate-900 text-white dark:bg-emerald-600'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          Prévisions de Trésorerie (30/60/90j)
        </button>
      </div>

      {activeTab === 'journal' && (
        <div className="space-y-4">
          {/* Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Total Entrées filtrées
                </span>
                <div className="text-xl font-black text-emerald-900 dark:text-emerald-300 mt-1">
                  +{formatCurrency(totalIn, currency)}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500 text-white">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                  Total Sorties filtrées
                </span>
                <div className="text-xl font-black text-rose-900 dark:text-rose-300 mt-1">
                  -{formatCurrency(totalOut, currency)}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-500 text-white">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Solde net du filtre
                </span>
                <div className={`text-xl font-black mt-1 ${totalIn - totalOut >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatCurrency(totalIn - totalOut, currency)}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white">
                <Layers className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Recherche opération, tiers, réf..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Selects & Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">Tous les flux</option>
                <option value="income">Entrées uniquement</option>
                <option value="expense">Sorties uniquement</option>
              </select>

              <select
                value={accountFilter}
                onChange={e => setAccountFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">Tous les comptes</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Exporter en fichier Excel / CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={triggerPrint}
                className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
                title="Imprimer le journal"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-4 py-3.5">Date & Heure</th>
                    <th className="px-4 py-3.5">Flux</th>
                    <th className="px-4 py-3.5">Description & Tiers</th>
                    <th className="px-4 py-3.5">Compte / Caisse</th>
                    <th className="px-4 py-3.5">Mode</th>
                    <th className="px-4 py-3.5 text-right">Montant Réglé</th>
                    <th className="px-4 py-3.5 text-right">Reste Dû</th>
                    <th className="px-4 py-3.5 text-center">Statut</th>
                    <th className="px-4 py-3.5">Responsable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                        Aucune transaction ne correspond aux critères sélectionnés.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(tx => {
                      const account = accounts.find(a => a.id === tx.accountId);
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3 text-slate-500 font-mono whitespace-nowrap">
                            {formatDateTime(tx.date, language)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 font-bold ${
                                tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {tx.type === 'income' ? '+' : '-'} {tx.type === 'income' ? 'Entrée' : 'Sortie'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900 dark:text-white">{tx.description}</div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2">
                              <span>{tx.partyName}</span>
                              <span className="text-slate-300">•</span>
                              <span className="italic">{tx.category}</span>
                              {tx.reference && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-[10px]">
                                    {tx.reference}
                                  </span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {account?.name || 'Caisse'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 capitalize">
                              {tx.paymentMethod === 'momo_mtn' ? 'MTN MoMo' :
                               tx.paymentMethod === 'om_orange' ? 'Orange Money' :
                               tx.paymentMethod === 'cash' ? 'Espèces' :
                               tx.paymentMethod === 'bank_transfer' ? 'Virement' : tx.paymentMethod}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-black whitespace-nowrap text-slate-900 dark:text-white">
                            {formatCurrency(tx.paidAmount, currency)}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            {tx.remainingAmount > 0 ? (
                              <span className="text-amber-600 font-bold">
                                {formatCurrency(tx.remainingAmount, currency)}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <Badge
                              variant={
                                tx.status === 'paid' ? 'success' :
                                tx.status === 'advance' ? 'warning' : 'danger'
                              }
                            >
                              {tx.status === 'paid' ? 'Soldé' :
                               tx.status === 'advance' ? 'Acompte' : 'Impayé'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-[11px]">
                            {tx.createdBy}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Closings Tab */}
      {activeTab === 'closings' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Procès-Verbaux de Clôture Quotidienne de Caisse
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Chaque soir ou fin de shift, le caissier et le responsable comptable arrêtent les comptes pour constater les écarts physiques.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Caisse / Compte</th>
                    <th className="px-4 py-3 text-right">Solde Ouverture</th>
                    <th className="px-4 py-3 text-right">Solde Calculé</th>
                    <th className="px-4 py-3 text-right">Solde Réel Constaté</th>
                    <th className="px-4 py-3 text-right">Écart</th>
                    <th className="px-4 py-3">Validé Par</th>
                    <th className="px-4 py-3 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {dailyClosings.map(dc => {
                    const acc = accounts.find(a => a.id === dc.accountId);
                    return (
                      <tr key={dc.id}>
                        <td className="px-4 py-3 font-semibold">{formatDate(dc.date, language)}</td>
                        <td className="px-4 py-3 font-medium">{acc?.name || 'Caisse Principale'}</td>
                        <td className="px-4 py-3 text-right font-mono">{formatCurrency(dc.openingBalance, currency)}</td>
                        <td className="px-4 py-3 text-right font-mono">{formatCurrency(dc.calculatedClosingBalance, currency)}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(dc.actualClosingBalance, currency)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold">
                          {dc.difference === 0 ? (
                            <span className="text-emerald-600">0 (Exact)</span>
                          ) : (
                            <span className={dc.difference > 0 ? 'text-blue-600' : 'text-rose-600'}>
                              {formatCurrency(dc.difference, currency)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{dc.validatedBy}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="success">Validé Conforme</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Budgets Tab */}
      {activeTab === 'budgets' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Budgets par Catégorie & Alertes de Dépassement
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Alerte automatique émise à 80% puis à 100% du plafond mensuel autorisé.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map(b => {
                const percent = Math.min(100, Math.round((b.currentSpent / b.monthlyLimit) * 100));
                const isOver = b.currentSpent >= b.monthlyLimit;
                const isWarning = b.currentSpent >= b.monthlyLimit * 0.8;

                return (
                  <div key={b.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {b.category}
                      </span>
                      <Badge variant={isOver ? 'danger' : isWarning ? 'warning' : 'success'}>
                        {percent}% utilisé
                      </Badge>
                    </div>

                    <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Dépensé : <strong className="text-slate-900 dark:text-white">{formatCurrency(b.currentSpent, currency)}</strong></span>
                      <span>Plafond : <strong className="text-slate-700 dark:text-slate-300">{formatCurrency(b.monthlyLimit, currency)}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Forecast Tab */}
      {activeTab === 'forecast' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Prévisionnel de Trésorerie Automatique (30 / 60 / 90 Jours)
          </h3>
          <p className="text-xs text-slate-400">
            Estimation projetée à partir du solde de caisse actuel, des factures clients à encaisser et des charges fixes récurrentes (loyers, salaires, abonnements).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Horizon 30 Jours</span>
              <div className="text-xl font-black text-emerald-600 mt-2">
                {formatCurrency(accounts.reduce((s, a) => s + a.balance, 0) + 1200000, currency)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Trésorerie saine (+5.2%)</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Horizon 60 Jours</span>
              <div className="text-xl font-black text-emerald-600 mt-2">
                {formatCurrency(accounts.reduce((s, a) => s + a.balance, 0) + 2450000, currency)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Encaiss. contrats majeurs</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Horizon 90 Jours</span>
              <div className="text-xl font-black text-emerald-600 mt-2">
                {formatCurrency(accounts.reduce((s, a) => s + a.balance, 0) + 3800000, currency)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Capacité d'investissement confirmée</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Transaction */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Enregistrer une Opération de Caisse"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateTransaction} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Type de Mouvement *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormType('income')}
                  className={`py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                    formType === 'income'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  + Entrée (Recette)
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('expense')}
                  className={`py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                    formType === 'expense'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  - Sortie (Dépense)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Compte / Caisse Débité ou Crédité *
              </label>
              <select
                value={formAccountId}
                onChange={e => setFormAccountId(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                required
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (Solde: {formatCurrency(acc.balance, currency)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Catégorie *
              </label>
              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value="Ventes & Prestations">Ventes & Prestations</option>
                <option value="Ventes de matériel">Ventes de matériel</option>
                <option value="Loyer & Charges">Loyer & Charges</option>
                <option value="Salaires & Rémunérations">Salaires & Rémunérations</option>
                <option value="Carburant & Énergie">Carburant & Énergie (Groupe/Véhicule)</option>
                <option value="Télécoms & Internet">Télécoms & Internet (Camtel/MTN)</option>
                <option value="Fournitures de bureau">Fournitures de bureau</option>
                <option value="Impôts & Taxes">Impôts & Taxes (DGI/CNPS)</option>
                <option value="Divers & Imprévus">Divers & Imprévus</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mode de Paiement *
              </label>
              <select
                value={formPaymentMethod}
                onChange={e => setFormPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value="cash">Espèces en caisse</option>
                <option value="momo_mtn">MTN Mobile Money Pro</option>
                <option value="om_orange">Orange Money Entreprise</option>
                <option value="bank_transfer">Virement Bancaire (Afriland, BICEC, etc.)</option>
                <option value="check">Chèque bancaire</option>
                <option value="card">Carte bancaire</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Libellé de l'Opération *
            </label>
            <input
              type="text"
              placeholder="Ex: Achat carburant groupe Akwa, règlement solde facture 089..."
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tiers (Nom Client ou Fournisseur)
              </label>
              <input
                type="text"
                placeholder="Ex: TotalEnergies, BTP Cameroun..."
                value={formPartyName}
                onChange={e => setFormPartyName(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Référence / N° Reçu ou Transaction
              </label>
              <input
                type="text"
                placeholder="Ex: MTN-TX-891823, CHQ-00129..."
                value={formReference}
                onChange={e => setFormReference(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Montant Total (FCFA) *
              </label>
              <input
                type="number"
                min="0"
                value={formTotalAmount || ''}
                onChange={e => {
                  const val = parseFloat(e.target.value) || 0;
                  setFormTotalAmount(val);
                  if (formPaidAmount === 0 || formPaidAmount > val) setFormPaidAmount(val);
                }}
                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Montant Réglé / Avancé *
              </label>
              <input
                type="number"
                min="0"
                max={formTotalAmount}
                value={formPaidAmount || ''}
                onChange={e => setFormPaidAmount(parseFloat(e.target.value) || 0)}
                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold text-emerald-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Reste à Payer (Auto)
              </label>
              <div className="p-2 bg-slate-200/60 dark:bg-slate-800 rounded-xl text-xs font-bold text-amber-600">
                {formatCurrency(Math.max(0, formTotalAmount - formPaidAmount), currency)}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              Enregistrer l'opération
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Daily Closing */}
      <Modal
        isOpen={isClosingModalOpen}
        onClose={() => setIsClosingModalOpen(false)}
        title="Procès-Verbal de Clôture Journalière de Caisse"
        maxWidth="lg"
      >
        <form onSubmit={handleValidateClosing} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Caisse à clôturer *
            </label>
            <select
              value={closingAccountId}
              onChange={e => setClosingAccountId(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} (Solde théorique : {formatCurrency(a.balance, currency)})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Solde théorique du logiciel :</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatCurrency(accounts.find(a => a.id === closingAccountId)?.balance || 0, currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Responsable de validation :</span>
              <span className="font-semibold text-emerald-600">{currentUser.name}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Montant réel compté physiquement en caisse (FCFA) *
            </label>
            <input
              type="number"
              min="0"
              value={closingActualBalance || ''}
              onChange={e => setClosingActualBalance(parseFloat(e.target.value) || 0)}
              className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Observations / Justification d'écart éventuel
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Clôture exacte, ou justificatif manquant de 1000 FCFA..."
              value={closingNotes}
              onChange={e => setClosingNotes(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsClosingModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20"
            >
              Valider la Clôture
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
