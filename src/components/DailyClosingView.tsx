import React, { useState } from 'react';
import { 
  DollarSign, 
  ArrowDownRight, 
  ArrowUpRight, 
  Wallet, 
  Lock, 
  Unlock, 
  Save, 
  Trash2, 
  FileSpreadsheet, 
  Edit3, 
  Check, 
  AlertCircle,
  HelpCircle,
  Clock,
  Printer
} from 'lucide-react';
import { useCashRegister } from '../context/CashRegisterContext';
import { FastTransactionInput } from './FastTransactionInput';
import { formatCurrency, formatDateFull, formatDateBR, parseCurrencyInput } from '../utils/formatters';
import { exportClosingsToExcel } from '../utils/excelExport';

interface DailyClosingViewProps {
  onOpenExportModal: () => void;
}

export const DailyClosingView: React.FC<DailyClosingViewProps> = ({ onOpenExportModal }) => {
  const {
    selectedDate,
    currentClosing,
    addTransaction,
    deleteTransaction,
    updateInitialBalance,
    toggleClosingStatus,
    saveClosing,
    calculateDayTotals,
    getPreviousClosing,
    getPreviousFinalBalance,
  } = useCashRegister();

  const [isEditingInitial, setIsEditingInitial] = useState(false);
  const [initialInputVal, setInitialInputVal] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [notes, setNotes] = useState(currentClosing.notes || '');

  // sincroniza as notas quando mudo a data
  React.useEffect(() => {
    setNotes(currentClosing.notes || '');
    setIsEditingInitial(false);
  }, [selectedDate, currentClosing.notes]);

  const { totalEntradas, totalSaidas, finalBalance } = calculateDayTotals(currentClosing);
  const variacaoDia = totalEntradas - totalSaidas;

  const entradas = currentClosing.transactions.filter((t) => t.type === 'entrada');
  const saidas = currentClosing.transactions.filter((t) => t.type === 'saida');

  const isClosed = currentClosing.status === 'closed';
  const prevClosing = getPreviousClosing(selectedDate);
  const prevBalCalculated = getPreviousFinalBalance(selectedDate);

  const handleSaveNotes = () => {
    saveClosing({
      ...currentClosing,
      notes,
    });
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2500);
  };

  const handleSaveInitial = () => {
    const val = parseCurrencyInput(initialInputVal);
    updateInitialBalance(selectedDate, val);
    setIsEditingInitial(false);
  };

  const handleStartEditInitial = () => {
    setInitialInputVal(currentClosing.initialBalance.toFixed(2));
    setIsEditingInitial(true);
  };

  const handleExportCurrentDay = async () => {
    await exportClosingsToExcel({
      closings: [currentClosing],
      title: `Fechamento de Caixa - ${formatDateBR(selectedDate)}`,
      periodLabel: formatDateFull(selectedDate),
      fileName: `Fechamento_Caixa_${selectedDate}.xlsx`,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* aviso se o dia já foi fechado pra eu não mexer sem querer */}
      {isClosed && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                Caixa deste dia está FECHADO (Modo Somente Leitura)
              </h4>
              <p className="text-xs text-amber-800">
                Os valores estão protegidos contra edições acidentais. Clique no botão ao lado para desbloquear e fazer ajustes.
              </p>
            </div>
          </div>
          <button
            onClick={() => toggleClosingStatus(selectedDate)}
            className="px-4 py-2 bg-white hover:bg-amber-50 text-amber-900 text-xs font-bold rounded-xl border border-amber-300 shadow-sm transition flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Habilitar Edição</span>
          </button>
        </div>
      )}

      {/* cards de resumo com as contas feitas na hora */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* card 1: quanto tinha na abertura */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition relative group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-slate-600" />
              Saldo Inicial (Abertura)
            </span>
            {!isClosed && !isEditingInitial && (
              <button
                onClick={handleStartEditInitial}
                className="text-xs text-slate-400 hover:text-emerald-600 p-1 rounded-md hover:bg-slate-100 transition cursor-pointer"
                title="Ajustar saldo inicial manualmente"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {isEditingInitial ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={initialInputVal}
                onChange={(e) => setInitialInputVal(e.target.value)}
                placeholder="0,00"
                className="w-full text-lg font-bold border border-emerald-400 rounded-lg px-2 py-1 focus:outline-none ring-2 ring-emerald-200"
                autoFocus
              />
              <button
                onClick={handleSaveInitial}
                className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(currentClosing.initialBalance)}
            </div>
          )}

          <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
            {prevClosing ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                Trazido de {formatDateBR(prevClosing.date)}
              </span>
            ) : (
              <span className="text-slate-400">Primeiro dia registrado</span>
            )}
            {currentClosing.initialBalanceOverridden && (
              <span className="text-amber-600 font-semibold">(Ajustado manual)</span>
            )}
          </div>
        </div>

        {/* card 2: total que entrou */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <ArrowDownRight className="w-4 h-4 text-emerald-600" />
              Total de Entradas
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {entradas.length} {entradas.length === 1 ? 'recebimento' : 'recebimentos'}
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            +{formatCurrency(totalEntradas)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 truncate">
            Pix, Cartões e Dinheiro acumulados
          </div>
        </div>

        {/* card 3: total que saiu */}
        <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
              Total de Saídas
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
              {saidas.length} {saidas.length === 1 ? 'despesa' : 'despesas'}
            </span>
          </div>
          <div className="text-2xl font-black text-rose-600 tracking-tight">
            -{formatCurrency(totalSaidas)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 truncate">
            Fornecedores, Contas, Sangrias
          </div>
        </div>

        {/* card 4: saldo final no bolso */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-lg shadow-slate-900/10 transition relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Saldo Final do Dia
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                variacaoDia >= 0
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {variacaoDia >= 0 ? 'Lucro do Dia' : 'Déficit do Dia'}
            </span>
          </div>

          <div className="text-3xl font-black text-white tracking-tight">
            {formatCurrency(finalBalance)}
          </div>

          <div className="mt-2 text-xs text-slate-300 flex items-center justify-between">
            <span>Variação Líquida:</span>
            <span className={`font-bold ${variacaoDia >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {variacaoDia >= 0 ? '+' : ''}{formatCurrency(variacaoDia)}
            </span>
          </div>
        </div>
      </div>

      {/* lembrete da fórmula pra eu conferir a conta */}
      <div className="bg-slate-100/80 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-mono">
          <span className="font-semibold text-slate-700">Fórmula de Fechamento:</span>
          <span>Inicial ({formatCurrency(currentClosing.initialBalance)})</span>
          <span className="text-emerald-600 font-bold">+</span>
          <span>Entradas ({formatCurrency(totalEntradas)})</span>
          <span className="text-rose-600 font-bold">-</span>
          <span>Saídas ({formatCurrency(totalSaidas)})</span>
          <span className="font-bold text-slate-800">=</span>
          <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded shadow-xs">
            {formatCurrency(finalBalance)}
          </span>
        </div>
        <div className="text-slate-500">
          Data: <strong className="text-slate-800">{formatDateFull(selectedDate)}</strong>
        </div>
      </div>

      {/* barra rápida pra lançar os valores */}
      <FastTransactionInput
        onAddTransaction={(tx) => addTransaction(selectedDate, tx)}
        disabled={isClosed}
      />

      {/* duas colunas: entradas na esquerda e saídas na direita */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* coluna de entradas */}
        <div className="bg-white rounded-2xl border border-emerald-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-gradient-to-r from-emerald-50/80 to-white border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <ArrowDownRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Entradas / Receitas</h3>
                <p className="text-xs text-slate-500">
                  {entradas.length} {entradas.length === 1 ? 'registro' : 'registros'} neste dia
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Subtotal</span>
              <span className="text-base font-extrabold text-emerald-600">
                +{formatCurrency(totalEntradas)}
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto p-2">
            {entradas.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-400">
                <ArrowDownRight className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">Nenhuma entrada cadastrada hoje</p>
                <p className="text-xs mt-1">Utilize a barra rápida acima para lançar Pix, Cartões ou Dinheiro.</p>
              </div>
            ) : (
              entradas.map((item) => (
                <div
                  key={item.id}
                  className="p-3 hover:bg-emerald-50/40 rounded-xl transition flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5 shrink-0">
                      {item.time}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-800">
                          {item.description}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-extrabold text-emerald-600">
                      +{formatCurrency(item.amount)}
                    </span>
                    {!isClosed && (
                      <button
                        onClick={() => deleteTransaction(selectedDate, item.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded transition cursor-pointer"
                        title="Remover lançamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* coluna de saídas */}
        <div className="bg-white rounded-2xl border border-rose-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-gradient-to-r from-rose-50/80 to-white border-b border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Saídas / Despesas</h3>
                <p className="text-xs text-slate-500">
                  {saidas.length} {saidas.length === 1 ? 'registro' : 'registros'} neste dia
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Subtotal</span>
              <span className="text-base font-extrabold text-rose-600">
                -{formatCurrency(totalSaidas)}
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto p-2">
            {saidas.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-400">
                <ArrowUpRight className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">Nenhuma saída cadastrada hoje</p>
                <p className="text-xs mt-1">Utilize a barra rápida para lançar fornecedores, sangrias ou contas.</p>
              </div>
            ) : (
              saidas.map((item) => (
                <div
                  key={item.id}
                  className="p-3 hover:bg-rose-50/40 rounded-xl transition flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5 shrink-0">
                      {item.time}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-800">
                          {item.description}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-extrabold text-rose-600">
                      -{formatCurrency(item.amount)}
                    </span>
                    {!isClosed && (
                      <button
                        onClick={() => deleteTransaction(selectedDate, item.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded transition cursor-pointer"
                        title="Remover lançamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* anotações finais e botões de ação */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Observações / Anotações do Fechamento
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isClosed}
            placeholder="Ex: Troco deixado para o dia seguinte: R$ 100 em notas e moedas. Conferência por João."
            rows={2}
            className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 text-slate-800 placeholder-slate-400 resize-none disabled:bg-slate-50"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          
          {/* aviso de salvo com sucesso */}
          <div className="flex items-center gap-2">
            {saveSuccessMsg ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-3 py-1.5 rounded-lg animate-fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                Fechamento gravado com sucesso!
              </span>
            ) : (
              <span className="text-xs text-slate-500">
                {currentClosing.transactions.length} lançamentos gravados localmente
              </span>
            )}
          </div>

          {/* botões de fechar, salvar e baixar excel */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            
            {/* exportar esse dia pro excel */}
            <button
              onClick={handleExportCurrentDay}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar Dia (.xlsx)</span>
            </button>

            {/* salvar o dia */}
            <button
              onClick={handleSaveNotes}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Fechamento</span>
            </button>

            {/* travar ou reabrir o caixa */}
            <button
              onClick={() => toggleClosingStatus(selectedDate)}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                isClosed
                  ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-700/20'
              }`}
            >
              {isClosed ? (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Reabrir Caixa</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Concluir & Fechar Caixa</span>
                </>
              )}
            </button>

          </div>

        </div>
      </div>

    </div>
  );
};
