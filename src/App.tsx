import React, { useState } from 'react';
import { CashRegisterProvider, useCashRegister } from './context/CashRegisterContext';
import { Header } from './components/Header';
import { DailyClosingView } from './components/DailyClosingView';
import { HistoryView } from './components/HistoryView';
import { DashboardView } from './components/DashboardView';
import { ExcelExportModal } from './components/ExcelExportModal';
import { ShieldCheck, HardDrive, Keyboard } from 'lucide-react';

function MainApp() {
  const [activeTab, setActiveTab] = useState<'daily' | 'history' | 'dashboard'>('daily');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { setSelectedDate } = useCashRegister();

  const handleSelectDayFromHistory = (date: string) => {
    setSelectedDate(date);
    setActiveTab('daily');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      {/* topo da página com data e botões rápidos */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* miolo da tela de acordo com a aba que eu tiver */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'daily' && (
          <DailyClosingView onOpenExportModal={() => setIsExportModalOpen(true)} />
        )}

        {activeTab === 'history' && (
          <HistoryView onSelectDayToView={handleSelectDayFromHistory} />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView />
        )}
      </main>

      {/* janelinha pra configurar e baixar a planilha */}
      <ExcelExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* rodapé com atalhos de teclado e status */}
      <footer className="bg-white border-t border-slate-200/80 py-4 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
            <span className="font-medium text-slate-700">Agilizador de Fechamento de Caixa</span>
            <span className="text-slate-400">• Modo Off-line com LocalStorage</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Keyboard className="w-3.5 h-3.5" />
              Atalho: Pressione Enter para lançar rápido
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Exportação Excel Nativamente Formatada (.xlsx)
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <CashRegisterProvider>
      <MainApp />
    </CashRegisterProvider>
  );
}
