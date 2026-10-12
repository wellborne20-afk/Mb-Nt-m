import React, { useState } from 'react';
import {
  ReceiptText,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  FileCheck,
  Send,
  MessageCircle,
  Clock,
  ArrowRightLeft,
  CheckCircle2,
  Trash2,
  QrCode,
  Building,
  Eye,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV, triggerPrint } from '../../utils/exportTools';
import { Invoice, InvoiceItem, InvoiceType, InvoiceStatus } from '../../types';

export const InvoicingModule: React.FC = () => {
  const {
    invoices,
    customers,
    currentTenant,
    addInvoice,
    updateInvoiceStatus,
    convertInvoice,
    archiveInvoice,
    currency,
    language
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | InvoiceType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');

  // Preview Invoice State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // New Invoice Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newType, setNewType] = useState<InvoiceType>('invoice');
  const [newCustomerId, setNewCustomerId] = useState(customers[0]?.id || '');
  const [newSubject, setNewSubject] = useState('');
  const [newDueDate, setNewDueDate] = useState('2026-10-31');
  const [newPaymentTerms, setNewPaymentTerms] = useState('Paiement à réception par virement bancaire ou Mobile Money (MTN/Orange).');
  const [newApplyVat, setNewApplyVat] = useState(true);

  // Dynamic Items
  const [items, setItems] = useState<Omit<InvoiceItem, 'id' | 'totalPrice'>[]>([
    { description: 'Prestation d\'assistance technique et maintenance', quantity: 1, unitPrice: 350000, discountPercent: 0 },
  ]);

  const [initialDeposit, setInitialDeposit] = useState<number>(0);

  // Calculated numbers for new invoice
  const subtotal = items.reduce((sum, item) => {
    const raw = item.quantity * item.unitPrice;
    const discount = raw * (item.discountPercent / 100);
    return sum + (raw - discount);
  }, 0);

  const taxRate = newApplyVat ? currentTenant.vatRate : 0;
  const taxAmount = Math.round(subtotal * (taxRate / 100));
  const totalAmount = subtotal + taxAmount;
  const amountDue = Math.max(0, totalAmount - initialDeposit);

  const addItemRow = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, discountPercent: 0 }]);
  };

  const removeItemRow = (idx: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
    }
  };

  const updateItemRow = (idx: number, field: string, value: any) => {
    setItems(items.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || items.length === 0) return;

    const cust = customers.find(c => c.id === newCustomerId) || customers[0];
    const prefix = newType === 'invoice' ? 'FAC' : newType === 'estimate' ? 'DEV' : newType === 'proforma' ? 'PRO' : 'REC';
    const num = `${prefix}-2026-${Math.floor(100 + Math.random() * 900)}`;

    const formattedItems: InvoiceItem[] = items.map((it, idx) => {
      const raw = it.quantity * it.unitPrice;
      const discount = raw * (it.discountPercent / 100);
      return {
        id: `item-${Date.now()}-${idx}`,
        ...it,
        totalPrice: raw - discount,
      };
    });

    const isPaid = amountDue === 0;
    const isPartial = initialDeposit > 0 && amountDue > 0;
    const invoiceStatus: InvoiceStatus = isPaid ? 'paid' : isPartial ? 'partially_paid' : 'sent';

    addInvoice({
      number: num,
      type: newType,
      customerId: cust.id,
      customerName: cust.companyName || cust.name,
      customerPhone: cust.phone,
      customerEmail: cust.email,
      customerAddress: `${cust.address}, ${cust.city}`,
      customerTaxId: cust.taxId,
      date: new Date().toISOString().split('T')[0],
      dueDate: newDueDate,
      subject: newSubject,
      items: formattedItems,
      subtotal,
      discountTotal: 0,
      taxRate,
      taxAmount,
      totalAmount,
      amountPaid: initialDeposit,
      amountDue,
      status: invoiceStatus,
      paymentTerms: newPaymentTerms,
      notes: `Établi par ${currentTenant.name} - Cameroun.`,
      qrCodeUrl: `https://impots.cm/verifier?id=${num}&contribuable=${currentTenant.taxId}`,
    });

    setIsNewModalOpen(false);
    setNewSubject('');
    setInitialDeposit(0);
  };

  // WhatsApp reminder generator
  const sendWhatsAppReminder = (inv: Invoice) => {
    const text = encodeURIComponent(
      `Bonjour ${inv.customerName},\n\nSauf erreur de notre part, la facture ${inv.number} d'un montant de ${formatCurrency(inv.totalAmount, currency)} (Reste dû : ${formatCurrency(inv.amountDue, currency)}) arrive à échéance le ${formatDate(inv.dueDate, language)}.\n\nMerci de procéder au règlement par virement ou Mobile Money (${currentTenant.phone}).\n\nBien cordialement,\n${currentTenant.name}`
    );
    window.open(`https://wa.me/${inv.customerPhone?.replace(/\D/g, '')}?text=${text}`, '_blank');
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || inv.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ReceiptText className="w-6 h-6 text-emerald-600" />
            {language === 'fr' ? 'Facturation, Devis & Reçus' : 'Invoices, Quotes & Receipts'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Génération conforme OHADA / DGI Cameroun avec TVA 19.25%, QR Code et conversion 1-clic
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un Document</span>
        </button>
      </div>

      {/* Filter and Actions Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher N° de pièce, client, objet..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">Tous les types</option>
            <option value="invoice">Factures</option>
            <option value="estimate">Devis</option>
            <option value="proforma">Proformas</option>
            <option value="receipt">Reçus</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="paid">Payé / Soldé</option>
            <option value="partially_paid">Acompte versé</option>
            <option value="sent">Envoyé / En attente</option>
            <option value="overdue">En retard</option>
          </select>

          <button
            onClick={() => {
              const rows = filteredInvoices.map(i => ({
                Numero: i.number,
                Type: i.type,
                Client: i.customerName,
                Date: i.date,
                Echeance: i.dueDate,
                Total_TTC: i.totalAmount,
                Paye: i.amountPaid,
                Reste_Du: i.amountDue,
                Statut: i.status,
              }));
              exportToCSV(`factures_${new Date().toISOString().split('T')[0]}`, rows);
            }}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-4 py-3.5">Numéro & Type</th>
                <th className="px-4 py-3.5">Client & Contact</th>
                <th className="px-4 py-3.5">Objet de la Pièce</th>
                <th className="px-4 py-3.5">Date Émission</th>
                <th className="px-4 py-3.5">Échéance</th>
                <th className="px-4 py-3.5 text-right">Total TTC</th>
                <th className="px-4 py-3.5 text-right">Reste Dû</th>
                <th className="px-4 py-3.5 text-center">Statut</th>
                <th className="px-4 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {inv.number}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {inv.type === 'invoice' ? 'Facture' : inv.type === 'estimate' ? 'Devis' : inv.type === 'proforma' ? 'Proforma' : 'Reçu'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 dark:text-white">{inv.customerName}</div>
                    <div className="text-[11px] text-slate-400">{inv.customerPhone || inv.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="truncate font-medium text-slate-700 dark:text-slate-300" title={inv.subject}>
                      {inv.subject}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {formatDate(inv.date, language)}
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {formatDate(inv.dueDate, language)}
                  </td>
                  <td className="px-4 py-3 text-right font-black whitespace-nowrap text-slate-900 dark:text-white">
                    {formatCurrency(inv.totalAmount, currency)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {inv.amountDue > 0 ? (
                      <span className="text-amber-600 font-bold">
                        {formatCurrency(inv.amountDue, currency)}
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold">Soldé</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <Badge
                      variant={
                        inv.status === 'paid' ? 'success' :
                        inv.status === 'partially_paid' ? 'warning' :
                        inv.status === 'overdue' ? 'danger' : 'info'
                      }
                    >
                      {inv.status === 'paid' ? 'Payé' :
                       inv.status === 'partially_paid' ? 'Acompte' :
                       inv.status === 'sent' ? 'Envoyé' : 'En retard'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* View & Print PDF */}
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Visualiser et Imprimer la Facture"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* WhatsApp Reminder if pending */}
                      {inv.amountDue > 0 && inv.customerPhone && (
                        <button
                          onClick={() => sendWhatsAppReminder(inv)}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          title="Relance WhatsApp immédiate"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      )}

                      {/* 1-Click Conversion: Estimate -> Invoice */}
                      {inv.type === 'estimate' && (
                        <button
                          onClick={() => convertInvoice(inv.id, 'invoice')}
                          className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold rounded-md text-[10px] hover:bg-emerald-200 transition-colors"
                          title="Convertir ce devis en facture finale"
                        >
                          → Facture
                        </button>
                      )}

                      {/* 1-Click Conversion: Invoice -> Receipt */}
                      {inv.type === 'invoice' && inv.amountDue === 0 && (
                        <button
                          onClick={() => convertInvoice(inv.id, 'receipt')}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold rounded-md text-[10px] hover:bg-blue-200 transition-colors"
                          title="Éditer le reçu libératoire"
                        >
                          → Reçu
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create New Document */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Créer une Nouvelle Pièce Comptable"
        maxWidth="3xl"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Type de document *
              </label>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as InvoiceType)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
              >
                <option value="invoice">Facture Définitive</option>
                <option value="estimate">Devis Estimatif</option>
                <option value="proforma">Facture Proforma</option>
                <option value="receipt">Reçu de Caisse</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Client Destinataire *
              </label>
              <select
                value={newCustomerId}
                onChange={e => setNewCustomerId(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.companyName || c.name} ({c.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date d'échéance de paiement *
              </label>
              <input
                type="date"
                value={newDueDate}
                onChange={e => setNewDueDate(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Objet / Description Générale de la Prestation *
            </label>
            <input
              type="text"
              placeholder="Ex: Fourniture et installation de solutions logicielles..."
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
              required
            />
          </div>

          {/* Line Items List */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                Articles & Prestations
              </span>
              <button
                type="button"
                onClick={addItemRow}
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
              </button>
            </div>

            {items.map((it, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center text-xs">
                <div className="col-span-5">
                  <input
                    type="text"
                    placeholder="Désignation de l'article"
                    value={it.description}
                    onChange={e => updateItemRow(idx, 'description', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Qté"
                    value={it.quantity}
                    onChange={e => updateItemRow(idx, 'quantity', parseFloat(e.target.value) || 1)}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    required
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    min="0"
                    placeholder="Prix Unit. FCFA"
                    value={it.unitPrice || ''}
                    onChange={e => updateItemRow(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    required
                  />
                </div>
                <div className="col-span-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Rem %"
                    value={it.discountPercent || ''}
                    onChange={e => updateItemRow(idx, 'discountPercent', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
                <div className="col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => removeItemRow(idx)}
                    className="p-1 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Summary */}
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Sous-total Hors Taxes :</span>
              <span className="font-bold">{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newApplyVat}
                  onChange={e => setNewApplyVat(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                  Appliquer TVA Cameroun (19,25%)
                </span>
              </label>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {formatCurrency(taxAmount, currency)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
              <span>Total Général TTC :</span>
              <span className="text-emerald-600">{formatCurrency(totalAmount, currency)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-600 font-semibold">Acompte déjà encaissé (FCFA) :</span>
              <input
                type="number"
                min="0"
                max={totalAmount}
                value={initialDeposit || ''}
                onChange={e => setInitialDeposit(parseFloat(e.target.value) || 0)}
                className="w-36 p-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-right font-bold text-xs"
              />
            </div>
            <div className="flex justify-between text-xs font-bold text-amber-600 pt-1">
              <span>Reste à Payer par le Client :</span>
              <span>{formatCurrency(amountDue, currency)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              Générer la Pièce
            </button>
          </div>
        </form>
      </Modal>

      {/* Invoice Detailed Preview & Printable Template */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Aperçu Facture Conforme : ${selectedInvoice.number}`}
          maxWidth="4xl"
        >
          <div className="space-y-6 print:p-0">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Badge variant={selectedInvoice.status === 'paid' ? 'success' : 'warning'}>
                  {selectedInvoice.status === 'paid' ? 'Soldée' : 'Partiellement Réglée'}
                </Badge>
                <span className="text-xs text-slate-400">
                  Émise le {formatDate(selectedInvoice.date, language)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedInvoice.amountDue > 0 && selectedInvoice.customerPhone && (
                  <button
                    onClick={() => sendWhatsAppReminder(selectedInvoice)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Relancer WhatsApp
                  </button>
                )}
                <button
                  onClick={triggerPrint}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white dark:bg-emerald-600 rounded-xl text-xs font-bold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimer / PDF
                </button>
              </div>
            </div>

            {/* Document Sheet */}
            <div className="p-8 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white space-y-8 font-sans">
              {/* Header: Company & Invoice Info */}
              <div className="flex justify-between items-start gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
                <div>
                  <div className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {currentTenant.name}
                  </div>
                  <div className="text-xs text-slate-500 space-y-0.5 mt-1">
                    <div>{currentTenant.legalForm} • NIU : {currentTenant.taxId}</div>
                    <div>RCCM : {currentTenant.tradeRegister}</div>
                    <div>{currentTenant.address}, {currentTenant.city} ({currentTenant.country})</div>
                    <div>Tél : {currentTenant.phone} • Email : {currentTenant.email}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black uppercase text-emerald-600">
                    {selectedInvoice.type === 'invoice' ? 'FACTURE' : selectedInvoice.type === 'estimate' ? 'DEVIS' : selectedInvoice.type === 'receipt' ? 'REÇU' : 'PROFORMA'}
                  </div>
                  <div className="text-sm font-mono font-bold mt-1">{selectedInvoice.number}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Date : {formatDate(selectedInvoice.date, language)}<br />
                    Échéance : {formatDate(selectedInvoice.dueDate, language)}
                  </div>
                </div>
              </div>

              {/* Client Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 max-w-sm ml-auto text-xs space-y-1">
                <div className="font-bold text-slate-400 uppercase text-[10px]">Facturé à :</div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  {selectedInvoice.customerName}
                </div>
                {selectedInvoice.customerTaxId && (
                  <div className="text-slate-500">NIU : {selectedInvoice.customerTaxId}</div>
                )}
                {selectedInvoice.customerAddress && (
                  <div className="text-slate-500">{selectedInvoice.customerAddress}</div>
                )}
                {selectedInvoice.customerPhone && (
                  <div className="text-slate-500">Tél : {selectedInvoice.customerPhone}</div>
                )}
              </div>

              {/* Subject */}
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase">Objet de la facture :</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedInvoice.subject}
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs">
                <thead className="border-b-2 border-slate-900 dark:border-slate-700 uppercase font-bold text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="py-2.5 text-left">Désignation</th>
                    <th className="py-2.5 text-center">Qté</th>
                    <th className="py-2.5 text-right">Prix Unitaire</th>
                    <th className="py-2.5 text-right">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedInvoice.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-3 font-medium">{it.description}</td>
                      <td className="py-3 text-center font-mono">{it.quantity}</td>
                      <td className="py-3 text-right font-mono">{formatCurrency(it.unitPrice, currency)}</td>
                      <td className="py-3 text-right font-mono font-bold">{formatCurrency(it.totalPrice, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals & QR Code */}
              <div className="flex justify-between items-end pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 border border-slate-300 dark:border-slate-700 rounded-xl">
                    <QrCode className="w-14 h-14 text-slate-800 dark:text-slate-200" />
                  </div>
                  <div className="text-[10px] text-slate-400 max-w-[200px]">
                    Code QR d'intégrité fiscale camerounaise certifié conforme aux règles OHADA.
                  </div>
                </div>

                <div className="w-64 space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-slate-500">
                    <span>Sous-Total HT :</span>
                    <span className="font-mono">{formatCurrency(selectedInvoice.subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>TVA (19,25%) :</span>
                    <span className="font-mono">{formatCurrency(selectedInvoice.taxAmount, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Total TTC :</span>
                    <span className="text-emerald-600 font-mono">{formatCurrency(selectedInvoice.totalAmount, currency)}</span>
                  </div>
                  {selectedInvoice.amountPaid > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Montant Versé :</span>
                      <span className="font-mono">{formatCurrency(selectedInvoice.amountPaid, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-amber-600 font-black pt-1">
                    <span>Reste à Payer :</span>
                    <span className="font-mono">{formatCurrency(selectedInvoice.amountDue, currency)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Terms & Stamp */}
              <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end text-[11px] text-slate-400">
                <div>
                  <div className="font-bold text-slate-700 dark:text-slate-300">Conditions de règlement :</div>
                  <div>{selectedInvoice.paymentTerms}</div>
                  <div className="mt-1">Paiement Mobile Money direct : MTN MoMo ou Orange Money au {currentTenant.phone}</div>
                </div>
                <div className="text-center p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl w-44">
                  <div className="text-[9px] uppercase font-bold text-slate-400">Cachet & Signature</div>
                  <div className="font-serif italic text-emerald-700 font-bold mt-2">
                    {currentTenant.name}
                  </div>
                  <div className="text-[8px] text-slate-400">Direction Générale</div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
