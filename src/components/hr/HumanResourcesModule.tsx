import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  AlertCircle,
  Download,
  Printer,
  ChevronRight,
  UserPlus,
  Briefcase
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV, triggerPrint } from '../../utils/exportTools';
import { Employee, LeaveRequest } from '../../types';

export const HumanResourcesModule: React.FC = () => {
  const {
    employees,
    leaves,
    addEmployee,
    archiveEmployee,
    addLeaveRequest,
    updateLeaveStatus,
    currentTenant,
    currency,
    language
  } = useApp();

  const [activeTab, setActiveTab] = useState<'employees' | 'leaves' | 'documents' | 'recruitment'>('employees');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  // Employee details modal
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // New Employee Modal
  const [isNewEmpModalOpen, setIsNewEmpModalOpen] = useState(false);
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formNationalId, setFormNationalId] = useState('');
  const [formBirthDate, setFormBirthDate] = useState('1994-01-01');
  const [formBirthPlace, setFormBirthPlace] = useState('Douala');
  const [formPhone, setFormPhone] = useState('+237 6');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('Akwa');
  const [formCity, setFormCity] = useState('Douala');
  const [formCnps, setFormCnps] = useState('');
  const [formPosition, setFormPosition] = useState('');
  const [formDept, setFormDept] = useState('Technique');
  const [formContractType, setFormContractType] = useState<'CDI' | 'CDD' | 'stage' | 'prestataire'>('CDI');
  const [formBaseSalary, setFormBaseSalary] = useState(350000);
  const [formTransport, setFormTransport] = useState(40000);
  const [formHousing, setFormHousing] = useState(30000);
  const [formPaymentMode, setFormPaymentMode] = useState<'bank' | 'momo_mtn' | 'om_orange' | 'cash'>('momo_mtn');
  const [formPaymentDetails, setFormPaymentDetails] = useState('');

  // Leave Request Modal
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveEmpId, setLeaveEmpId] = useState(employees[0]?.id || '');
  const [leaveType, setLeaveType] = useState<LeaveRequest['type']>('paid');
  const [leaveStartDate, setLeaveStartDate] = useState('2026-11-01');
  const [leaveEndDate, setLeaveEndDate] = useState('2026-11-10');
  const [leaveDays, setLeaveDays] = useState(8);
  const [leaveReason, setLeaveReason] = useState('Congé annuel réglementaire');

  // Document Generator Modal
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docType, setDocType] = useState<'contract' | 'attestation' | 'certificate' | 'warning'>('attestation');
  const [docEmpId, setDocEmpId] = useState(employees[0]?.id || '');

  const filteredEmployees = employees.filter(e => {
    const matchesSearch =
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'all' || e.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstName || !formLastName || !formPosition) return;

    const matricule = `KT-2026-${Math.floor(100 + Math.random() * 900)}`;

    addEmployee({
      matricule,
      firstName: formFirstName,
      lastName: formLastName,
      nationalId: formNationalId || '109283719',
      birthDate: formBirthDate,
      birthPlace: formBirthPlace,
      gender: 'M',
      maritalStatus: 'single',
      childrenCount: 0,
      phone: formPhone,
      email: formEmail || `${formFirstName.toLowerCase()}@kemet-tech.cm`,
      address: formAddress,
      city: formCity,
      emergencyContact: {
        name: 'Contact d\'urgence',
        relationship: 'Famille',
        phone: formPhone,
      },
      cnpsNumber: formCnps || '094-1928-1092',
      paymentMode: formPaymentMode,
      paymentDetails: formPaymentDetails || formPhone,
      position: formPosition,
      department: formDept,
      contractType: formContractType,
      hireDate: new Date().toISOString().split('T')[0],
      baseSalary: formBaseSalary,
      transportAllowance: formTransport,
      housingAllowance: formHousing,
      performanceBonus: 0,
      status: 'active',
    });

    setIsNewEmpModalOpen(false);
  };

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === leaveEmpId) || employees[0];
    addLeaveRequest({
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      type: leaveType,
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      daysCount: leaveDays,
      reason: leaveReason,
      status: 'pending',
    });
    setIsLeaveModalOpen(false);
  };

  const selectedDocEmployee = employees.find(e => e.id === docEmpId) || employees[0];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            {language === 'fr' ? 'Ressources Humaines & Dossiers Employés' : 'Human Resources & Personnel'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestion des fiches agents, immatriculation CNPS, contrats de travail et validation des congés
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsDocModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-indigo-500" />
            <span>Générer un Document RH</span>
          </button>
          <button
            onClick={() => setIsNewEmpModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nouvel Employé</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'employees'
              ? 'bg-slate-900 text-white dark:bg-emerald-600'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          Annuaire du Personnel ({employees.length})
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'leaves'
              ? 'bg-slate-900 text-white dark:bg-emerald-600'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          Congés & Absences ({leaves.filter(l => l.status === 'pending').length} en attente)
        </button>
        <button
          onClick={() => setActiveTab('recruitment')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'recruitment'
              ? 'bg-slate-900 text-white dark:bg-emerald-600'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          Recrutement & Candidatures
        </button>
      </div>

      {/* Tab: Employees */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher nom, matricule, poste..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value="all">Tous les Départements</option>
                <option value="Direction Générale">Direction Générale</option>
                <option value="Comptabilité">Comptabilité</option>
                <option value="Technique & Infrastructure">Technique & Infrastructure</option>
                <option value="Commercial & Ventes">Commercial & Ventes</option>
              </select>

              <button
                onClick={() => {
                  const rows = filteredEmployees.map(e => ({
                    Matricule: e.matricule,
                    Nom: `${e.firstName} ${e.lastName}`,
                    Poste: e.position,
                    Departement: e.department,
                    CNPS: e.cnpsNumber,
                    Contrat: e.contractType,
                    Salaire_Base: e.baseSalary,
                    Telephone: e.phone,
                  }));
                  exportToCSV(`personnel_${new Date().toISOString().split('T')[0]}`, rows);
                }}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Employees Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map(emp => (
              <div
                key={emp.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-base flex items-center justify-center shadow-xs">
                      {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {emp.firstName} {emp.lastName}
                      </h4>
                      <p className="text-xs text-slate-500">{emp.position}</p>
                    </div>
                  </div>
                  <Badge variant="success">{emp.contractType}</Badge>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span>Matricule :</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{emp.matricule}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Département :</span>
                    <span className="text-slate-800 dark:text-slate-200">{emp.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>N° CNPS Cameroun :</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{emp.cnpsNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Salaire de base :</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(emp.baseSalary, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mode Paiement :</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                      {emp.paymentMode === 'momo_mtn' ? 'MTN MoMo' : emp.paymentMode === 'om_orange' ? 'Orange Money' : 'Virement Bancaire'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setSelectedEmployee(emp)}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    <span>Consulter le dossier complet</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Leaves & Absences */}
      {activeTab === 'leaves' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Demandes de Congés et d'Absences
            </h3>
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Déposer une Demande</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold">
                <tr>
                  <th className="px-4 py-3">Employé</th>
                  <th className="px-4 py-3">Type de Congé</th>
                  <th className="px-4 py-3">Période</th>
                  <th className="px-4 py-3 text-center">Durée</th>
                  <th className="px-4 py-3">Motif</th>
                  <th className="px-4 py-3 text-center">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leaves.map(l => (
                  <tr key={l.id}>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{l.employeeName}</td>
                    <td className="px-4 py-3 capitalize font-semibold text-slate-700 dark:text-slate-300">
                      {l.type === 'paid' ? 'Congé payé' : l.type === 'exceptional' ? 'Exceptionnel' : l.type === 'sick' ? 'Maladie' : l.type}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(l.startDate, language)} au {formatDate(l.endDate, language)}
                    </td>
                    <td className="px-4 py-3 text-center font-bold">{l.daysCount} jours</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{l.reason}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={l.status === 'approved' ? 'success' : l.status === 'rejected' ? 'danger' : 'warning'}>
                        {l.status === 'approved' ? 'Validé' : l.status === 'rejected' ? 'Refusé' : 'En attente'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {l.status === 'pending' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => updateLeaveStatus(l.id, 'approved')}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Approuver la demande"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateLeaveStatus(l.id, 'rejected')}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                            title="Rejeter la demande"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Recruitment */}
      {activeTab === 'recruitment' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Campagnes de Recrutement & Pipeline Candidats
              </h3>
              <p className="text-xs text-slate-400">
                Postes ouverts, CVthèque et conversion d'un candidat retenu en employé en 1 clic.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Poste Ouvert</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Développeur Full-Stack React / Node</div>
              <p className="text-xs text-slate-500">Douala • CDI • Salaire : 500k - 700k FCFA</p>
              <div className="pt-2 text-xs font-semibold text-slate-400">4 candidatures reçues</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Poste Ouvert</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Commercial B2B Grands Comptes</div>
              <p className="text-xs text-slate-500">Yaoundé • CDI • Fixe + Commissions</p>
              <div className="pt-2 text-xs font-semibold text-slate-400">2 entretiens planifiés</div>
            </div>

            <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center p-6 text-slate-400 hover:text-slate-600 cursor-pointer">
              <Briefcase className="w-8 h-8 text-slate-300 mb-2" />
              <div className="text-xs font-bold">+ Publier une nouvelle offre</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Employee */}
      <Modal
        isOpen={isNewEmpModalOpen}
        onClose={() => setIsNewEmpModalOpen(false)}
        title="Enregistrement d'un Nouvel Employé"
        maxWidth="3xl"
      >
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Prénom *</label>
              <input
                type="text"
                value={formFirstName}
                onChange={e => setFormFirstName(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nom de famille *</label>
              <input
                type="text"
                value={formLastName}
                onChange={e => setFormLastName(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">N° CNI (Carte Nationale d'Identité)</label>
              <input
                type="text"
                placeholder="Ex: 110928401"
                value={formNationalId}
                onChange={e => setFormNationalId(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">N° CNPS Cameroun</label>
              <input
                type="text"
                placeholder="Ex: 084-2910-1102"
                value={formCnps}
                onChange={e => setFormCnps(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Téléphone Direct *</label>
              <input
                type="text"
                value={formPhone}
                onChange={e => setFormPhone(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Intitulé du Poste *</label>
              <input
                type="text"
                placeholder="Ex: Comptable, Développeur..."
                value={formPosition}
                onChange={e => setFormPosition(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Département</label>
              <select
                value={formDept}
                onChange={e => setFormDept(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              >
                <option value="Technique & Infrastructure">Technique & Infrastructure</option>
                <option value="Comptabilité">Comptabilité</option>
                <option value="Commercial & Ventes">Commercial & Ventes</option>
                <option value="Direction Générale">Direction Générale</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Type de Contrat</label>
              <select
                value={formContractType}
                onChange={e => setFormContractType(e.target.value as any)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
              >
                <option value="CDI">CDI (Indéterminée)</option>
                <option value="CDD">CDD (Déterminée)</option>
                <option value="stage">Stage Professionnel</option>
                <option value="prestataire">Prestataire / Consultant</option>
              </select>
            </div>
          </div>

          {/* Salary Breakdown */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
              Rémunération & Coordonnées de Paiement
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Salaire de Base (FCFA) *</label>
                <input
                  type="number"
                  min="0"
                  value={formBaseSalary}
                  onChange={e => setFormBaseSalary(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-emerald-600"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Indemnité Transport (FCFA)</label>
                <input
                  type="number"
                  min="0"
                  value={formTransport}
                  onChange={e => setFormTransport(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Indemnité Logement (FCFA)</label>
                <input
                  type="number"
                  min="0"
                  value={formHousing}
                  onChange={e => setFormHousing(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Mode de Versement du Salaire</label>
                <select
                  value={formPaymentMode}
                  onChange={e => setFormPaymentMode(e.target.value as any)}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
                >
                  <option value="momo_mtn">MTN Mobile Money Pro</option>
                  <option value="om_orange">Orange Money Entreprise</option>
                  <option value="bank">Virement Bancaire (Afriland, BICEC...)</option>
                  <option value="cash">Espèces en main propre</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">N° Compte RIB ou N° MoMo</label>
                <input
                  type="text"
                  placeholder="Ex: +237 6xx xxx xxx ou RIB CM21..."
                  value={formPaymentDetails}
                  onChange={e => setFormPaymentDetails(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsNewEmpModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              Créer le dossier employé
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Leave Request */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Dépôt d'une Demande de Congé"
        maxWidth="md"
      >
        <form onSubmit={handleCreateLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Employé demandeur *</label>
            <select
              value={leaveEmpId}
              onChange={e => setLeaveEmpId(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName} ({e.position})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nature de l'absence</label>
            <select
              value={leaveType}
              onChange={e => setLeaveType(e.target.value as any)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            >
              <option value="paid">Congé payé annuel légal</option>
              <option value="exceptional">Congé exceptionnel (mariage, naissance...)</option>
              <option value="sick">Arrêt maladie avec certificat médical</option>
              <option value="unpaid">Congé sans solde</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Date début</label>
              <input
                type="date"
                value={leaveStartDate}
                onChange={e => setLeaveStartDate(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Date fin</label>
              <input
                type="date"
                value={leaveEndDate}
                onChange={e => setLeaveEndDate(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre de jours ouvrés</label>
            <input
              type="number"
              min="1"
              value={leaveDays}
              onChange={e => setLeaveDays(parseInt(e.target.value) || 1)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Motif / Justificatif</label>
            <textarea
              rows={2}
              value={leaveReason}
              onChange={e => setLeaveReason(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              Soumettre la demande
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Document Generator & Template */}
      <Modal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        title="Générateur de Documents RH Officiels"
        maxWidth="3xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Document à générer *</label>
              <select
                value={docType}
                onChange={e => setDocType(e.target.value as any)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
              >
                <option value="attestation">Attestation de Travail</option>
                <option value="contract">Contrat de Travail Conforme OHADA</option>
                <option value="certificate">Certificat de Travail de Fin de Contrat</option>
                <option value="warning">Lettre d'Avertissement / Notification</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Employé concerné *</label>
              <select
                value={docEmpId}
                onChange={e => setDocEmpId(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              >
                {employees.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.firstName} {e.lastName} ({e.matricule} - {e.position})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Printable Letter Sheet */}
          <div className="p-8 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white space-y-6 text-xs leading-relaxed font-serif">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <div className="font-sans font-bold text-base text-slate-900 dark:text-white">{currentTenant.name}</div>
                <div className="text-[10px] text-slate-500 font-sans">{currentTenant.address}, {currentTenant.city} • NIU: {currentTenant.taxId}</div>
              </div>
              <div className="text-right font-sans text-xs text-slate-400">
                Fait à {currentTenant.city}, le {formatDate(new Date().toISOString(), language)}
              </div>
            </div>

            <div className="text-center py-4">
              <h2 className="text-base font-bold uppercase tracking-wider underline">
                {docType === 'attestation' ? 'ATTESTATION DE TRAVAIL' :
                 docType === 'contract' ? 'CONTRAT INDIVIDUEL DE TRAVAIL' :
                 docType === 'certificate' ? 'CERTIFICAT DE TRAVAIL' : 'LETTRE D’AVERTISSEMENT'}
              </h2>
            </div>

            <div className="space-y-4 text-justify">
              <p>
                Nous soussignés, la société <strong>{currentTenant.name}</strong>, représentée par sa Direction Générale, certifions par la présente que :
              </p>
              <p className="pl-6 border-l-2 border-emerald-500 font-sans">
                <strong>Nom et Prénom :</strong> {selectedDocEmployee.firstName} {selectedDocEmployee.lastName}<br />
                <strong>Matricule :</strong> {selectedDocEmployee.matricule}<br />
                <strong>N° CNI :</strong> {selectedDocEmployee.nationalId}<br />
                <strong>N° Immatriculation CNPS :</strong> {selectedDocEmployee.cnpsNumber}<br />
                <strong>Poste occupé :</strong> {selectedDocEmployee.position} ({selectedDocEmployee.department})<br />
                <strong>Date d'embauche :</strong> {formatDate(selectedDocEmployee.hireDate, language)}
              </p>
              <p>
                L'intéressé(e) est lié(e) à notre entreprise par un contrat de type <strong>{selectedDocEmployee.contractType}</strong> et exerce ses fonctions en toute probité et régularité juridique.
              </p>
              <p>
                Cette attestation lui est délivrée pour servir et valoir ce que de droit.
              </p>
            </div>

            <div className="pt-8 flex justify-between items-end font-sans">
              <div className="text-xs text-slate-400">
                Visa de l'Inspection du Travail (le cas échéant)
              </div>
              <div className="text-center p-3 border border-slate-200 rounded-xl w-48">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Pour la Direction Générale</div>
                <div className="italic text-emerald-700 font-bold mt-3">Cachet & Signature</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={triggerPrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer l'attestation</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
