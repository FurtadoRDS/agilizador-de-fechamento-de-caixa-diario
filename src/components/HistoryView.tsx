import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  ArrowDownRight, 
  ArrowUpRight, 
  FileSpreadsheet, 
  Eye, 
  Edit3, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  Search,
  CalendarDays
} from 'lucide-react';
import { useCashRegister } from '../context/CashRegisterContext';
import { formatCurrency, formatDateBR, formatDateFull } from '../utils/formatters';
import { exportClosingsToExcel } from '../utils/excelExport';
import { DailyClosing } from '../types';

interface HistoryViewProps {
  onSelectDayToView: (date: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onSelectDayToView }) => {
  const { closings, calculateDayTotals, toggleClosingStatus } = useCashRegister();
  const [filterStatus, setFilterStatus] = useState<'all' | 'closed' | 'open'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const allClosings = Object.values(closings).sort((a, b) => b.date.localeCompare(a.date));

  const filteredClosings = allClosings.filter((c) => {
    if (filterStatus === 'closed' && c.status !== 'closed') return false;
    if (filterStatus === 'open' && c.status !== 'open') return false;
    if (searchTerm) {
      const formatted = formatDateBR(c.date);
      const full = formatDateFull(c.date).toLowerCase();
      const term = searchTerm.toLowerCase();
      const hasInNotes = c.notes?.toLowerCase().includes(term);
      const hasInTx = c.transactions.some(
        (t) =>
          t.description.toLowerCase().includes(term) ||
          t.category.toLowerCase().includes(term)
      );
      return formatted.includes(term) || full.includes(term) || hasInNotes || hasInTx;
    }
    return true;
  });

  const handleExportSingleDay = async (closing: DailyClosing, e: React.MouseEvent) => {
    e.stopPropagation();
    await exportClosingsToExcel({
      closings: [closing],
      title: `Fechamento de Caixa - ${formatDateBR(closing.date)}`,
      periodLabel: formatDateFull(closing.date),
      fileName: `Fechamento_Caixa_${closing.date}.xlsx`,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* cabeçalho e filtros do histórico */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-600" />
            Histórico de Fechamentos Anteriores
          </h2>
          <p className="text-xs text-slate-500">
            Navegue pelos dias cadastrados, visualize lançamentos detalhados ou abra para edição.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* campo de busca */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por data, categoria, item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          {/* filtro por status */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterStatus('all')}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({allClosings.length})
            </button>
            <button
              onClick={() => setFilterStatus('closed')}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                filterStatus === 'closed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fechados
            </button>
            <button
              onClick={() => setFilterStatus('open')}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                filterStatus === 'open'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Em Aberto
            </button>
          </div>
        </div>
      </div>

      {/* lista dos dias passados */}
      {filteredClosings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">Nenhum dia encontrado</h3>
          <p className="text-xs text-slate-500 mt-1">
            Nenhum fechamento corresponde aos filtros atuais.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClosings.map((closing) => {
            const { totalEntradas, totalSaidas, finalBalance } = calculateDayTotals(closing);
            const variacao = totalEntradas - totalSaidas;
            const isClosed = closing.status === 'closed';
            const isExpanded = expandedDate === closing.date;

            const entradasList = closing.transactions.filter((t) => t.type === 'entrada');
            const saidasList = closing.transactions.filter((t) => t.type === 'saida');

            return (
              <div
                key={closing.date}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition overflow-hidden"
              >
                {/* resumo do dia no card */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* data e status */}
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-bold shrink-0 ${
                        isClosed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-semibold leading-none">
                        {closing.date.split('-')[1]}/{closing.date.split('-')[0].substring(2)}
                      </span>
                      <span className="text-base font-extrabold leading-none mt-1">
                        {closing.date.split('-')[2]}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          {formatDateFull(closing.date)}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isClosed
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isClosed ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Fechado</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Em Aberto</span>
                            </>
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {closing.transactions.length} lançamentos | Saldo Abertura: {formatCurrency(closing.initialBalance)}
                      </p>
                    </div>
                  </div>

                  {/* métricas de grana do dia */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-6 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-emerald-700 block">
                        + Entradas
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-600">
                        {formatCurrency(totalEntradas)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-rose-700 block">
                        - Saídas
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-rose-600">
                        {formatCurrency(totalSaidas)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-700 block">
                        = Saldo Final
                      </span>
                      <span className="text-xs sm:text-sm font-black text-slate-900">
                        {formatCurrency(finalBalance)}
                      </span>
                    </div>
                  </div>

                  {/* botões de ação */}
                  <div className="flex items-center gap-2 justify-end">
                    
                    {/* abrir/fechar prévia rápida */}
                    <button
                      onClick={() => setExpandedDate(isExpanded ? null : closing.date)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isExpanded ? 'Ocultar' : 'Ver Itens'}</span>
                    </button>

                    {/* exportar esse dia pro excel */}
                    <button
                      onClick={(e) => handleExportSingleDay(closing, e)}
                      className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200 transition cursor-pointer"
                      title="Exportar este dia para Excel"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    </button>

                    {/* carregar dia na tela principal */}
                    <button
                      onClick={() => onSelectDayToView(closing.date)}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{isClosed ? 'Visualizar' : 'Editar'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

                {/* gaveta com detalhes do dia */}
                {isExpanded && (
                  <div className="bg-slate-50/90 border-t border-slate-200 p-4 sm:p-5 space-y-4 animate-fade-in">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* lista de entradas */}
                      <div className="bg-white rounded-xl p-3 border border-emerald-200/60">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs font-bold text-emerald-800">
                          <span className="flex items-center gap-1">
                            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
                            Entradas ({entradasList.length})
                          </span>
                          <span>+{formatCurrency(totalEntradas)}</span>
                        </div>
                        {entradasList.length === 0 ? (
                          <p className="text-xs text-slate-400 py-2">Nenhuma entrada</p>
                        ) : (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {entradasList.map((t) => (
                              <div
                                key={t.id}
                                className="flex items-center justify-between text-xs py-1 px-1.5 hover:bg-slate-50 rounded"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400">{t.time}</span>
                                  <span className="font-semibold text-slate-800">{t.description}</span>
                                  <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1 rounded">
                                    {t.category}
                                  </span>
                                </div>
                                <span className="font-bold text-emerald-600">
                                  +{formatCurrency(t.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* lista de saídas */}
                      <div className="bg-white rounded-xl p-3 border border-rose-200/60">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs font-bold text-rose-800">
                          <span className="flex items-center gap-1">
                            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                            Saídas ({saidasList.length})
                          </span>
                          <span>-{formatCurrency(totalSaidas)}</span>
                        </div>
                        {saidasList.length === 0 ? (
                          <p className="text-xs text-slate-400 py-2">Nenhuma saída</p>
                        ) : (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {saidasList.map((t) => (
                              <div
                                key={t.id}
                                className="flex items-center justify-between text-xs py-1 px-1.5 hover:bg-slate-50 rounded"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400">{t.time}</span>
                                  <span className="font-semibold text-slate-800">{t.description}</span>
                                  <span className="text-[9px] bg-rose-50 text-rose-700 px-1 rounded">
                                    {t.category}
                                  </span>
                                </div>
                                <span className="font-bold text-rose-600">
                                  -{formatCurrency(t.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {closing.notes && (
                      <div className="bg-amber-50/50 border border-amber-200/60 p-2.5 rounded-xl text-xs text-amber-900">
                        <span className="font-bold block mb-0.5">Observações registradas:</span>
                        {closing.notes}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => toggleClosingStatus(closing.date)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                      >
                        {isClosed ? 'Marcar como Em Aberto' : 'Marcar como Fechado'}
                      </button>
                      <button
                        onClick={() => onSelectDayToView(closing.date)}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Abrir na Tela Principal de Fechamento</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
