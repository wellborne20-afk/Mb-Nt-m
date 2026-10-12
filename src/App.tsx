/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardModule } from './components/dashboard/DashboardModule';
import { CashJournalModule } from './components/finances/CashJournalModule';
import { InvoicingModule } from './components/invoices/InvoicingModule';
import { HumanResourcesModule } from './components/hr/HumanResourcesModule';
import { PayrollModule } from './components/payroll/PayrollModule';
import { AssetManagementModule } from './components/assets/AssetManagementModule';
import { CrmModule } from './components/crm/CrmModule';
import { ReportsModule } from './components/reports/ReportsModule';
import { AuditLogModule } from './components/audit/AuditLogModule';
import { SettingsModule } from './components/settings/SettingsModule';
import { AuthModule } from './components/auth/AuthModule';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { ModuleLockedScreen } from './components/common/ModuleLockedScreen';
import { ERPModuleId } from './types';

const MainLayout: React.FC = () => {
  const { activeModule, isAuthenticated, isSuperAdmin, isImpersonating, isModuleAccessible } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <AuthModule />;
  }

  // If Super Admin is logged in and not impersonating a client, show the Master Super Admin console
  if (isSuperAdmin && !isImpersonating) {
    return <SuperAdminDashboard />;
  }

  const renderModule = () => {
    // Check if the current module is locked (expired or not subscribed)
    const subscriptionControlledModules: ERPModuleId[] = [
      'finances',
      'invoices',
      'hr',
      'payroll',
      'assets',
      'crm',
      'reports'
    ];

    if (subscriptionControlledModules.includes(activeModule as ERPModuleId)) {
      if (!isModuleAccessible(activeModule as ERPModuleId)) {
        return <ModuleLockedScreen moduleId={activeModule as ERPModuleId} />;
      }
    }

    switch (activeModule) {
      case 'dashboard':
        return <DashboardModule />;
      case 'finances':
        return <CashJournalModule />;
      case 'invoices':
        return <InvoicingModule />;
      case 'hr':
        return <HumanResourcesModule />;
      case 'payroll':
        return <PayrollModule />;
      case 'assets':
        return <AssetManagementModule />;
      case 'crm':
        return <CrmModule />;
      case 'reports':
        return <ReportsModule />;
      case 'audit':
        return <AuditLogModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <DashboardModule />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
          {renderModule()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
