import React, { useState } from 'react';
import {
  Handshake,
  Plus,
  Search,
  Filter,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Calendar,
  Building,
  DollarSign,
  TrendingUp,
  Download,
  CheckCircle2,
  XCircle,
  Tag,
  Kanban,
  ListFilter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportTools';
import { Customer, CrmDeal } from '../../types';

export const CrmModule: React.FC = () => {
  const {
    customers,
    crmDeals,
    addCustomer,
    updateCustomer,
    archiveCustomer,
    addDeal,
    updateDealStage,
    currentTenant,
    currency,
    language
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pipeline' | 'contacts'>('pipeline');
  const [searchTerm, setSearchTerm] = useState('');

  // New Deal Modal
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [dealTitle, setDealTitle] = useState('');
  const [dealCustomerId, setDealCustomerId] = useState(customers[0]?.id || '');
  const [dealValue, setDealValue] = useState<number>(1500000);
  const [dealStage, setDealStage] = useState<CrmDeal['stage']>('new');
  const [dealCloseDate, setDealCloseDate] = useState('2026-10-31');

  // New Customer Modal
  const [isCustModalOpen, setIsCustModalOpen] = useState(false);
  const [custName, setCustName] = useState('');
  const [custCompany, setCustCompany] = useState('');
  const [custPhone, setCustPhone] = useState('+237 6');
  const [custEmail, setCustEmail] = useState('');
  const [custCity, setCustCity] = useState('Douala');
  const [custSector, setCustSector] = useState('BTP & Construction');
  const [custStatus, setCustStatus] = useState<Customer['status']>('prospect');

  // Stages for Kanban
  const stages: { id: CrmDeal['stage']; label: string; color: string }[] = [
    { id: 'new', label: '1. Nouveau Contact', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200' },
    { id: 'qualified', label: '2. Qualifié / Intéressé', color: 'bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300' },
    { id: 'proposal', label: '3. Proposition / Devis', color: 'bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300' },
    { id: 'negotiation', label: '4. Négociation Active', color: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' },
    { id: 'won', label: '5. Gagné (Signé)', color: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' },
  ];

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealTitle || dealValue <= 0) return;
    const cust = customers.find(c => c.id === dealCustomerId) || customers[0];

    addDeal({
      title: dealTitle,
      customerId: cust.id,
      customerName: cust.companyName || cust.name,
      value: dealValue,
      stage: dealStage,
      expectedCloseDate: dealCloseDate,
      assignedTo: 'Stéphanie Eboué',
      notes: 'Nouvelle opportunité créée dans le pipeline Mbǎ\'Ntām.',
    });

    setIsDealModalOpen(false);
    setDealTitle('');
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName) return;

    addCustomer({
      name: custName,
      companyName: custCompany || custName,
      type: custCompany ? 'company' : 'individual',
      email: custEmail,
      phone: custPhone,
      whatsapp: custPhone,
      city: custCity,
      country: 'Cameroun',
      address: `${custCity} Centre`,
      sector: custSector,
      source: 'Prospection Terrain',
      salesRep: 'Stéphanie Eboué',
      status: custStatus,
      totalPurchases: 0,
      lifetimeValue: 0,
      notes: 'Fiche créée dans le CRM.',
    });

    setIsCustModalOpen(false);
    setCustName('');
    setCustCompany('');
  };

  const totalPipelineValue = crmDeals
    .filter(d => d.stage !== 'lost')
    .reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Handshake className="w-6 h-6 text-emerald-600" />
            {language === 'fr' ? 'CRM, Pipeline Commercial & Fiches Clients' : 'CRM & Deals Pipeline'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pipeline des ventes par étapes, coordonnées directes WhatsApp/Appels et valeur client
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsCustModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Client</span>
          </button>
          <button
            onClick={() => setIsDealModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Opportunité</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'pipeline'
                ? 'bg-slate-900 text-white dark:bg-emerald-600'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            Vue Pipeline Kanban ({crmDeals.length} affaires)
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'contacts'
                ? 'bg-slate-900 text-white dark:bg-emerald-600'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            Répertoire Clients ({customers.length})
          </button>
        </div>

        <div className="text-xs font-bold text-slate-500">
          Valeur totale du pipeline : <span className="text-emerald-600 font-extrabold">{formatCurrency(totalPipelineValue, currency)}</span>
        </div>
      </div>

      {/* Kanban Tab */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 overflow-x-auto pb-4">
          {stages.map(st => {
            const dealsInStage = crmDeals.filter(d => d.stage === st.id);
            const stageTotal = dealsInStage.reduce((s, d) => s + d.value, 0);

            return (
              <div
                key={st.id}
                className="bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 flex flex-col min-w-[220px]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${st.color}`}>
                    {st.label}
                  </span>
                  <span className="text-xs font-extrabold text-slate-400">{dealsInStage.length}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-bold mb-3">
                  {formatCurrency(stageTotal, currency)}
                </div>

                <div className="space-y-2.5 flex-1">
                  {dealsInStage.map(deal => (
                    <div
                      key={deal.id}
                      className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-xs hover:shadow-md transition-shadow space-y-2"
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {deal.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {deal.customerName}
                      </div>
                      <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(deal.value, currency)}
                      </div>
                      <div className="text-[10px] text-slate-400 flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-700/60">
                        <span>Échéance : {formatDate(deal.expectedCloseDate, language)}</span>
                      </div>

                      {/* Move to next stage quick action */}
                      <div className="pt-2 flex items-center justify-between text-[10px]">
                        {st.id !== 'won' ? (
                          <button
                            onClick={() => {
                              const currentIndex = stages.findIndex(s => s.id === st.id);
                              if (currentIndex < stages.length - 1) {
                                updateDealStage(deal.id, stages[currentIndex + 1].id);
                              }
                            }}
                            className="text-emerald-600 font-bold hover:underline"
                          >
                            Étape suivante →
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-bold">✓ Gagné</span>
                        )}
                        {st.id !== 'won' && (
                          <button
                            onClick={() => updateDealStage(deal.id, 'lost', 'Prix ou concurrent')}
                            className="text-rose-500 hover:underline"
                          >
                            Perdu
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contacts Tab */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher client, ville, téléphone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
              />
            </div>

            <button
              onClick={() => {
                const rows = customers.map(c => ({
                  Nom: c.name,
                  Entreprise: c.companyName,
                  Ville: c.city,
                  Telephone: c.phone,
                  WhatsApp: c.whatsapp,
                  Email: c.email,
                  Statut: c.status,
                  Total_Achats: c.totalPurchases,
                }));
                exportToCSV(`clients_${new Date().toISOString().split('T')[0]}`, rows);
              }}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Contacts CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map(c => (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {c.companyName || c.name}
                    </h4>
                    <p className="text-xs text-slate-400">{c.sector} • {c.city}</p>
                  </div>
                  <Badge variant={c.status === 'vip' ? 'purple' : c.status === 'customer' ? 'success' : 'info'}>
                    {c.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-1 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.phone}</span>
                  </div>
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.address}, {c.city}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-400">Total Acheté :</span>
                    <span className="font-bold text-emerald-600 ml-1">{formatCurrency(c.totalPurchases, currency)}</span>
                  </div>
                  {c.whatsapp && (
                    <a
                      href={`https://wa.me/${c.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-lg hover:bg-emerald-100"
                      title="Échanger sur WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: New Deal */}
      <Modal
        isOpen={isDealModalOpen}
        onClose={() => setIsDealModalOpen(false)}
        title="Créer une Opportunité Commerciale"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateDeal} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Titre de l'affaire / Projet *
            </label>
            <input
              type="text"
              placeholder="Ex: Équipement réseau 24 postes, Maintenance annuelle..."
              value={dealTitle}
              onChange={e => setDealTitle(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Client / Prospect concerné *
              </label>
              <select
                value={dealCustomerId}
                onChange={e => setDealCustomerId(e.target.value)}
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
                Valeur Estimée (FCFA) *
              </label>
              <input
                type="number"
                min="0"
                value={dealValue}
                onChange={e => setDealValue(parseFloat(e.target.value) || 0)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-emerald-600"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Étape Initiale
              </label>
              <select
                value={dealStage}
                onChange={e => setDealStage(e.target.value as any)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
              >
                <option value="new">Nouveau Contact</option>
                <option value="qualified">Qualifié</option>
                <option value="proposal">Devis / Proposition</option>
                <option value="negotiation">Négociation</option>
                <option value="won">Gagné</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date de Clôture Prévue
              </label>
              <input
                type="date"
                value={dealCloseDate}
                onChange={e => setDealCloseDate(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsDealModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              Ajouter au Pipeline
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: New Customer */}
      <Modal
        isOpen={isCustModalOpen}
        onClose={() => setIsCustModalOpen(false)}
        title="Créer une Fiche Client / Prospect"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Raison Sociale / Entreprise *
              </label>
              <input
                type="text"
                placeholder="Ex: Dangote Cement Cameroun..."
                value={custCompany}
                onChange={e => setCustCompany(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nom du Contact Principal *
              </label>
              <input
                type="text"
                placeholder="Ex: M. Jean Fotso..."
                value={custName}
                onChange={e => setCustName(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Téléphone & WhatsApp *
              </label>
              <input
                type="text"
                value={custPhone}
                onChange={e => setCustPhone(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="contact@entreprise.cm"
                value={custEmail}
                onChange={e => setCustEmail(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ville
              </label>
              <select
                value={custCity}
                onChange={e => setCustCity(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              >
                <option value="Douala">Douala</option>
                <option value="Yaoundé">Yaoundé</option>
                <option value="Bafoussam">Bafoussam</option>
                <option value="Garoua">Garoua</option>
                <option value="Kribi">Kribi</option>
                <option value="Autre">Autre région</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Secteur d'Activité
              </label>
              <input
                type="text"
                value={custSector}
                onChange={e => setCustSector(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCustModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              Enregistrer le contact
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
