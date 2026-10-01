import React from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  FileSpreadsheet, 
  RotateCcw,
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  History, 
  LayoutDashboard
} from 'lucide-react';
import { useCashRegister } from '../context/CashRegisterContext';
import { formatDateBR, getPreviousDateString, getNextDateString, getTodayDateString } from '../utils/formatters';

interface HeaderProps {
  activeTab: 'daily' | 'history' | 'dashboard';
  setActiveTab: (tab: 'daily' | 'history' | 'dashboard') => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenExportModal,
}) => {
  const {
    selectedDate,
    setSelectedDate,
    currentClosing,
    clearAllData,
  } = useCashRegister();

  const today = getTodayDateString();
  const isToday = selectedDate === today;
  const isClosed = currentClosing.status === 'closed';

  const handlePrevDay = () => {
    setSelectedDate(getPreviousDateString(selectedDate));
  };

  const handleNextDay = () => {
    setSelectedDate(getNextDateString(selectedDate));
  };

  const handleGoToday = () => {
    setSelectedDate(today);
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          
          {/* logo e nome do app */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-emerald-500/20 shadow-lg">
                <TrendingUp className="w-6 h-6 text-slate-950 font-bold" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                    Agilizador de Caixa
                  </h1>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Diário Express
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Fechamento ágil e relatórios contábeis em Excel
                </p>
              </div>
            </div>

            {/* botãozinho do excel no celular */}
            <div className="flex md:hidden items-center gap-1">
              <button
                onClick={onOpenExportModal}
                className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30"
                title="Exportar para Excel"
              >
                <FileSpreadsheet className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* seletor rápido de data (ontem, hoje, amanhã) */}
          <div className="flex items-center justify-center bg-slate-800/80 rounded-xl p-1 border border-slate-700/60 shadow-inner">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="Dia anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center px-3 gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
              />
              <span className="text-xs text-slate-400 hidden sm:inline">
                ({formatDateBR(selectedDate)})
              </span>
            </div>

            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="Próximo dia"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {!isToday && (
              <button
                onClick={handleGoToday}
                className="ml-2 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-700 text-emerald-400 hover:bg-slate-600 border border-slate-600 transition"
              >
                Ir para Hoje
              </button>
            )}
          </div>

          {/* status do caixa e botões de ação */}
          <div className="flex items-center justify-end gap-2.5">
            {/* indicador se o dia tá aberto ou fechado */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                isClosed
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                  : 'bg-amber-950/50 text-amber-300 border-amber-500/40'
              }`}
            >
              {isClosed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Caixa Fechado</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Caixa em Aberto</span>
                </>
              )}
            </div>

            {/* botão de exportar pro excel */}
            <button
              onClick={onOpenExportModal}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 transition transform active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Excel</span>
            </button>

            {/* botão pra zerar tudo do zero */}
            <button
              onClick={() => {
                if (window.confirm('Deseja realmente zerar todos os dados e começar com o caixa limpo?')) {
                  clearAllData();
                }
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
              title="Zerar todos os lançamentos"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* abas de navegação */}
        <div className="flex border-t border-slate-800/80 -mb-px space-x-1 sm:space-x-4 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex items-center gap-2 py-2 px-3 text-xs sm:text-sm font-medium border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'daily'
                ? 'border-emerald-400 text-emerald-400 bg-slate-800/40 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Fechamento Diário</span>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
              {formatDateBR(selectedDate)}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 py-2 px-3 text-xs sm:text-sm font-medium border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'border-emerald-400 text-emerald-400 bg-slate-800/40 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Histórico de Dias</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 py-2 px-3 text-xs sm:text-sm font-medium border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'border-emerald-400 text-emerald-400 bg-slate-800/40 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard & Resumos</span>
          </button>
        </div>
      </div>
    </header>
  );
};
