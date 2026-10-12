import React, { useState } from 'react';
import {
  Coins,
  FileText,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  Plus,
  Play,
  Building,
  CreditCard,
  Phone,
  Eye,
  Sliders
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate, calculateCameroonPayroll } from '../../utils/formatters';
import { exportToCSV, triggerPrint } from '../../utils/exportTools';
import { PayrollRecord } from '../../types';

export const PayrollModule: React.FC = () => {
  const {
    employees,
    payrolls,
    accounts,
    addPayrollRecord,
    markPayrollPaid,
    currentTenant,
    currency,
    language
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null);

  // Pay Modal
  const [payModalRecordId, setPayModalRecordId] = useState<string | null>(null);
  const [payAccountId, setPayAccountId] = useState(accounts[1]?.id || accounts[0]?.id || '');

  // Filter payrolls by month
  const monthlyPayrolls = payrolls.filter(p => p.month === selectedMonth);

  // Totals
  const totalGross = monthlyPayrolls.reduce((sum, p) => sum + p.grossSalary, 0);
  const totalNet = monthlyPayrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const totalDeductions = monthlyPayrolls.reduce((sum, p) => sum + p.totalDeductions, 0);
  const totalCnps = monthlyPayrolls.reduce((sum, p) => sum + p.cnpsEmployee, 0);
  const totalIrpp = monthlyPayrolls.reduce((sum, p) => sum + p.irppTax + p.cacTax, 0);

  // Batch generate payroll for all active employees for current month
  const handleBatchGenerate = () => {
    employees.forEach(emp => {
      // check if already generated
      const exists = payrolls.some(p => p.employeeId === emp.id && p.month === selectedMonth);
      if (!exists) {
        const breakdown = calculateCameroonPayroll(
          emp.baseSalary,
          emp.transportAllowance,
          emp.housingAllowance,
          emp.performanceBonus,
          0 // advances
        );

        addPayrollRecord({
          employeeId: emp.id,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          matricule: emp.matricule,
          position: emp.position,
          department: emp.department,
          month: selectedMonth,
          baseSalary: emp.baseSalary,
          transportAllowance: emp.transportAllowance,
          housingAllowance: emp.housingAllowance,
          overtimeAmount: 0,
          bonusAmount: emp.performanceBonus,
          grossSalary: breakdown.grossSalary,
          cnpsEmployee: breakdown.cnpsEmployee,
          irppTax: breakdown.irppTax,
          cacTax: breakdown.cacTax,
          cfcTax: breakdown.cfcTax,
          ravTax: breakdown.ravTax,
          salaryAdvanceDeduction: 0,
          totalDeductions: breakdown.totalDeductions,
          netSalary: breakdown.netSalary,
          status: 'pending',
          paymentMethod: emp.paymentMode === 'bank' ? 'bank_transfer' : emp.paymentMode,
        });
      }
    });
  };

  const handleConfirmPayment = () => {
    if (!payModalRecordId) return;
    markPayrollPaid(payModalRecordId, payAccountId);
    setPayModalRecordId(null);
  };

  // Export Bank & MoMo Batch transfer file
  const handleExportTransferOrders = () => {
    const rows = monthlyPayrolls.map(p => {
      const emp = employees.find(e => e.id === p.employeeId);
      return {
        Mois: p.month,
        Matricule: p.matricule,
        Nom_Beneficiaire: p.employeeName,
        Mode_Virement: p.paymentMethod,
        RIB_ou_Telephone: emp?.paymentDetails || emp?.phone,
        Montant_Net_FCFA: p.netSalary,
        Banque_Debiteur: 'Afriland First Bank / MTN MoMo',
        Motif: `Salaire ${p.month} ${p.matricule}`,
      };
    });
    exportToCSV(`ordre_virement_salaires_${selectedMonth}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Coins className="w-6 h-6 text-emerald-600" />
            {language === 'fr' ? 'Paie & Traitements (Législation Camerounaise)' : 'Payroll & Cameroon Tax Engine'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Calculs automatiques CNPS (4.2%), IRPP, CAC (10%), CFC (1%), RAV et synchronisation instantanée du journal de trésorerie
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
          />

          <button
            onClick={handleBatchGenerate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
            title="Calculer les bulletins du mois pour tout l'effectif"
          >
            <Play className="w-4 h-4" />
            <span>Générer la Paie ({selectedMonth})</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Masse Salariale Brute</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalGross, currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Base + Logement + Transport</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Net Total à Payer</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalNet, currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Virements employés</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Cotisations CNPS Salariales</span>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {formatCurrency(totalCnps, currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">À reverser à la CNPS</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Total Impôts IRPP + CAC</span>
          <div className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {formatCurrency(totalIrpp, currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">À déclarer au fisc (DGI)</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Livre de Paie de {selectedMonth} • {monthlyPayrolls.length} bulletin(s) généré(s)
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportTransferOrders}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Ordre de Virement Bancaire & MoMo (CSV)</span>
          </button>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold">
              <tr>
                <th className="px-4 py-3.5">Matricule & Agent</th>
                <th className="px-4 py-3.5">Poste</th>
                <th className="px-4 py-3.5 text-right">Salaire Brut</th>
                <th className="px-4 py-3.5 text-right">CNPS (4.2%)</th>
                <th className="px-4 py-3.5 text-right">IRPP + CAC</th>
                <th className="px-4 py-3.5 text-right">CFC + RAV</th>
                <th className="px-4 py-3.5 text-right">Net à Payer</th>
                <th className="px-4 py-3.5 text-center">Statut</th>
                <th className="px-4 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {monthlyPayrolls.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    Aucun bulletin de paie généré pour le mois de {selectedMonth}. Cliquez sur "Générer la Paie".
                  </td>
                </tr>
              ) : (
                monthlyPayrolls.map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white">{pay.employeeName}</div>
                      <div className="text-[11px] font-mono text-slate-400">{pay.matricule}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{pay.position}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">{formatCurrency(pay.grossSalary, currency)}</td>
                    <td className="px-4 py-3 text-right font-mono text-blue-600">{formatCurrency(pay.cnpsEmployee, currency)}</td>
                    <td className="px-4 py-3 text-right font-mono text-purple-600">{formatCurrency(pay.irppTax + pay.cacTax, currency)}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-500">{formatCurrency(pay.cfcTax + pay.ravTax, currency)}</td>
                    <td className="px-4 py-3 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(pay.netSalary, currency)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={pay.status === 'paid' ? 'success' : 'warning'}>
                        {pay.status === 'paid' ? 'Payé' : 'À payer'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedPayroll(pay)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Voir le Bulletin Officiel"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {pay.status === 'pending' && (
                          <button
                            onClick={() => {
                              setPayModalRecordId(pay.id);
                            }}
                            className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold shadow-xs hover:bg-emerald-700"
                          >
                            Régler Salaire
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Confirm Salary Payment & Account Debit */}
      <Modal
        isOpen={!!payModalRecordId}
        onClose={() => setPayModalRecordId(null)}
        title="Règlement du Salaire & Sortie de Caisse Automatique"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Ce paiement va automatiquement débiter le compte choisi et créer une opération de sortie dans le <strong>Journal Financier</strong> avec la catégorie "Salaires & Rémunérations".
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Compte / Caisse à débiter *
            </label>
            <select
              value={payAccountId}
              onChange={e => setPayAccountId(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} (Solde actuel : {formatCurrency(a.balance, currency)})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setPayModalRecordId(null)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirmPayment}
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              Valider le paiement du salaire
            </button>
          </div>
        </div>
      </Modal>

      {/* Official Payslip Printable Modal */}
      {selectedPayroll && (
        <Modal
          isOpen={!!selectedPayroll}
          onClose={() => setSelectedPayroll(null)}
          title={`Bulletin de Paie Officiel - ${selectedPayroll.employeeName}`}
          maxWidth="3xl"
        >
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={triggerPrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white dark:bg-emerald-600 rounded-xl text-xs font-bold"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer le Bulletin</span>
              </button>
            </div>

            {/* Official Payslip Sheet */}
            <div className="p-8 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white space-y-6 text-xs font-mono">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <div className="text-base font-black font-sans">{currentTenant.name}</div>
                  <div className="text-[11px] text-slate-500">
                    NIU: {currentTenant.taxId} • RCCM: {currentTenant.tradeRegister}<br />
                    {currentTenant.address}, {currentTenant.city} - Cameroun
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold uppercase text-emerald-600 font-sans">BULLETIN DE PAIE</div>
                  <div className="text-xs font-bold">Période : {selectedPayroll.month}</div>
                  <div className="text-[10px] text-slate-400">Paiement : {selectedPayroll.paymentMethod}</div>
                </div>
              </div>

              {/* Employee Box */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-sans">
                <div>
                  <div><strong>Salarié :</strong> {selectedPayroll.employeeName}</div>
                  <div><strong>Matricule :</strong> {selectedPayroll.matricule}</div>
                  <div><strong>Poste :</strong> {selectedPayroll.position}</div>
                </div>
                <div>
                  <div><strong>Département :</strong> {selectedPayroll.department}</div>
                  <div><strong>Statut :</strong> Conforme Code du Travail CMR</div>
                </div>
              </div>

              {/* Breakdown Table */}
              <table className="w-full text-xs">
                <thead className="border-b-2 border-slate-800 dark:border-slate-600 text-slate-600 dark:text-slate-300 uppercase font-bold font-sans">
                  <tr>
                    <th className="py-2 text-left">Rubrique</th>
                    <th className="py-2 text-right">Base / Taux</th>
                    <th className="py-2 text-right">Gains (+)</th>
                    <th className="py-2 text-right">Retenues (-)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-1.5">Salaire de Base Catégoriel</td>
                    <td className="py-1.5 text-right font-sans">100%</td>
                    <td className="py-1.5 text-right">{formatCurrency(selectedPayroll.baseSalary, currency)}</td>
                    <td className="py-1.5 text-right">-</td>
                  </tr>
                  <tr>
                    <td className="py-1.5">Indemnité de Transport Exonérée</td>
                    <td className="py-1.5 text-right font-sans">Forfait</td>
                    <td className="py-1.5 text-right">{formatCurrency(selectedPayroll.transportAllowance, currency)}</td>
                    <td className="py-1.5 text-right">-</td>
                  </tr>
                  <tr>
                    <td className="py-1.5">Indemnité de Logement</td>
                    <td className="py-1.5 text-right font-sans">Avantage</td>
                    <td className="py-1.5 text-right">{formatCurrency(selectedPayroll.housingAllowance, currency)}</td>
                    <td className="py-1.5 text-right">-</td>
                  </tr>
                  {selectedPayroll.bonusAmount > 0 && (
                    <tr>
                      <td className="py-1.5">Prime de Rendement / Performance</td>
                      <td className="py-1.5 text-right font-sans">Bonus</td>
                      <td className="py-1.5 text-right">{formatCurrency(selectedPayroll.bonusAmount, currency)}</td>
                      <td className="py-1.5 text-right">-</td>
                    </tr>
                  )}
                  {/* Deductions */}
                  <tr className="text-blue-600">
                    <td className="py-1.5">Cotisation CNPS Régime Général (Plaf. 750k)</td>
                    <td className="py-1.5 text-right font-sans">4,20%</td>
                    <td className="py-1.5 text-right">-</td>
                    <td className="py-1.5 text-right">{formatCurrency(selectedPayroll.cnpsEmployee, currency)}</td>
                  </tr>
                  <tr className="text-purple-600">
                    <td className="py-1.5">Impôt sur le Revenu IRPP (DGI Cameroun)</td>
                    <td className="py-1.5 text-right font-sans">Barème</td>
                    <td className="py-1.5 text-right">-</td>
                    <td className="py-1.5 text-right">{formatCurrency(selectedPayroll.irppTax, currency)}</td>
                  </tr>
                  <tr className="text-purple-600">
                    <td className="py-1.5">Centimes Additionnels Communaux (CAC 10%)</td>
                    <td className="py-1.5 text-right font-sans">10% IRPP</td>
                    <td className="py-1.5 text-right">-</td>
                    <td className="py-1.5 text-right">{formatCurrency(selectedPayroll.cacTax, currency)}</td>
                  </tr>
                  <tr className="text-slate-500">
                    <td className="py-1.5">Crédit Foncier du Cameroun (CFC)</td>
                    <td className="py-1.5 text-right font-sans">1,00%</td>
                    <td className="py-1.5 text-right">-</td>
                    <td className="py-1.5 text-right">{formatCurrency(selectedPayroll.cfcTax, currency)}</td>
                  </tr>
                  <tr className="text-slate-500">
                    <td className="py-1.5">Redevance Audiovisuelle (RAV CRTV)</td>
                    <td className="py-1.5 text-right font-sans">Forfait</td>
                    <td className="py-1.5 text-right">-</td>
                    <td className="py-1.5 text-right">{formatCurrency(selectedPayroll.ravTax, currency)}</td>
                  </tr>
                  {selectedPayroll.salaryAdvanceDeduction > 0 && (
                    <tr className="text-amber-600 font-bold">
                      <td className="py-1.5">Remboursement Acompte sur Salaire</td>
                      <td className="py-1.5 text-right font-sans">Avance</td>
                      <td className="py-1.5 text-right">-</td>
                      <td className="py-1.5 text-right">{formatCurrency(selectedPayroll.salaryAdvanceDeduction, currency)}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Summary Bottom */}
              <div className="pt-4 border-t-2 border-slate-900 dark:border-slate-600 flex justify-between items-center text-xs font-sans">
                <div>
                  <div>Salaire Brut : <strong>{formatCurrency(selectedPayroll.grossSalary, currency)}</strong></div>
                  <div>Total Déductions : <strong className="text-rose-600">{formatCurrency(selectedPayroll.totalDeductions, currency)}</strong></div>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 text-right">
                  <div className="text-[10px] text-emerald-700 font-bold uppercase">NET À PAYER AU SALARIÉ</div>
                  <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                    {formatCurrency(selectedPayroll.netSalary, currency)}
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 border-t border-slate-200 flex justify-between font-sans text-xs text-slate-400">
                <div>Signature du Salarié</div>
                <div>Cachet & Signature de l'Employeur</div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
