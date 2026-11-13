import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Edit3,
  Trash2,
  User,
  Phone,
  Check,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CompanyPosition } from '../../types';

export const PositionsManager: React.FC = () => {
  const { positions, addPosition, updatePosition, archivePosition, language } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [assigneeName, setAssigneeName] = useState('');
  const [assigneePhone, setAssigneePhone] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setDepartment('');
    setAssigneeName('');
    setAssigneePhone('');
    setDescription('');
    setFormError(null);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (pos: CompanyPosition) => {
    setEditingId(pos.id);
    setTitle(pos.title);
    setDepartment(pos.department);
    setAssigneeName(pos.assigneeName || '');
    setAssigneePhone(pos.assigneePhone || '');
    setDescription(pos.description || '');
    setIsAdding(true);
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Veuillez saisir l’intitulé du poste (ex : Caissier, Livreur, Chef de chantier...).');
      return;
    }

    if (editingId) {
      updatePosition(editingId, {
        title: title.trim(),
        department: department.trim() || 'Général',
        assigneeName: assigneeName.trim() || undefined,
        assigneePhone: assigneePhone.trim() || undefined,
        description: description.trim() || undefined,
      });
    } else {
      addPosition({
        title: title.trim(),
        department: department.trim() || 'Général',
        assigneeName: assigneeName.trim() || undefined,
        assigneePhone: assigneePhone.trim() || undefined,
        description: description.trim() || undefined,
      });
    }
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {language === 'fr' ? 'Postes de Travail de l’Entreprise' : 'Company Positions'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Définissez manuellement les postes propres à votre entreprise et les responsables associés pour diriger chaque tâche avec précision.
          </p>
        </div>

        {!isAdding && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Définir un Poste</span>
          </button>
        )}
      </div>

      {/* Add / Edit Position Form */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {editingId ? 'Modifier le Poste' : 'Nouveau Poste Manuel'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Intitulé du Poste *
              </label>
              <input
                type="text"
                placeholder="Ex : Caissière Principale, Magasinier, Livreur, Chef Chantier..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Service / Département
              </label>
              <input
                type="text"
                placeholder="Ex : Administration, Ventes, Logistique, Production..."
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Responsable / Titulaire du Poste
              </label>
              <input
                type="text"
                placeholder="Nom de la personne (Ex : Paul Biya, Mireille Kamga...)"
                value={assigneeName}
                onChange={e => setAssigneeName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Téléphone / Contact interne
              </label>
              <input
                type="text"
                placeholder="+237 6..."
                value={assigneePhone}
                onChange={e => setAssigneePhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Missions & Attributions du Poste (optionnel)
            </label>
            <textarea
              rows={2}
              placeholder="Décrivez brièvement les responsabilités attendues pour ce poste..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{editingId ? 'Mettre à jour le Poste' : 'Enregistrer le Poste'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Positions List */}
      {positions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <Briefcase className="w-9 h-9 text-slate-300 dark:text-slate-600 mx-auto" />
          <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Aucun poste défini pour cette entreprise
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Chaque entreprise crée librement ses propres postes (ex : Comptable, Magasinier, Caissière, Livreur, Secrétaire) pour attribuer les tâches sans confusion.
          </p>
          {!isAdding && (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Créer le premier poste</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                <tr>
                  <th className="px-4 py-3">Poste</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Titulaire / Responsable</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Attributions</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {positions.map(pos => (
                  <tr key={pos.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {pos.title}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {pos.department || 'Général'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {pos.assigneeName ? (
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {pos.assigneeName}
                        </span>
                      ) : (
                        <span className="text-slate-400">Non attribué</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {pos.assigneePhone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {pos.assigneePhone}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-xs truncate" title={pos.description}>
                      {pos.description || '-'}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(pos)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Modifier ce poste"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Archiver le poste « ${pos.title} » ?`)) {
                              archivePosition(pos.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Archiver ce poste"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
