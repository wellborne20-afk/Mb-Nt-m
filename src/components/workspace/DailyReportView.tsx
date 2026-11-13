import React, { useState } from 'react';
import {
  ClipboardCheck,
  Download,
  Printer,
  Copy,
  Check,
  Save,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { exportToCSV, triggerPrint } from '../../utils/exportTools';

export const DailyReportView: React.FC = () => {
  const {
    currentTenant,
    currentUser,
    tasks,
    positions,
    dailyReports,
    addDailyWorkReport,
    language,
  } = useApp();

  const today = new Date().toISOString().split('T')[0];
  const [reportDate, setReportDate] = useState(today);
  const [positionFilter, setPositionFilter] = useState('all');
  const [summaryNotes, setSummaryNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const filteredTasks = tasks.filter(t => {
    if (positionFilter !== 'all' && t.assignedPositionName !== positionFilter) return false;
    return true;
  });

  // Tasks done/validated on or up to the selected report date
  const validatedTasks = filteredTasks.filter(
    t => t.status === 'validated' && (!t.validatedAt || t.validatedAt.split('T')[0] <= reportDate)
  );
  const donePendingValidationTasks = filteredTasks.filter(
    t => t.status === 'done_pending_validation'
  );
  const remainingTasks = filteredTasks.filter(
    t => t.status === 'todo' || t.status === 'in_progress' || t.status === 'correction_needed'
  );
  const correctionTasks = remainingTasks.filter(t => t.status === 'correction_needed');

  const doneTotalList = [...validatedTasks, ...donePendingValidationTasks];

  const buildPlainTextSummary = () => {
    const lines: string[] = [
      `RAPPORT JOURNALIER DE TRAVAIL — ${currentTenant.name}`,
      `Date : ${formatDate(reportDate, language)} · Périmètre : ${positionFilter === 'all' ? 'Tous les postes' : positionFilter}`,
      `Établi par : ${currentUser.name}`,
      '',
      `1. CE QUI EST FAIT (${doneTotalList.length}) :`,
      ...(doneTotalList.length > 0
        ? doneTotalList.map(
            t =>
              `  [✓] ${t.title} (${t.assignedPositionName}${t.assignedToName ? ` - ${t.assignedToName}` : ''}) — ${
                t.status === 'validated' ? 'Finalisée & Validée' : 'Réalisée (en attente validation)'
              }`
          )
        : ['  Aucune tâche finalisée enregistrée.']),
      '',
      `2. CE QUI RESTE À FAIRE (${remainingTasks.length}) :`,
      ...(remainingTasks.length > 0
        ? remainingTasks.map(
            t =>
              `  [ ] ${t.title} (${t.assignedPositionName}${t.assignedToName ? ` - ${t.assignedToName}` : ''}) — Échéance : ${t.dueDate}${
                t.status === 'correction_needed' ? ` [CORRECTION : ${t.correctionNote || ''}]` : ''
              }`
          )
        : ['  Tout est à jour, aucune tâche restante.']),
    ];

    if (summaryNotes.trim()) {
      lines.push('', `3. OBSERVATIONS :`, summaryNotes.trim());
    }
    return lines.join('\n');
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(buildPlainTextSummary());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback ignored if clipboard restricted
    }
  };

  const handleSaveReport = () => {
    addDailyWorkReport({
      date: reportDate,
      authorName: currentUser.name,
      positionFilter: positionFilter === 'all' ? 'Tous les postes' : positionFilter,
      validatedCount: validatedTasks.length,
      pendingValidationCount: donePendingValidationTasks.length,
      remainingCount: remainingTasks.length,
      correctionCount: correctionTasks.length,
      doneItems: doneTotalList.map(t => `${t.title} (${t.assignedPositionName})`),
      remainingItems: remainingTasks.map(t => `${t.title} (${t.assignedPositionName})`),
      summaryNotes: summaryNotes.trim(),
    });
    setSummaryNotes('');
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleExportCSV = () => {
    const rows = [
      ...doneTotalList.map(t => ({
        Date_Rapport: reportDate,
        Section: 'Fait',
        Statut: t.status === 'validated' ? 'Finalisée & Validée' : 'Réalisée (Attente validation)',
        Tache: t.title,
        Poste: t.assignedPositionName,
        Responsable: t.assignedToName || '-',
        Echeance: t.dueDate,
      })),
      ...remainingTasks.map(t => ({
        Date_Rapport: reportDate,
        Section: 'Reste à faire',
        Statut: t.status === 'correction_needed' ? 'Correction demandée' : 'En attente',
        Tache: t.title,
        Poste: t.assignedPositionName,
        Responsable: t.assignedToName || '-',
        Echeance: t.dueDate,
      })),
    ];
    exportToCSV(`rapport_journalier_${reportDate}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Report Controls Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              Date du rapport
            </label>
            <input
              type="date"
              value={reportDate}
              onChange={e => setReportDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              Filtrer par poste
            </label>
            <select
              value={positionFilter}
              onChange={e => setPositionFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
            >
              <option value="all">Tous les postes de l’entreprise</option>
              {positions.map(p => (
                <option key={p.id} value={p.title}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer whitespace-nowrap"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copié' : 'Copier le texte'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={triggerPrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer / PDF</span>
          </button>

          <button
            type="button"
            onClick={handleSaveReport}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Enregistrer le Rapport</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          Rapport journalier enregistré et archivé avec succès dans l’historique de l’entreprise.
        </div>
      )}

      {/* Quantitative Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Finalisées & Validées</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">
            {validatedTasks.length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cochées (Attente validation)</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 tabular-nums mt-1">
            {donePendingValidationTasks.length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Reste à faire</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums mt-1">
            {remainingTasks.length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Relances de correction</div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 tabular-nums mt-1">
            {correctionTasks.length}
          </div>
        </div>
      </div>

      {/* Done vs Remaining Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Column 1: Done */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Ce qui est fait</span>
            </h3>
            <span className="text-xs font-mono font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
              {doneTotalList.length} tâche(s)
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 flex-1">
            {doneTotalList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Aucune tâche réalisée ou validée pour le moment.
              </div>
            ) : (
              doneTotalList.map(t => (
                <div key={t.id} className="p-4 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{t.title}</span>
                    <span
                      className={`text-[11px] font-bold shrink-0 ${
                        t.status === 'validated'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {t.status === 'validated' ? 'Validée' : 'À valider'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.assignedPositionName}
                    {t.assignedToName ? ` · ${t.assignedToName}` : ''}
                    {t.validatedBy ? ` · Validée par ${t.validatedBy}` : ''}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Remaining */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Ce qui reste à faire</span>
            </h3>
            <span className="text-xs font-mono font-bold tabular-nums text-amber-700 dark:text-amber-400">
              {remainingTasks.length} tâche(s)
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 flex-1">
            {remainingTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Aucune tâche restante. Tout a été traité.
              </div>
            ) : (
              remainingTasks.map(t => (
                <div key={t.id} className="p-4 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{t.title}</span>
                    <span
                      className={`text-[11px] font-bold shrink-0 ${
                        t.status === 'correction_needed'
                          ? 'text-rose-600 dark:text-rose-400'
                          : t.dueDate < today
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {t.status === 'correction_needed'
                        ? 'Correction'
                        : t.dueDate < today
                        ? 'En retard'
                        : 'En attente'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.assignedPositionName}
                    {t.assignedToName ? ` · ${t.assignedToName}` : ''}
                    <span className="tabular-nums"> · Échéance : {formatDate(t.dueDate, language)}</span>
                  </div>
                  {t.correctionNote && (
                    <div className="text-[11px] text-rose-600 dark:text-rose-400">
                      Note : {t.correctionNote}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Observations Input for Archiving */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
          Observations, points de blocage ou consignes pour demain
        </label>
        <textarea
          rows={3}
          placeholder="Saisissez vos commentaires ou instructions de passation de journée avant d'enregistrer le rapport..."
          value={summaryNotes}
          onChange={e => setSummaryNotes(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Saved Reports History */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-emerald-600" />
            <span>Historique des Rapports Journaliers Enregistrés</span>
          </h3>
          <span className="text-xs text-slate-400 tabular-nums">{dailyReports.length} archivé(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Auteur</th>
                <th className="px-4 py-3">Périmètre / Poste</th>
                <th className="px-4 py-3 text-right">Fait (Validé)</th>
                <th className="px-4 py-3 text-right">Reste à faire</th>
                <th className="px-4 py-3">Observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {dailyReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Aucun rapport journalier encore archivé. Cliquez sur « Enregistrer le Rapport » ci-dessus pour conserver une trace officielle de la journée.
                  </td>
                </tr>
              ) : (
                dailyReports.map(rep => (
                  <tr key={rep.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono font-bold tabular-nums text-slate-900 dark:text-white whitespace-nowrap">
                      {formatDate(rep.date, language)}
                      <div className="text-[10px] font-normal text-slate-400">{formatDateTime(rep.createdAt, language)}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {rep.authorName}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {rep.positionFilter}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {rep.validatedCount + rep.pendingValidationCount}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold tabular-nums text-amber-600 dark:text-amber-400">
                      {rep.remainingCount}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-sm">
                      {rep.summaryNotes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
