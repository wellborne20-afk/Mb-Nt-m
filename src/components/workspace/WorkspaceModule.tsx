import React, { useState } from 'react';
import {
  Briefcase,
  CheckSquare,
  MessageSquarePlus,
  ClipboardCheck,
  Plus,
  Search,
  Send,
  AlertTriangle,
  Check,
  ArrowRightCircle,
  Archive,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { TaskListSection } from './TaskListSection';
import { DailyReportView } from './DailyReportView';
import { PositionsManager } from './PositionsManager';
import { TaskPriority, WorkspaceTask } from '../../types';
import { formatDateTime } from '../../utils/formatters';

export const WorkspaceModule: React.FC = () => {
  const {
    currentTenant,
    currentUser,
    positions,
    addPosition,
    tasks,
    addTask,
    updateTask,
    workspaceMessages,
    addWorkspaceMessage,
    acknowledgeWorkspaceMessage,
    markMessageConvertedToTask,
    archiveWorkspaceMessage,
    employees,
    language,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tasks' | 'messages' | 'report' | 'positions'>('tasks');
  const [selectedPositionFilter, setSelectedPositionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);

  // Composer Mode inside Tasks/Messages: Quick Text Input Space
  const [composerMode, setComposerMode] = useState<'none' | 'task' | 'message'>('none');

  // Task Modal / Form State (Add & Edit)
  const [editingTask, setEditingTask] = useState<WorkspaceTask | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPositionName, setTaskPositionName] = useState('');
  const [taskAssigneeName, setTaskAssigneeName] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('normal');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [customNewPosteInput, setCustomNewPosteInput] = useState('');
  const [taskFormError, setTaskFormError] = useState<string | null>(null);

  // Quick Text Information Message Form State
  const [msgTitle, setMsgTitle] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [msgTargetPosition, setMsgTargetPosition] = useState('Toute l’entreprise');
  const [msgPriority, setMsgPriority] = useState<'normal' | 'important'>('normal');
  const [msgFormError, setMsgFormError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const openNewTaskComposer = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskPositionName(positions[0]?.title || '');
    setTaskAssigneeName(positions[0]?.assigneeName || '');
    setTaskPriority('normal');
    setTaskDueDate(today);
    setCustomNewPosteInput('');
    setTaskFormError(null);
    setComposerMode('task');
  };

  const openEditTaskModal = (task: WorkspaceTask) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskPositionName(task.assignedPositionName);
    setTaskAssigneeName(task.assignedToName);
    setTaskPriority(task.priority);
    setTaskDueDate(task.dueDate);
    setCustomNewPosteInput('');
    setTaskFormError(null);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      setTaskFormError('Veuillez saisir le titre de la tâche.');
      return;
    }

    let finalPosteName = taskPositionName.trim();
    if (finalPosteName === '__new__') {
      if (!customNewPosteInput.trim()) {
        setTaskFormError('Veuillez saisir le nom du nouveau poste ou en sélectionner un.');
        return;
      }
      finalPosteName = customNewPosteInput.trim();
      addPosition({
        title: finalPosteName,
        department: 'Général',
        assigneeName: taskAssigneeName.trim() || undefined,
      });
    }

    if (!finalPosteName) {
      finalPosteName = 'Équipe Générale';
    }

    const matchedPos = positions.find(p => p.title === finalPosteName);

    if (editingTask) {
      updateTask(editingTask.id, {
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        assignedPositionId: matchedPos?.id,
        assignedPositionName: finalPosteName,
        assignedToName: taskAssigneeName.trim(),
        priority: taskPriority,
        dueDate: taskDueDate,
      });
      setEditingTask(null);
    } else {
      addTask({
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        assignedPositionId: matchedPos?.id,
        assignedPositionName: finalPosteName,
        assignedToName: taskAssigneeName.trim(),
        createdByName: currentUser.name,
        priority: taskPriority,
        dueDate: taskDueDate,
        status: 'todo',
      });
      setComposerMode('none');
    }

    setTaskTitle('');
    setTaskDescription('');
    setTaskFormError(null);
  };

  const handlePublishMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgTitle.trim() || !msgContent.trim()) {
      setMsgFormError('Veuillez renseigner un objet et le texte du message à transmettre.');
      return;
    }
    addWorkspaceMessage({
      title: msgTitle.trim(),
      content: msgContent.trim(),
      authorName: currentUser.name,
      targetPositionName: msgTargetPosition,
      priority: msgPriority,
    });
    setMsgTitle('');
    setMsgContent('');
    setMsgPriority('normal');
    setMsgFormError(null);
    setComposerMode('none');
  };

  // Filter tasks by selected position & search query
  const visibleTasks = tasks.filter(t => {
    if (selectedPositionFilter !== 'all' && t.assignedPositionName !== selectedPositionFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.assignedPositionName.toLowerCase().includes(q) ||
        t.assignedToName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // PRIORITY SEPARATION:
  // 1. Remaining / Carry-over / Overdue / Correction Needed (Shown FIRST upon connection!)
  const remainingPriorityTasks = visibleTasks.filter(t => {
    if (t.status === 'validated') return false;
    const isCarryOver = t.createdDate < today || t.dueDate < today;
    const needsCorrection = t.status === 'correction_needed';
    const isCheckedWaitingValidation = t.status === 'done_pending_validation';
    const isUrgent = t.priority === 'urgent';
    return isCarryOver || needsCorrection || isCheckedWaitingValidation || isUrgent;
  });

  // 2. Today's New Tasks (only non-completed, created today, not overdue/correction/urgent already above)
  const remainingIds = new Set(remainingPriorityTasks.map(t => t.id));
  const todayNewTasks = visibleTasks.filter(
    t => t.status !== 'validated' && !remainingIds.has(t.id)
  );

  // 3. Finalized & Validated Tasks
  const validatedTasks = visibleTasks.filter(t => t.status === 'validated');

  // Filter messages
  const visibleMessages = workspaceMessages.filter(m => {
    if (
      selectedPositionFilter !== 'all' &&
      m.targetPositionName !== 'Toute l’entreprise' &&
      m.targetPositionName !== selectedPositionFilter
    ) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q) ||
        m.targetPositionName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const unreadMessagesCount = workspaceMessages.filter(
    m => !m.acknowledgedBy.includes(currentUser.name)
  ).length;

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {language === 'fr'
              ? 'Espace de Travail, Tâches & Informations'
              : 'Team Workspace & Task Coordination'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {currentTenant.name} · Centralisez vos consignes, assignez par poste, suivez les validations et produisez vos rapports journaliers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setComposerMode(composerMode === 'message' ? 'none' : 'message');
              setActiveTab(composerMode === 'message' ? activeTab : 'messages');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
          >
            <MessageSquarePlus className="w-4 h-4 text-emerald-600" />
            <span>Transmettre une Info</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (composerMode === 'task') {
                setComposerMode('none');
              } else {
                setActiveTab('tasks');
                openNewTaskComposer();
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Tâche</span>
          </button>
        </div>
      </div>

      {/* Priority Check Banner when user connects and has remaining tasks */}
      {(remainingPriorityTasks.length > 0 || unreadMessagesCount > 0) && activeTab === 'tasks' && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Priorité d’ouverture de journée · {remainingPriorityTasks.length} tâche(s) en attente ou à corriger
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Traitez et cochez d’abord les tâches restantes ci-dessous avant de démarrer vos nouvelles tâches du jour.
                {unreadMessagesCount > 0 && ` Vous avez également ${unreadMessagesCount} information(s) non lue(s).`}
              </p>
            </div>
          </div>

          {unreadMessagesCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('messages')}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100/60 cursor-pointer whitespace-nowrap shrink-0"
            >
              Lire les infos ({unreadMessagesCount})
            </button>
          )}
        </div>
      )}

      {/* Navigation Tabs + Position Scope Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'bg-slate-900 text-white dark:bg-emerald-600'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tâches & Priorités</span>
            <span className="font-mono tabular-nums opacity-80">
              ({remainingPriorityTasks.length + todayNewTasks.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('messages')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'messages'
                ? 'bg-slate-900 text-white dark:bg-emerald-600'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Informations Transmises</span>
            {unreadMessagesCount > 0 && (
              <span className="font-mono tabular-nums text-amber-500">({unreadMessagesCount})</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'report'
                ? 'bg-slate-900 text-white dark:bg-emerald-600'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Rapport Journalier</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('positions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'positions'
                ? 'bg-slate-900 text-white dark:bg-emerald-600'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Postes de l’Entreprise</span>
            <span className="font-mono tabular-nums opacity-80">({positions.length})</span>
          </button>
        </div>

        {/* Position / Search Filter (shown on tasks and messages tabs) */}
        {(activeTab === 'tasks' || activeTab === 'messages') && (
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedPositionFilter}
              onChange={e => setSelectedPositionFilter(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
              title="Filtrer selon le poste de travail"
            >
              <option value="all">Tous les postes</option>
              {positions.map(p => (
                <option key={p.id} value={p.title}>
                  Poste : {p.title}{p.assigneeName ? ` (${p.assigneeName})` : ''}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher texte, personne..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48 sm:w-56"
              />
            </div>
          </div>
        )}
      </div>

      {/* Inline Text Composer: New Task */}
      {composerMode === 'task' && (
        <form
          onSubmit={handleSaveTask}
          className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Saisir et Transmettre une Nouvelle Tâche
            </h3>
            <button
              type="button"
              onClick={() => setComposerMode('none')}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Fermer
            </button>
          </div>

          {taskFormError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300">
              {taskFormError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Intitulé de la Tâche *
              </label>
              <input
                type="text"
                placeholder="Ex : Relancer facture client BTP, Vérifier stock carburant..."
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Priorité
                </label>
                <select
                  value={taskPriority}
                  onChange={e => setTaskPriority(e.target.value as TaskPriority)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="low">Basse</option>
                  <option value="normal">Normale</option>
                  <option value="high">Haute priorité</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date d’échéance
                </label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={e => setTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Poste Destinataire (défini par l’entreprise)
              </label>
              <select
                value={taskPositionName}
                onChange={e => {
                  const val = e.target.value;
                  setTaskPositionName(val);
                  const found = positions.find(p => p.title === val);
                  if (found?.assigneeName) setTaskAssigneeName(found.assigneeName);
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="">Équipe Générale (non ciblé)</option>
                {positions.map(p => (
                  <option key={p.id} value={p.title}>
                    {p.title} ({p.department})
                  </option>
                ))}
                <option value="__new__">+ Créer un nouveau poste manuellement...</option>
              </select>

              {taskPositionName === '__new__' && (
                <input
                  type="text"
                  placeholder="Nom du nouveau poste (ex : Magasinier, Caissière)..."
                  value={customNewPosteInput}
                  onChange={e => setCustomNewPosteInput(e.target.value)}
                  className="mt-2 w-full px-3 py-2 bg-white dark:bg-slate-800 border border-emerald-400 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Personne Responsable
              </label>
              <input
                type="text"
                list="workspace-assignees"
                placeholder="Nom du collaborateur chargé de l'exécution..."
                value={taskAssigneeName}
                onChange={e => setTaskAssigneeName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
              <datalist id="workspace-assignees">
                {employees.map(emp => (
                  <option key={emp.id} value={`${emp.firstName} ${emp.lastName}`} />
                ))}
                {positions
                  .filter(p => p.assigneeName)
                  .map(p => (
                    <option key={p.id} value={p.assigneeName} />
                  ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Espace Texte — Instructions, détails & informations complètes
            </label>
            <textarea
              rows={3}
              placeholder="Saisissez ici toutes les informations et consignes précises pour éviter les oublis et les allers-retours..."
              value={taskDescription}
              onChange={e => setTaskDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setComposerMode('none')}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Transmettre la Tâche</span>
            </button>
          </div>
        </form>
      )}

      {/* Inline Text Composer: New Information Message */}
      {composerMode === 'message' && (
        <form
          onSubmit={handlePublishMessage}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Transmettre une Information / Note Interne
            </h3>
            <button
              type="button"
              onClick={() => setComposerMode('none')}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Fermer
            </button>
          </div>

          {msgFormError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300">
              {msgFormError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Objet de l’information *
              </label>
              <input
                type="text"
                placeholder="Ex : Changement d'horaire livraison, Consigne caisse du jour..."
                value={msgTitle}
                onChange={e => setMsgTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Destinataire / Poste
              </label>
              <select
                value={msgTargetPosition}
                onChange={e => setMsgTargetPosition(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="Toute l’entreprise">Toute l’entreprise</option>
                {positions.map(p => (
                  <option key={p.id} value={p.title}>
                    Poste : {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Texte complet de l’information à transmettre *
            </label>
            <textarea
              rows={4}
              placeholder="Rédigez ici votre note d'information, compte-rendu ou directive. Toute l'équipe pourra la consulter et la transformer en tâche si nécessaire..."
              value={msgContent}
              onChange={e => setMsgContent(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={msgPriority === 'important'}
                onChange={e => setMsgPriority(e.target.checked ? 'important' : 'normal')}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Marquer comme information importante / urgente</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setComposerMode('none')}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publier l’Information</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 1: TASKS & DAILY PRIORITIES */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* 1. ALWAYS FIRST: Remaining / Carry-over / Overdue / Correction Needed */}
          <TaskListSection
            title="1. Tâches restantes à finaliser en priorité"
            subtitle="Reports des jours précédents, retards, relances de correction et tâches cochées en attente de validation"
            tasks={remainingPriorityTasks}
            emptyMessage="Aucune tâche restante des jours précédents ni correction en attente. Vous êtes à jour pour démarrer les nouvelles tâches."
            highlightVariant="priority"
            onEditTask={openEditTaskModal}
          />

          {/* 2. TODAY'S NEW TASKS */}
          <TaskListSection
            title="2. Nouvelles tâches du jour"
            subtitle="Tâches créées aujourd’hui — cochez la case à droite dès qu’une tâche est réalisée, puis validez"
            tasks={todayNewTasks}
            emptyMessage="Aucune nouvelle tâche enregistrée pour aujourd’hui. Cliquez sur « Nouvelle Tâche » pour en créer une."
            highlightVariant="normal"
            onEditTask={openEditTaskModal}
          />

          {/* 3. COMPLETED & VALIDATED TASKS */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowCompleted(!showCompleted)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              {showCompleted ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>
                {showCompleted ? 'Masquer' : 'Afficher'} les tâches finalisées et validées ({validatedTasks.length})
              </span>
            </button>

            {showCompleted && (
              <TaskListSection
                title="3. Tâches finalisées & validées"
                subtitle="Travaux vérifiés, cochés et clôturés"
                tasks={validatedTasks}
                emptyMessage="Aucune tâche encore validée."
                highlightVariant="done"
                onEditTask={openEditTaskModal}
              />
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INFORMATION TRANSMISSIONS */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          {visibleMessages.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3">
              <MessageSquarePlus className="w-9 h-9 text-slate-300 dark:text-slate-600 mx-auto" />
              <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Aucune information transmise pour le moment
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Centralisez ici toutes les notes, consignes et messages opérationnels qui se perdent habituellement sur WhatsApp.
              </p>
              <button
                type="button"
                onClick={() => setComposerMode('message')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Saisir une première information</span>
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
              {visibleMessages.map(msg => {
                const hasAck = msg.acknowledgedBy.includes(currentUser.name);

                return (
                  <div key={msg.id} className="p-5 space-y-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{msg.title}</h4>
                          {msg.priority === 'important' && (
                            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                              · Important
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Par {msg.authorName} · Destinataire : <span className="font-semibold text-slate-700 dark:text-slate-200">{msg.targetPositionName}</span> ·{' '}
                          <span className="tabular-nums">{formatDateTime(msg.createdAt, language)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {!hasAck ? (
                          <button
                            type="button"
                            onClick={() => acknowledgeWorkspaceMessage(msg.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Lu & Pris en compte</span>
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            Lu ({msg.acknowledgedBy.length})
                          </span>
                        )}

                        {!msg.convertedToTaskId && (
                          <button
                            type="button"
                            onClick={() => {
                              const newId = addTask({
                                title: msg.title,
                                description: msg.content,
                                assignedPositionName:
                                  msg.targetPositionName === 'Toute l’entreprise'
                                    ? positions[0]?.title || 'Équipe Générale'
                                    : msg.targetPositionName,
                                assignedToName:
                                  positions.find(p => p.title === msg.targetPositionName)?.assigneeName || '',
                                createdByName: currentUser.name,
                                priority: msg.priority === 'important' ? 'high' : 'normal',
                                dueDate: today,
                                status: 'todo',
                              });
                              markMessageConvertedToTask(msg.id, newId);
                              setActiveTab('tasks');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer whitespace-nowrap"
                            title="Transformer cette information en tâche suivie avec case à cocher"
                          >
                            <ArrowRightCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Convertir en Tâche</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Archiver cette note d’information ?')) {
                              archiveWorkspaceMessage(msg.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Archiver"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {msg.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DAILY WORK REPORT */}
      {activeTab === 'report' && <DailyReportView />}

      {/* TAB 4: COMPANY POSITIONS (MANUALLY DEFINED) */}
      {activeTab === 'positions' && <PositionsManager />}

      {/* MODAL: EDIT EXISTING TASK */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Modifier la Tâche"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          {taskFormError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300">
              {taskFormError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Intitulé de la Tâche *
            </label>
            <input
              type="text"
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Poste Destinataire
              </label>
              <select
                value={taskPositionName}
                onChange={e => setTaskPositionName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value="Équipe Générale">Équipe Générale</option>
                {positions.map(p => (
                  <option key={p.id} value={p.title}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Personne Responsable
              </label>
              <input
                type="text"
                value={taskAssigneeName}
                onChange={e => setTaskAssigneeName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Priorité
              </label>
              <select
                value={taskPriority}
                onChange={e => setTaskPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value="low">Basse</option>
                <option value="normal">Normale</option>
                <option value="high">Haute priorité</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date d’échéance
              </label>
              <input
                type="date"
                value={taskDueDate}
                onChange={e => setTaskDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Instructions / Texte détaillé
            </label>
            <textarea
              rows={4}
              value={taskDescription}
              onChange={e => setTaskDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingTask(null)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Enregistrer les Modifications
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
