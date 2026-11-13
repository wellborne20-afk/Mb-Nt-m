import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  FileText,
  Clock,
  ShieldCheck,
  Building2,
  Calendar,
  Users,
  CheckCircle2,
  PhoneCall,
  ClipboardList,
  CheckSquare,
  Square
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const DashboardModule: React.FC = () => {
  const {
    currentTenant,
    transactions,
    accounts,
    invoices,
    employees,
    budgets,
    currency,
    language,
    setActiveModule,
    notifications,
    tasks,
    toggleTaskCheck,
    isModuleAccessible
  } = useApp();

  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');

  const today = new Date().toISOString().split('T')[0];
  const pendingPriorityTasks = tasks.filter(t => t.status !== 'validated');
  const carryOverOrCorrectionTasks = pendingPriorityTasks.filter(
    t => t.createdDate < today || t.dueDate < today || t.status === 'correction_needed'
  );

  // Calculations
  const totalCashBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.paidAmount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.paidAmount, 0);

  const netProfit = totalIncome - totalExpense;

  const totalUnpaidInvoices = invoices
    .filter(i => i.type === 'invoice' && i.status !== 'paid')
    .reduce((sum, i) => sum + i.amountDue, 0);

  const totalAdvancesPending = transactions
    .filter(t => t.status === 'advance')
    .reduce((sum, t) => sum + t.remainingAmount, 0);

  // Top expense categories
  const expensesByCategory: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.paidAmount;
    });

  const sortedExpenses = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {language === 'fr' ? 'Tableau de Bord Général' : 'General Dashboard'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {currentTenant.name} • Siège social {currentTenant.city} • Devise active : {currency}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {isModuleAccessible('workspace') && (
            <button
              onClick={() => setActiveModule('workspace')}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <ClipboardList className="w-4 h-4" />
              <span>{language === 'fr' ? 'Espace de Travail' : 'Workspace'}</span>
            </button>
          )}
          <button
            onClick={() => setActiveModule('finances')}
            className="flex items-center gap-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{language === 'fr' ? 'Saisie Caisse' : 'Cash Entry'}</span>
          </button>
          <button
            onClick={() => setActiveModule('invoices')}
            className="flex items-center gap-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>{language === 'fr' ? 'Nouvelle Facture' : 'New Invoice'}</span>
          </button>
        </div>
      </div>

      {/* Priority Carry-over / Pending Tasks Widget on Login */}
      {isModuleAccessible('workspace') && pendingPriorityTasks.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/70 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 bg-amber-50/60 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>
                  À traiter en priorité avant les nouvelles tâches ({pendingPriorityTasks.length})
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {carryOverOrCorrectionTasks.length > 0
                  ? `${carryOverOrCorrectionTasks.length} tâche(s) reportée(s), en retard ou nécessitant une correction.`
                  : 'Cochez vos tâches réalisées et transmettez vos validations dans l’Espace de Travail.'}
              </p>
            </div>
            <button
              onClick={() => setActiveModule('workspace')}
              className="px-3.5 py-1.5 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl text-xs font-bold hover:opacity-90 cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              Ouvrir l’Espace de Travail →
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pendingPriorityTasks.slice(0, 4).map(t => (
              <div key={t.id} className="px-5 py-3 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white truncate">{t.title}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Poste : {t.assignedPositionName}
                    {t.assignedToName ? ` · ${t.assignedToName}` : ''} · Échéance : {formatDate(t.dueDate, language)}
                    {t.status === 'correction_needed' && ' · Correction demandée'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleTaskCheck(t.id, !t.isCheckedDone)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer shrink-0 ${
                    t.isCheckedDone
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500'
                  }`}
                >
                  {t.isCheckedDone ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  <span>{t.isCheckedDone ? 'Réalisée' : 'Cocher fait'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscription Status Banner if expired or near expiry */}
      {(currentTenant.subscriptionStatus === 'expired' || currentTenant.expiresAt < new Date().toISOString().split('T')[0]) && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-800 dark:text-rose-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <div className="font-bold text-xs">
                Abonnement SaaS échu depuis le {formatDate(currentTenant.expiresAt, language)}
              </div>
              <div className="text-[11px] text-rose-700 dark:text-rose-400">
                L'accès aux modules opérationnels est suspendu pour défaut de paiement. Contactez le Super Admin pour régulariser.
              </div>
            </div>
          </div>
          <div className="text-right sm:shrink-0">
            <span className="text-[10px] font-mono bg-rose-500 text-white px-2.5 py-1 rounded-full font-bold">
              ACCÈS RESTREINT
            </span>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={language === 'fr' ? 'Trésorerie Disponible' : 'Total Cash Available'}
          value={formatCurrency(totalCashBalance, currency)}
          subtitle={language === 'fr' ? 'Caisses + MoMo + Banques' : 'Cash + MoMo + Banks'}
          icon={Wallet}
          color="emerald"
          trend={{ value: '18.4%', isPositive: true }}
        />
        <StatCard
          title={language === 'fr' ? 'Chiffre d’Affaires / Entrées' : 'Turnover / Inflow'}
          value={formatCurrency(totalIncome, currency)}
          subtitle={language === 'fr' ? 'Encaissements cumulés' : 'Collected revenue'}
          icon={TrendingUp}
          color="blue"
          trend={{ value: '12.0%', isPositive: true }}
        />
        <StatCard
          title={language === 'fr' ? 'Dépenses / Sorties' : 'Expenses / Outflow'}
          value={formatCurrency(totalExpense, currency)}
          subtitle={language === 'fr' ? 'Fournisseurs & Charges' : 'Suppliers & Ops'}
          icon={TrendingDown}
          color="rose"
        />
        <StatCard
          title={language === 'fr' ? 'Bénéfice Net Période' : 'Net Period Profit'}
          value={formatCurrency(netProfit, currency)}
          subtitle={language === 'fr' ? 'Entrées - Sorties réelles' : 'Inflow - Outflow'}
          icon={ShieldCheck}
          color={netProfit >= 0 ? 'emerald' : 'rose'}
          trend={{ value: '8.5%', isPositive: netProfit >= 0 }}
        />
      </div>

      {/* Second Row KPIs: Accounts breakdown + Unpaid invoices */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {language === 'fr' ? 'Factures Impayées Clients' : 'Unpaid Customer Invoices'}
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {formatCurrency(totalUnpaidInvoices, currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {invoices.filter(i => i.status === 'partially_paid' || i.status === 'sent').length} factures avec solde dû
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {language === 'fr' ? 'Avances & Acomptes en cours' : 'Advances to Recover'}
          </div>
          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
            {formatCurrency(totalAdvancesPending, currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            À régulariser lors des livraisons
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {language === 'fr' ? 'Effectif Actif & Salaires' : 'Active Staff & Salaries'}
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-2">
            {employees.length} collaborateurs
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Conformité CNPS & IRPP garantie
          </p>
        </div>
      </div>

      {/* Accounts Balances Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          {language === 'fr' ? 'Soldes instantanés par Caisse & Compte' : 'Instant Balances by Account'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {accounts.map(acc => (
            <div
              key={acc.id}
              className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {acc.name}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  {acc.type === 'momo' ? 'MTN MoMo' : acc.type === 'orange_money' ? 'Orange Money' : acc.type === 'cash' ? 'Espèces' : 'Banque'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(acc.balance, currency)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts & Alerts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Financial Flow Chart & Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visual Cash Flow Comparison */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'fr' ? 'Rapport Entrées vs Sorties' : 'Inflows vs Outflows'}
                </h3>
                <p className="text-xs text-slate-400">
                  Comparatif global de performance
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Entrées
                </span>
                <span className="flex items-center gap-1.5 text-rose-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  Sorties
                </span>
              </div>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600 dark:text-slate-300">Total Entrées ({formatCurrency(totalIncome, currency)})</span>
                  <span className="text-emerald-600 font-bold">
                    {totalIncome + totalExpense > 0 ? Math.round((totalIncome / (totalIncome + totalExpense)) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${totalIncome + totalExpense > 0 ? Math.round((totalIncome / (totalIncome + totalExpense)) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600 dark:text-slate-300">Total Sorties ({formatCurrency(totalExpense, currency)})</span>
                  <span className="text-rose-600 font-bold">
                    {totalIncome + totalExpense > 0 ? Math.round((totalExpense / (totalIncome + totalExpense)) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-orange-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${totalIncome + totalExpense > 0 ? Math.round((totalExpense / (totalIncome + totalExpense)) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Top Expenses breakdown */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                {language === 'fr' ? 'Principaux postes de dépenses' : 'Major Expense Posts'}
              </h4>
              <div className="space-y-2.5">
                {sortedExpenses.length === 0 ? (
                  <div className="text-xs text-slate-400 italic py-2">
                    {language === 'fr' ? 'Aucune dépense enregistrée. Comptes neufs à 0 FCFA.' : 'No expenses recorded yet. Fresh zero balance.'}
                  </div>
                ) : (
                  sortedExpenses.slice(0, 4).map(([cat, amt]) => (
                    <div key={cat} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">{cat}</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(amt, currency)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Operations Preview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'fr' ? 'Dernières Opérations Enregistrées' : 'Recent Cash Movements'}
              </h3>
              <button
                onClick={() => setActiveModule('finances')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
              >
                Voir tout le journal →
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                  <Wallet className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto opacity-60" />
                  <p className="font-bold text-slate-600 dark:text-slate-300">
                    {language === 'fr' ? 'Aucune opération enregistrée pour le moment' : 'No recorded transactions yet'}
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    {language === 'fr'
                      ? 'Votre entreprise démarre avec des comptes à zéro. Enregistrez votre premier flux de caisse ou Mobile Money.'
                      : 'Your company starts with fresh zero accounts. Record your first cash movement.'}
                  </p>
                  <button
                    onClick={() => setActiveModule('finances')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors mt-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{language === 'fr' ? 'Saisir une première opération' : 'New cash movement'}</span>
                  </button>
                </div>
              ) : (
                transactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl ${
                          tx.type === 'income'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                        }`}
                      >
                        {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{tx.description}</div>
                        <div className="text-[11px] text-slate-400">
                          {formatDate(tx.date, language)} • {tx.partyName}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-black ${
                          tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.paidAmount, currency)}
                      </div>
                      <Badge variant={tx.status === 'paid' ? 'success' : 'warning'}>
                        {tx.status === 'paid' ? 'Payé' : 'Acompte'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Important Alerts & Reminders */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                {language === 'fr' ? 'Alertes & Vigilances' : 'Key Alerts'}
              </h3>
              <Badge variant="warning">{notifications.length}</Badge>
            </div>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 text-center text-xs text-slate-400">
                  {language === 'fr' ? 'Toutes les alertes sont au vert. Aucune anomalie détectée.' : 'All clear. No alerts detected.'}
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1"
                  >
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{n.title}</div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="pt-1 flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">{formatDate(n.date, language)}</span>
                      <button
                        onClick={() => n.linkModule && setActiveModule(n.linkModule)}
                        className="font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                      >
                        Traiter →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cameroonian Compliance Quick Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                Conformité Légale & Fiscale
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xs space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span>TVA Légale :</span>
                <span className="font-bold text-white">19,25%</span>
              </div>
              <div className="flex justify-between">
                <span>Cotisation CNPS Salariale :</span>
                <span className="font-bold text-white">4,2% (plaf. 750k)</span>
              </div>
              <div className="flex justify-between">
                <span>Retenue CAC :</span>
                <span className="font-bold text-white">10% de l’IRPP</span>
              </div>
              <div className="flex justify-between">
                <span>Timbre fiscal décharge :</span>
                <span className="font-bold text-white">1 000 FCFA</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 italic pt-2 border-t border-slate-700">
              * Barèmes configurables dans les Paramètres selon votre statut d’imposition.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
