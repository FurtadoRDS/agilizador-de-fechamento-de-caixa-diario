import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowDownRight, 
  ArrowUpRight, 
  FileSpreadsheet, 
  Calendar, 
  AlertTriangle, 
  Award, 
  PieChart, 
  BarChart3,
  CalendarCheck2
} from 'lucide-react';
import { useCashRegister } from '../context/CashRegisterContext';
import { formatCurrency, formatDateBR } from '../utils/formatters';
import { exportClosingsToExcel } from '../utils/excelExport';

export const DashboardView: React.FC = () => {
  const { getPeriodSummary, closings, calculateDayTotals } = useCashRegister();
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [isExporting, setIsExporting] = useState(false);

  const summary = getPeriodSummary(period);

  const periodLabels = {
    week: 'Últimos 7 dias / Semana Atual',
    month: 'Mês Atual',
    year: 'Ano Atual',
    all: 'Todo o Histórico',
  };

  const handleExportPeriodExcel = async () => {
    setIsExporting(true);
    try {
      const allClosings = Object.values(closings);
      const now = new Date();

      const filtered = allClosings.filter((c) => {
        if (period === 'all') return true;
        const [y, m, d] = c.date.split('-').map(Number);
        const cDate = new Date(y, m - 1, d);

        if (period === 'week') {
          const diffTime = now.getTime() - cDate.getTime();
          const diffDays = diffTime / (1000 * 3600 * 24);
          return diffDays >= -1 && diffDays <= 7;
        }
        if (period === 'month') {
          return cDate.getMonth() === now.getMonth() && cDate.getFullYear() === now.getFullYear();
        }
        if (period === 'year') {
          return cDate.getFullYear() === now.getFullYear();
        }
        return true;
      });

      await exportClosingsToExcel({
        closings: filtered,
        title: `Relatório Consolidado - ${periodLabels[period]}`,
        periodLabel: periodLabels[period],
        fileName: `Relatorio_Caixa_${period}_${new Date().toISOString().split('T')[0]}.xlsx`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* topo: seletor de período e botão pra baixar o relatório em excel */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Dashboard & Relatórios Financeiros
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhe o faturamento, controle de despesas e lucratividade acumulada.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* botões pra trocar entre semana, mês, ano ou tudo */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setPeriod('week')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                period === 'week'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semana Atual
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                period === 'month'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mês Atual
            </button>
            <button
              onClick={() => setPeriod('year')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                period === 'year'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ano Atual
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                period === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tudo
            </button>
          </div>

          {/* botão pra gerar e baixar a planilha do período */}
          <button
            onClick={handleExportPeriodExcel}
            disabled={isExporting}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isExporting ? 'Gerando Excel...' : 'Download do Relatório (.xlsx)'}</span>
          </button>
        </div>
      </div>

      {/* grid com os 4 cards principais de totais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* card: total de entradas */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <ArrowDownRight className="w-4 h-4 text-emerald-600" />
              Total de Entradas
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              Receitas
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            +{formatCurrency(summary.totalEntradas)}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Faturamento bruto registrado no período ({periodLabels[period]})
          </p>
        </div>

        {/* card: total de saídas */}
        <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
              Total de Saídas
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
              Despesas
            </span>
          </div>
          <div className="text-2xl font-black text-rose-600 tracking-tight">
            -{formatCurrency(summary.totalSaidas)}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Custos operacionais, compras e sangrias realizadas
          </p>
        </div>

        {/* card: resultado líquido (lucro ou prejuízo) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Resultado Líquido
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                summary.saldoLiquido >= 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {summary.saldoLiquido >= 0 ? 'Lucro' : 'Prejuízo'}
            </span>
          </div>
          <div
            className={`text-2xl font-black tracking-tight ${
              summary.saldoLiquido >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {summary.saldoLiquido >= 0 ? '+' : ''}
            {formatCurrency(summary.saldoLiquido)}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Diferença líquida direta (Entradas - Saídas)
          </p>
        </div>

        {/* card: saldo final acumulado */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-lg shadow-slate-900/10 transition relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <CalendarCheck2 className="w-4 h-4 text-emerald-400" />
              Caixa Final Acumulado
            </span>
            <span className="text-[10px] bg-slate-700/80 px-2 py-0.5 rounded text-emerald-300 font-semibold">
              Disponível
            </span>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {formatCurrency(summary.saldoFinalPeriodo)}
          </div>
          <div className="mt-2 text-xs text-slate-300 flex items-center justify-between">
            <span>Dias Positivos:</span>
            <span className="font-bold text-emerald-400">
              {summary.diasPositivos} de {summary.diasPositivos + summary.diasNegativos} dias
            </span>
          </div>
        </div>

      </div>

      {/* destaques: onde mais saiu e de onde mais entrou grana */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* categoria que mais gastou (vilão dos custos) */}
        <div className="bg-white rounded-2xl p-5 border border-rose-200/80 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 block">
              Alerta de Custos • Maior Saída do Período
            </span>
            {summary.categoriaMaisGastou ? (
              <div className="mt-1">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-base font-extrabold text-slate-900">
                    {summary.categoriaMaisGastou.category}
                  </h3>
                  <span className="text-base font-black text-rose-600">
                    {formatCurrency(summary.categoriaMaisGastou.total)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Representa{' '}
                  <strong className="text-rose-700">
                    {summary.totalSaidas > 0
                      ? ((summary.categoriaMaisGastou.total / summary.totalSaidas) * 100).toFixed(1)
                      : 0}
                    %
                  </strong>{' '}
                  de todas as despesas ocorridas neste período.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-1">Nenhuma despesa registrada no período.</p>
            )}
          </div>
        </div>

        {/* categoria que mais arrecadou (carro-chefe) */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
              Maior Canal de Entrada • Principal Fonte
            </span>
            {summary.categoriaMaisRecebeu ? (
              <div className="mt-1">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-base font-extrabold text-slate-900">
                    {summary.categoriaMaisRecebeu.category}
                  </h3>
                  <span className="text-base font-black text-emerald-600">
                    {formatCurrency(summary.categoriaMaisRecebeu.total)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Representa{' '}
                  <strong className="text-emerald-700">
                    {summary.totalEntradas > 0
                      ? ((summary.categoriaMaisRecebeu.total / summary.totalEntradas) * 100).toFixed(1)
                      : 0}
                    %
                  </strong>{' '}
                  de toda a receita deste período.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-1">Nenhuma receita registrada no período.</p>
            )}
          </div>
        </div>

      </div>

      {/* divisão visual das categorias em barras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* divisão das entradas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              Composição das Entradas (Receitas)
            </h3>
            <span className="text-xs text-emerald-600 font-extrabold">
              Total: {formatCurrency(summary.totalEntradas)}
            </span>
          </div>

          {summary.entradasPorCategoria.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Nenhum dado no período</p>
          ) : (
            <div className="space-y-3">
              {summary.entradasPorCategoria.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {cat.category}
                      <span className="text-[10px] text-slate-400">({cat.count}x)</span>
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(cat.total)}{' '}
                      <span className="text-slate-400 font-normal">({cat.percentage.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* divisão das saídas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-rose-600" />
              Composição das Saídas (Despesas)
            </h3>
            <span className="text-xs text-rose-600 font-extrabold">
              Total: {formatCurrency(summary.totalSaidas)}
            </span>
          </div>

          {summary.saidasPorCategoria.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Nenhum dado no período</p>
          ) : (
            <div className="space-y-3">
              {summary.saidasPorCategoria.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      {cat.category}
                      <span className="text-[10px] text-slate-400">({cat.count}x)</span>
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(cat.total)}{' '}
                      <span className="text-slate-400 font-normal">({cat.percentage.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
