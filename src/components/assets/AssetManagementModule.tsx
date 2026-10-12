import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  CheckCircle,
  FileSignature,
  RotateCcw,
  Wrench,
  AlertTriangle,
  Download,
  Printer,
  Laptop,
  Car,
  Cpu,
  Armchair
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV, triggerPrint } from '../../utils/exportTools';
import { Asset, AssetAssignment } from '../../types';

export const AssetManagementModule: React.FC = () => {
  const {
    assets,
    assetAssignments,
    employees,
    addAsset,
    assignAsset,
    returnAsset,
    archiveAsset,
    currentTenant,
    currency,
    language
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Assign Modal
  const [assignAssetId, setAssignAssetId] = useState<string | null>(null);
  const [assignEmpId, setAssignEmpId] = useState(employees[0]?.id || '');
  const [assignNotes, setAssignNotes] = useState('Matériel remis complet en bon état avec ses accessoires.');

  // Return Modal
  const [returnAssetId, setReturnAssetId] = useState<string | null>(null);
  const [returnCondition, setReturnCondition] = useState<'good' | 'fair' | 'damaged'>('good');

  // New Asset Modal
  const [isNewAssetModalOpen, setIsNewAssetModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Asset['category']>('it');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseCost, setPurchaseCost] = useState(450000);
  const [lifespanYears, setLifespanYears] = useState(4);
  const [location, setLocation] = useState('Douala - Bureau');

  // Preview Discharge Form
  const [selectedDischarge, setSelectedDischarge] = useState<AssetAssignment | null>(null);

  const filteredAssets = assets.filter(a => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.assignedToEmployeeName && a.assignedToEmployeeName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || a.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const totalAssetValue = assets.reduce((sum, a) => sum + a.purchaseCost, 0);

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !serialNumber) return;

    const code = `MAT-${category.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    addAsset({
      code,
      name,
      category,
      brand,
      model,
      serialNumber,
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseCost,
      currentValue: purchaseCost,
      lifespanYears,
      location,
      status: 'available',
      condition: 'new',
    });

    setIsNewAssetModalOpen(false);
    setName('');
    setSerialNumber('');
  };

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignAssetId) return;
    assignAsset(assignAssetId, assignEmpId, assignNotes);
    setAssignAssetId(null);
  };

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnAssetId) return;
    returnAsset(returnAssetId, returnCondition);
    setReturnAssetId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            {language === 'fr' ? 'Gestion du Parc Matériel & Décharges' : 'Assets & Equipment Inventory'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Inventaire des équipements, fiches de décharge signées numériquement, amortissements et traçabilité des retours
          </p>
        </div>

        <button
          onClick={() => setIsNewAssetModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Équipement</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valeur Totale du Parc</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalAssetValue, currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{assets.length} équipements enregistrés</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Matériels Affectés</span>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {assets.filter(a => a.status === 'assigned').length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Avec décharge active signée</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Matériels Disponibles</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {assets.filter(a => a.status === 'available').length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Prêts pour attribution</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">En Maintenance / Réparation</span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {assets.filter(a => a.status === 'in_repair').length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Suivi des interventions</p>
        </div>
      </div>

      {/* Filter and Actions Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher équipement, série, agent..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
          >
            <option value="all">Toutes les catégories</option>
            <option value="it">Informatique & Réseau</option>
            <option value="vehicle">Véhicules & Mobilité</option>
            <option value="machinery">Énergie & Groupes (Perkins...)</option>
            <option value="furniture">Mobilier de Bureau</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
          >
            <option value="all">Tous les statuts</option>
            <option value="available">Disponible</option>
            <option value="assigned">Affecté à un agent</option>
            <option value="in_repair">En réparation</option>
          </select>

          <button
            onClick={() => {
              const rows = filteredAssets.map(a => ({
                Code: a.code,
                Nom: a.name,
                Categorie: a.category,
                Serie: a.serialNumber,
                Cout_Achat: a.purchaseCost,
                Detenteur: a.assignedToEmployeeName || 'Non affecté',
                Statut: a.status,
                Localisation: a.location,
              }));
              exportToCSV(`inventaire_materiel_${new Date().toISOString().split('T')[0]}`, rows);
            }}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Inventaire</span>
          </button>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold">
              <tr>
                <th className="px-4 py-3.5">Code & Équipement</th>
                <th className="px-4 py-3.5">N° Série / Châssis</th>
                <th className="px-4 py-3.5">Catégorie</th>
                <th className="px-4 py-3.5 text-right">Valeur d'Acquisition</th>
                <th className="px-4 py-3.5">Détenteur Actuel</th>
                <th className="px-4 py-3.5">Localisation</th>
                <th className="px-4 py-3.5 text-center">Statut</th>
                <th className="px-4 py-3.5 text-center">Actions & Décharge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAssets.map(asset => (
                <tr key={asset.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 dark:text-white">{asset.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{asset.code}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                    {asset.serialNumber}
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-400">
                    {asset.category === 'it' ? 'Informatique' : asset.category === 'vehicle' ? 'Véhicule' : asset.category === 'machinery' ? 'Énergie / Groupe' : asset.category}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(asset.purchaseCost, currency)}
                  </td>
                  <td className="px-4 py-3">
                    {asset.assignedToEmployeeName ? (
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {asset.assignedToEmployeeName}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Non attribué</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{asset.location}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant={
                        asset.status === 'available' ? 'success' :
                        asset.status === 'assigned' ? 'info' : 'warning'
                      }
                    >
                      {asset.status === 'available' ? 'Disponible' :
                       asset.status === 'assigned' ? 'Affecté' : 'En Révision'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      {asset.status === 'available' && (
                        <button
                          onClick={() => setAssignAssetId(asset.id)}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold shadow-xs hover:bg-emerald-700"
                        >
                          Affecter + Décharge
                        </button>
                      )}

                      {asset.status === 'assigned' && (
                        <>
                          <button
                            onClick={() => {
                              const assign = assetAssignments.find(a => a.assetId === asset.id);
                              if (assign) setSelectedDischarge(assign);
                            }}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            title="Voir la Fiche de Décharge Signée"
                          >
                            <FileSignature className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setReturnAssetId(asset.id)}
                            className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-[10px] font-bold hover:bg-slate-300"
                            title="Restituer l'équipement au stock"
                          >
                            Restituer
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Asset */}
      <Modal
        isOpen={isNewAssetModalOpen}
        onClose={() => setIsNewAssetModalOpen(false)}
        title="Ajouter un Équipement à l'Inventaire"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateAsset} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Désignation de l'équipement *
              </label>
              <input
                type="text"
                placeholder="Ex: Groupe Perkins 20kVA, MacBook Pro 14..."
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Catégorie *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
              >
                <option value="it">Informatique & Réseau</option>
                <option value="vehicle">Véhicule (Voiture, Moto)</option>
                <option value="machinery">Énergie & Groupe Électrogène</option>
                <option value="telecom">Téléphonie & Modems</option>
                <option value="furniture">Mobilier de bureau</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Marque</label>
              <input
                type="text"
                placeholder="Ex: Dell, Apple, Toyota..."
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Modèle</label>
              <input
                type="text"
                placeholder="Ex: Hilux 2.8, R650xs..."
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Numéro de Série / Châssis *</label>
              <input
                type="text"
                placeholder="Ex: SN-92810928-CMR"
                value={serialNumber}
                onChange={e => setSerialNumber(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Coût d'Acquisition (FCFA)</label>
              <input
                type="number"
                min="0"
                value={purchaseCost}
                onChange={e => setPurchaseCost(parseFloat(e.target.value) || 0)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-emerald-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Durée d'Amortissement (Ans)</label>
              <input
                type="number"
                min="1"
                value={lifespanYears}
                onChange={e => setLifespanYears(parseInt(e.target.value) || 4)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Emplacement / Site</label>
              <input
                type="text"
                placeholder="Ex: Douala Siège Akwa"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsNewAssetModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              Enregistrer au patrimoine
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Assign Asset with Digital Discharge */}
      <Modal
        isOpen={!!assignAssetId}
        onClose={() => setAssignAssetId(null)}
        title="Affectation de Matériel & Fiche de Décharge Officielle"
        maxWidth="lg"
      >
        <form onSubmit={handleConfirmAssignment} className="space-y-4">
          <p className="text-xs text-slate-500">
            L'affectation engage la responsabilité civile et professionnelle de l'employé pour la garde et le bon entretien du matériel.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Employé bénéficiaire *
            </label>
            <select
              value={assignEmpId}
              onChange={e => setAssignEmpId(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName} ({e.matricule} - {e.position})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Clauses de décharge et état de remise constaté
            </label>
            <textarea
              rows={3}
              value={assignNotes}
              onChange={e => setAssignNotes(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Fiche de décharge signée électroniquement et rattachée à l'audit.</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAssignAssetId(null)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              Valider l'affectation
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Return Asset */}
      <Modal
        isOpen={!!returnAssetId}
        onClose={() => setReturnAssetId(null)}
        title="Constat de Restitution de Matériel"
        maxWidth="md"
      >
        <form onSubmit={handleConfirmReturn} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              État physique au retour en magasin *
            </label>
            <select
              value={returnCondition}
              onChange={e => setReturnCondition(e.target.value as any)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
            >
              <option value="good">Bon état de fonctionnement (Conforme)</option>
              <option value="fair">État d'usage normal avec traces légères</option>
              <option value="damaged">Endommagé / Réparation requise</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setReturnAssetId(null)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 text-white dark:bg-emerald-600 rounded-xl text-xs font-bold"
            >
              Confirmer la restitution au stock
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Digital Discharge Form */}
      {selectedDischarge && (
        <Modal
          isOpen={!!selectedDischarge}
          onClose={() => setSelectedDischarge(null)}
          title="Fiche de Décharge de Matériel Signée"
          maxWidth="2xl"
        >
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={triggerPrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white dark:bg-emerald-600 rounded-xl text-xs font-bold"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer la Fiche</span>
              </button>
            </div>

            <div className="p-8 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white space-y-6 text-xs leading-relaxed font-sans">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <div className="font-bold text-sm">{currentTenant.name}</div>
                  <div className="text-[10px] text-slate-500">Service Patrimoine & Logistique</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-600">DÉCHARGE DE RESPONSABILITÉ</div>
                  <div className="text-[10px] text-slate-400">Date : {formatDate(selectedDischarge.assignedDate, language)}</div>
                </div>
              </div>

              <div className="space-y-3">
                <p>
                  Je soussigné(e), <strong>{selectedDischarge.employeeName}</strong>, reconnais avoir reçu ce jour à titre d'outil de travail professionnel l'équipement suivant :
                </p>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div><strong>Équipement :</strong> {selectedDischarge.assetName}</div>
                  <div><strong>État à la remise :</strong> {selectedDischarge.conditionAtHandover}</div>
                  <div><strong>Observations :</strong> {selectedDischarge.notes}</div>
                </div>

                <p className="text-[11px] text-slate-500 italic">
                  Je m'engage à en faire un usage strictement professionnel conforme aux règlements de l'entreprise et à le restituer immédiatement en cas de rupture de contrat ou sur demande de la direction.
                </p>
              </div>

              <div className="pt-8 border-t border-slate-200 flex justify-between items-end">
                <div className="text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Signature de l'Agent</div>
                  <div className="text-emerald-600 font-serif italic font-bold mt-2">
                    [Certifié numériquement] {selectedDischarge.employeeName}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Visa Logistique / Direction</div>
                  <div className="text-slate-800 dark:text-slate-200 font-serif italic mt-2">
                    {currentTenant.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
