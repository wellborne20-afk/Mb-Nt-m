import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Clock,
  UserCheck,
  Lock,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { formatDateTime } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportTools';

export const AuditLogModule: React.FC = () => {
  const { auditLogs, language, currency, currentTenant } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMod = moduleFilter === 'all' || log.module === moduleFilter;
    return matchesSearch && matchesMod;
  });

  const handleExportAudit = () => {
    const rows = filteredLogs.map(l => ({
      Horodatage: formatDateTime(l.timestamp, language),
      Utilisateur: l.userName,
      Role: l.userRole,
      Module: l.module,
      Action: l.action,
      Details: l.details,
      Adresse_IP: l.ipAddress || '154.72.168.12 (CMR)',
    }));
    exportToCSV(`journal_audit_${currentTenant.id}_${new Date().toISOString().split('T')[0]}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            {language === 'fr' ? 'Journal d’Audit & Sécurité Inaltérable' : 'Security & Audit Trail'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Traçabilité complète (qui, quoi, quand, où) de toutes les créations, modifications et flux financiers
          </p>
        </div>

        <button
          onClick={handleExportAudit}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white dark:bg-emerald-600 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Exporter Journal d'Audit (CSV)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrer par action, agent ou détails..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
          >
            <option value="all">Tous les modules</option>
            <option value="Journal Financier">Journal Financier</option>
            <option value="Finances & Caisses">Finances & Caisses</option>
            <option value="Facturation">Facturation</option>
            <option value="Ressources Humaines">Ressources Humaines</option>
            <option value="Paie & Salaires">Paie & Salaires</option>
            <option value="Parc Matériel">Parc Matériel</option>
            <option value="CRM">CRM</option>
            <option value="Authentification">Authentification</option>
            <option value="Paramètres">Paramètres</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold">
              <tr>
                <th className="px-4 py-3.5">Horodatage</th>
                <th className="px-4 py-3.5">Utilisateur & Rôle</th>
                <th className="px-4 py-3.5">Module</th>
                <th className="px-4 py-3.5">Action Exécutée</th>
                <th className="px-4 py-3.5">Détails Opérationnels</th>
                <th className="px-4 py-3.5">Adresse IP / Réseau</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">
                    {formatDateTime(log.timestamp, language)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-bold text-slate-900 dark:text-white">{log.userName}</div>
                    <span className="text-[10px] uppercase font-mono text-slate-400">{log.userRole}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                      {log.module}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-md">
                    {log.details}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {log.ipAddress || '154.72.168.12 (CMR)'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
