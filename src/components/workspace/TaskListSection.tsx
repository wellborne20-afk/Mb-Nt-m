import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  CheckCircle2,
  BellRing,
  RotateCcw,
  Edit3,
  MessageSquareText,
  Archive,
  Send,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WorkspaceTask, TaskPriority } from '../../types';
import { formatDate, formatDateTime } from '../../utils/formatters';

interface TaskListSectionProps {
  title: string;
  subtitle?: string;
  tasks: WorkspaceTask[];
  emptyMessage: string;
  highlightVariant?: 'priority' | 'normal' | 'done';
  onEditTask: (task: WorkspaceTask) => void;
}

export const TaskListSection: React.FC<TaskListSectionProps> = ({
  title,
  subtitle,
  tasks,
  emptyMessage,
  highlightVariant = 'normal',
  onEditTask,
}) => {
  const {
    language,
    toggleTaskCheck,
    validateTask,
    requestTaskCorrection,
    sendTaskReminder,
    addTaskComment,
    archiveTask,
  } = useApp();

  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [correctionTaskId, setCorrectionTaskId] = useState<string | null>(null);
  const [correctionText, setCorrectionText] = useState('');
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const showFeedback = (msg: string) => {
    setFeedbackBanner(msg);
    setTimeout(() => setFeedbackBanner(null), 3000);
  };

  const priorityLabel = (p: TaskPriority) => {
    switch (p) {
      case 'urgent':
        return { text: 'Urgent', cls: 'text-rose-600 dark:text-rose-400 font-bold' };
      case 'high':
        return { text: 'Haute priorité', cls: 'text-amber-600 dark:text-amber-400 font-semibold' };
      case 'normal':
        return { text: 'Normale', cls: 'text-slate-500 dark:text-slate-400' };
      case 'low':
        return { text: 'Basse', cls: 'text-slate-400 dark:text-slate-500' };
    }
  };

  const statusText = (task: WorkspaceTask) => {
    if (task.status === 'validated') {
      return { text: 'Finalisée & Validée', cls: 'text-emerald-600 dark:text-emerald-400 font-bold' };
    }
    if (task.status === 'done_pending_validation') {
      return { text: 'Réalisée (en attente validation)', cls: 'text-blue-600 dark:text-blue-400 font-bold' };
    }
    if (task.status === 'correction_needed') {
      return { text: 'Correction demandée', cls: 'text-rose-600 dark:text-rose-400 font-bold' };
    }
    if (task.dueDate < today) {
      return { text: 'En retard', cls: 'text-rose-600 dark:text-rose-400 font-bold' };
    }
    if (task.createdDate < today) {
      return { text: 'Reportée (jour précédent)', cls: 'text-amber-600 dark:text-amber-400 font-bold' };
    }
    return { text: 'À faire', cls: 'text-slate-600 dark:text-slate-300 font-semibold' };
  };

  const headerBorderClass =
    highlightVariant === 'priority'
      ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20'
      : highlightVariant === 'done'
      ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/10'
      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40';

  const handleSendCorrection = (taskId: string) => {
    if (!correctionText.trim()) return;
    requestTaskCorrection(taskId, correctionText.trim());
    setCorrectionText('');
    setCorrectionTaskId(null);
    showFeedback('Relance de correction envoyée et ajoutée aux tâches prioritaires.');
  };

  const handleAddComment = (taskId: string) => {
    if (!commentInput.trim()) return;
    addTaskComment(taskId, commentInput.trim(), 'info');
    setCommentInput('');
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
      {/* Section Header */}
      <div className={`px-5 py-3.5 border-b ${headerBorderClass} flex flex-col sm:flex-row sm:items-center justify-between gap-2`}>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {highlightVariant === 'priority' && <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />}
            {highlightVariant === 'done' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
            {highlightVariant === 'normal' && <Clock className="w-4 h-4 text-slate-500 shrink-0" />}
            <span>{title}</span>
            <span className="font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400">
              ({tasks.length})
            </span>
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {feedbackBanner && (
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            {feedbackBanner}
          </div>
        )}
      </div>

      {/* Tasks Rows */}
      {tasks.length === 0 ? (
        <div className="px-5 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
          {emptyMessage}
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {tasks.map(task => {
            const pInfo = priorityLabel(task.priority);
            const sInfo = statusText(task);
            const isExpanded = expandedTaskId === task.id;
            const isCorrecting = correctionTaskId === task.id;
            const isValidated = task.status === 'validated';

            return (
              <div
                key={task.id}
                className={`p-4 sm:px-5 transition-colors ${
                  isValidated ? 'bg-slate-50/40 dark:bg-slate-900/60' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: Task content, description & metadata */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                      <span
                        className={`text-sm font-bold ${
                          isValidated
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {task.title}
                      </span>
                      <span className={`text-xs ${sInfo.cls}`}>· {sInfo.text}</span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {task.description}
                      </p>
                    )}

                    {/* Correction banner if active */}
                    {task.status === 'correction_needed' && task.correctionNote && (
                      <div className="mt-1.5 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/70 text-xs text-rose-800 dark:text-rose-200">
                        <span className="font-bold">Correction demandée : </span>
                        {task.correctionNote}
                      </div>
                    )}

                    {/* Clean unboxed metadata row */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        Poste : {task.assignedPositionName}
                      </span>
                      {task.assignedToName && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Responsable : {task.assignedToName}</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">Échéance : {formatDate(task.dueDate, language)}</span>
                      <span aria-hidden="true">·</span>
                      <span className={pInfo.cls}>{pInfo.text}</span>
                      {task.reminderCount > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-amber-600 dark:text-amber-400 font-semibold tabular-nums">
                            {task.reminderCount} rappel(s)
                          </span>
                        </>
                      )}
                      {task.validatedBy && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-600 dark:text-emerald-400">
                            Validée par {task.validatedBy}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Action buttons + Checkbox BEHIND the task */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 lg:justify-end">
                    {/* Validate button (when checked done or needs direct validation) */}
                    {!isValidated && (
                      <button
                        type="button"
                        onClick={() => {
                          validateTask(task.id);
                          showFeedback(`Tâche « ${task.title} » finalisée et validée.`);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                        title="Confirmer la validation définitive de cette tâche"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Valider</span>
                      </button>
                    )}

                    {/* Reminder button */}
                    {!isValidated && (
                      <button
                        type="button"
                        onClick={() => {
                          sendTaskReminder(task.id);
                          showFeedback(`Rappel envoyé pour « ${task.title} ».`);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                        title="Envoyer un rappel au responsable"
                      >
                        <BellRing className="w-3.5 h-3.5 text-amber-500" />
                        <span>Rappel</span>
                      </button>
                    )}

                    {/* Correction Follow-up */}
                    <button
                      type="button"
                      onClick={() => {
                        setCorrectionTaskId(isCorrecting ? null : task.id);
                        setCorrectionText('');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                      title="Demander une correction / relancer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Correction</span>
                    </button>

                    {/* Comments / Text Updates */}
                    <button
                      type="button"
                      onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap tabular-nums"
                      title="Notes et échanges de suivi"
                    >
                      <MessageSquareText className="w-3.5 h-3.5" />
                      <span>{task.comments.length}</span>
                    </button>

                    {/* Edit Task */}
                    <button
                      type="button"
                      onClick={() => onEditTask(task)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Modifier la tâche"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Archive Task */}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Archiver la tâche « ${task.title} » ?`)) {
                          archiveTask(task.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Archiver cette tâche"
                    >
                      <Archive className="w-4 h-4" />
                    </button>

                    {/* CHECKBOX BEHIND THE TASK ("cocher derrière la tâche pour dire finalisée") */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isValidated) {
                          toggleTaskCheck(task.id, false);
                        } else {
                          toggleTaskCheck(task.id, !task.isCheckedDone);
                        }
                      }}
                      className={`ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                        task.isCheckedDone || isValidated
                          ? 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-emerald-500'
                      }`}
                      title={task.isCheckedDone ? 'Décochez pour rouvrir la tâche' : 'Cocher derrière la tâche : travail réalisé'}
                    >
                      {task.isCheckedDone || isValidated ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                      <span>{isValidated ? 'Validée' : task.isCheckedDone ? 'Réalisée' : 'Cocher fait'}</span>
                    </button>
                  </div>
                </div>

                {/* Inline Correction Form */}
                {isCorrecting && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Saisissez le motif ou la précision de correction attendue..."
                      value={correctionText}
                      onChange={e => setCorrectionText(e.target.value)}
                      className="flex-1 px-3 py-2 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSendCorrection(task.id)}
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap"
                      >
                        Envoyer la Relance
                      </button>
                      <button
                        type="button"
                        onClick={() => setCorrectionTaskId(null)}
                        className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                {/* Expandable Notes & Follow-up Thread */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    {task.comments.length === 0 ? (
                      <p className="text-xs text-slate-400">Aucune note de suivi pour cette tâche.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {task.comments.map(c => (
                          <div
                            key={c.id}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                          >
                            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                              <span className="font-bold text-slate-800 dark:text-slate-200">{c.authorName}</span>
                              <span className="tabular-nums">{formatDateTime(c.createdAt, language)}</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300">{c.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Écrire une note, une consigne complémentaire ou un compte-rendu..."
                        value={commentInput}
                        onChange={e => setCommentInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddComment(task.id);
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(task.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Ajouter</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
