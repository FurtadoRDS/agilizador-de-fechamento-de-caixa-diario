import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Check, 
  Download, 
  Calendar, 
  Layers, 
  Sparkles, 
  FileText 
} from 'lucide-react';
import { useCashRegister } from '../context/CashRegisterContext';
import { exportClosingsToExcel } from '../utils/excelExport';
import { formatDateBR, formatDateFull } from '../utils/formatters';

interface ExcelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExcelExportModal: React.FC<ExcelExportModalProps> = ({ isOpen, onClose }) => {
  const { closings, selectedDate } = useCashRegister();
  const [scope, setScope] = useState<'selected' | 'week' | 'month' | 'year' | 'all'>('month');
  const [customTitle, setCustomTitle] = useState('Fechamento de Caixa Diário');
  const [isExporting, setIsExporting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const allClosings = Object.values(closings);
  const now = new Date();

  // filtro os dias pelo período que escolhi
  const getClosingsForScope = () => {
    if (scope === 'selected') {
      const single = closings[selectedDate];
      return single ? [single] : [];
    }

    return allClosings.filter((c) => {
      if (scope === 'all') return true;
      const [y, m, d] = c.date.split('-').map(Number);
      const cDate = new Date(y, m - 1, d);

      if (scope === 'week') {
        const diffDays = (now.getTime() - cDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= -1 && diffDays <= 7;
      }
      if (scope === 'month') {
        return cDate.getMonth() === now.getMonth() && cDate.getFullYear() === now.getFullYear();
      }
      if (scope === 'year') {
        return cDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const targetClosings = getClosingsForScope();
  const totalEntriesCount = targetClosings.reduce((sum, c) => sum + c.transactions.length, 0);

  const getScopeLabel = () => {
    switch (scope) {
      case 'selected':
        return `Apenas o dia ${formatDateBR(selectedDate)}`;
      case 'week':
        return 'Semana Atual (Últimos 7 dias)';
      case 'month':
        return `Mês Atual (${now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })})`;
      case 'year':
        return `Ano Atual (${now.getFullYear()})`;
      case 'all':
        return `Todo o Histórico (${targetClosings.length} dias)`;
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const fileName = `Fechamento_Caixa_${scope}_${new Date().toISOString().split('T')[0]}.xlsx`;
      await exportClosingsToExcel({
        closings: targetClosings,
        title: customTitle,
        periodLabel: getScopeLabel(),
        fileName,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Erro ao exportar Excel:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        
        {/* topo do modal */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileSpreadsheet className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">Exportar para Excel (.xlsx)</h3>
              <p className="text-xs text-emerald-200">
                Planilha nativa formatada profissionalmente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* corpo do modal */}
        <div className="p-6 space-y-5">
          
          {/* botões de escolha do período */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Selecione o Período a Exportar
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScope('selected')}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition cursor-pointer ${
                  scope === 'selected'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="block font-bold">Dia Selecionado</span>
                <span className="text-[11px] text-slate-500">{formatDateBR(selectedDate)}</span>
              </button>

              <button
                type="button"
                onClick={() => setScope('week')}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition cursor-pointer ${
                  scope === 'week'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="block font-bold">Semana Atual</span>
                <span className="text-[11px] text-slate-500">Últimos 7 dias</span>
              </button>

              <button
                type="button"
                onClick={() => setScope('month')}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition cursor-pointer ${
                  scope === 'month'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="block font-bold">Mês Atual</span>
                <span className="text-[11px] text-slate-500">Mês corrente completo</span>
              </button>

              <button
                type="button"
                onClick={() => setScope('all')}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition cursor-pointer ${
                  scope === 'all'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="block font-bold">Todo o Histórico</span>
                <span className="text-[11px] text-slate-500">{allClosings.length} dias cadastrados</span>
              </button>
            </div>
          </div>

          {/* título personalizado pro cabeçalho */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Título do Cabeçalho da Planilha
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Nome da sua loja ou empresa"
            />
          </div>

          {/* lembrete do que vem na planilha */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Recursos inclusos no arquivo nativo .xlsx:
            </span>
            <ul className="space-y-1.5 text-[11px] pl-1 text-slate-600">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span><strong>Aba 1:</strong> Lançamentos Detalhados com formatação contábil (R$)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span><strong>Aba 2:</strong> Totais e Resumo Diário com Saldo Inicial, Entradas, Saídas e Saldo Final</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span><strong>Aba 3:</strong> Resumo por Categorias com percentuais calculados</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cabeçalhos com cores de fundo estilizadas e larguras ajustadas</span>
              </li>
            </ul>
          </div>

          {/* contagem de dias e lançamentos */}
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Dias incluídos: <strong>{targetClosings.length}</strong></span>
            <span>Total de lançamentos: <strong>{totalEntriesCount}</strong></span>
          </div>

        </div>

        {/* rodapé com botões de fechar ou baixar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition"
          >
            Cancelar
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting || targetClosings.length === 0}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-md transition cursor-pointer ${
              isSuccess
                ? 'bg-emerald-700'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-700/20 active:scale-95'
            }`}
          >
            {isSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Arquivo Baixado!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Gerando Planilha...' : 'Baixar Arquivo .xlsx'}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
