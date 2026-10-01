import React, { createContext, useContext, useState, useEffect } from 'react';
import { DailyClosing, Transaction, PeriodSummary, CategorySummary } from '../types';
import { getTodayDateString, getPreviousDateString } from '../utils/formatters';

interface CashRegisterContextType {
  closings: Record<string, DailyClosing>;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  currentClosing: DailyClosing;
  saveClosing: (closing: DailyClosing) => void;
  addTransaction: (date: string, tx: Omit<Transaction, 'id' | 'time'> & { time?: string }) => void;
  deleteTransaction: (date: string, txId: string) => void;
  updateInitialBalance: (date: string, amount: number) => void;
  toggleClosingStatus: (date: string) => void;
  getPreviousClosing: (date: string) => DailyClosing | null;
  getPreviousFinalBalance: (date: string) => number;
  calculateDayTotals: (closing: DailyClosing) => { totalEntradas: number; totalSaidas: number; finalBalance: number };
  getPeriodSummary: (period: 'week' | 'month' | 'year' | 'all') => PeriodSummary;
  getAllClosingsList: () => DailyClosing[];
  clearAllData: () => void;
}

const STORAGE_KEY = 'caixa_diario_pessoal_v1';

const CashRegisterContext = createContext<CashRegisterContextType | undefined>(undefined);

// começa zeradinho só com o dia de hoje pra começar a lançar
function getInitialCleanState(): Record<string, DailyClosing> {
  const today = getTodayDateString();
  return {
    [today]: {
      date: today,
      initialBalance: 0,
      transactions: [],
      status: 'open',
      notes: '',
    },
  };
}

export const CashRegisterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [closings, setClosings] = useState<Record<string, DailyClosing>>(() => {
    try {
      // limpo qualquer sobra de teste antigo do storage
      localStorage.removeItem('caixa_diario_store_v2');
      localStorage.removeItem('caixa_diario_records_v1');

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Falha ao ler localStorage:', e);
    }
    return getInitialCleanState();
  });

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  // salva no storage sozinho sempre que mudar qualquer coisa
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(closings));
    } catch (e) {
      console.error('Falha ao gravar no localStorage:', e);
    }
  }, [closings]);

  // puxa o saldo final de ontem pra abrir o caixa de hoje
  const getPreviousFinalBalance = (date: string): number => {
    const prevDate = getPreviousDateString(date);
    const prevClosing = closings[prevDate];
    if (!prevClosing) return 0;

    const totalE = prevClosing.transactions
      .filter((t) => t.type === 'entrada')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalS = prevClosing.transactions
      .filter((t) => t.type === 'saida')
      .reduce((sum, t) => sum + t.amount, 0);

    return Math.round((prevClosing.initialBalance + totalE - totalS) * 100) / 100;
  };

  const getPreviousClosing = (date: string): DailyClosing | null => {
    const prevDate = getPreviousDateString(date);
    return closings[prevDate] || null;
  };

  // pega o caixa do dia selecionado ou cria um novo na hora
  const currentClosing: DailyClosing = closings[selectedDate] || {
    date: selectedDate,
    initialBalance: getPreviousFinalBalance(selectedDate),
    transactions: [],
    status: 'open',
    notes: '',
  };

  const calculateDayTotals = (closing: DailyClosing) => {
    const totalEntradas = closing.transactions
      .filter((t) => t.type === 'entrada')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalSaidas = closing.transactions
      .filter((t) => t.type === 'saida')
      .reduce((sum, t) => sum + t.amount, 0);
    const finalBalance = closing.initialBalance + totalEntradas - totalSaidas;

    return {
      totalEntradas: Math.round(totalEntradas * 100) / 100,
      totalSaidas: Math.round(totalSaidas * 100) / 100,
      finalBalance: Math.round(finalBalance * 100) / 100,
    };
  };

  const saveClosing = (closing: DailyClosing) => {
    setClosings((prev) => ({
      ...prev,
      [closing.date]: closing,
    }));
  };

  const addTransaction = (
    date: string,
    txData: Omit<Transaction, 'id' | 'time'> & { time?: string }
  ) => {
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const newTx: Transaction = {
      ...txData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      time: txData.time || nowTime,
    };

    setClosings((prev) => {
      const existing = prev[date] || {
        date,
        initialBalance: getPreviousFinalBalance(date),
        transactions: [],
        status: 'open',
      };

      return {
        ...prev,
        [date]: {
          ...existing,
          transactions: [newTx, ...existing.transactions],
        },
      };
    });
  };

  const deleteTransaction = (date: string, txId: string) => {
    setClosings((prev) => {
      const existing = prev[date];
      if (!existing) return prev;
      return {
        ...prev,
        [date]: {
          ...existing,
          transactions: existing.transactions.filter((t) => t.id !== txId),
        },
      };
    });
  };

  const updateInitialBalance = (date: string, amount: number) => {
    setClosings((prev) => {
      const existing = prev[date] || {
        date,
        initialBalance: 0,
        transactions: [],
        status: 'open',
      };
      return {
        ...prev,
        [date]: {
          ...existing,
          initialBalance: amount,
          initialBalanceOverridden: true,
        },
      };
    });
  };

  const toggleClosingStatus = (date: string) => {
    setClosings((prev) => {
      const existing = prev[date] || {
        date,
        initialBalance: getPreviousFinalBalance(date),
        transactions: [],
        status: 'open',
      };
      const nextStatus = existing.status === 'closed' ? 'open' : 'closed';
      return {
        ...prev,
        [date]: {
          ...existing,
          status: nextStatus,
          closedAt: nextStatus === 'closed' ? new Date().toISOString() : undefined,
        },
      };
    });
  };

  const getAllClosingsList = (): DailyClosing[] => {
    return Object.values(closings).sort((a, b) => b.date.localeCompare(a.date));
  };

  const getPeriodSummary = (period: 'week' | 'month' | 'year' | 'all'): PeriodSummary => {
    const now = new Date();
    const allList = Object.values(closings);

    const filtered = allList.filter((c) => {
      if (period === 'all') return true;
      const [y, m, d] = c.date.split('-').map(Number);
      const cDate = new Date(y, m - 1, d);

      if (period === 'week') {
        // pego os últimos 7 dias da semana
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

    let totalEntradas = 0;
    let totalSaidas = 0;
    let diasFechados = 0;
    let diasPositivos = 0;
    let diasNegativos = 0;

    const entradasCatMap: Record<string, { total: number; count: number }> = {};
    const saidasCatMap: Record<string, { total: number; count: number }> = {};

    filtered.forEach((c) => {
      if (c.status === 'closed') diasFechados++;
      let dayE = 0;
      let dayS = 0;

      c.transactions.forEach((t) => {
        if (t.type === 'entrada') {
          totalEntradas += t.amount;
          dayE += t.amount;
          if (!entradasCatMap[t.category]) entradasCatMap[t.category] = { total: 0, count: 0 };
          entradasCatMap[t.category].total += t.amount;
          entradasCatMap[t.category].count += 1;
        } else {
          totalSaidas += t.amount;
          dayS += t.amount;
          if (!saidasCatMap[t.category]) saidasCatMap[t.category] = { total: 0, count: 0 };
          saidasCatMap[t.category].total += t.amount;
          saidasCatMap[t.category].count += 1;
        }
      });

      if (dayE - dayS >= 0) diasPositivos++;
      else diasNegativos++;
    });

    // organizo as categorias: da que mais movimentou pra que menos movimentou
    const entradasPorCategoria: CategorySummary[] = Object.entries(entradasCatMap)
      .map(([category, val]) => ({
        category,
        total: val.total,
        count: val.count,
        percentage: totalEntradas > 0 ? (val.total / totalEntradas) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    const saidasPorCategoria: CategorySummary[] = Object.entries(saidasCatMap)
      .map(([category, val]) => ({
        category,
        total: val.total,
        count: val.count,
        percentage: totalSaidas > 0 ? (val.total / totalSaidas) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // acho o saldo de abertura do primeiro dia e o saldo final do último dia do período
    const sortedFiltered = [...filtered].sort((a, b) => a.date.localeCompare(b.date));
    const firstDay = sortedFiltered[0];
    const lastDay = sortedFiltered[sortedFiltered.length - 1];

    const saldoInicialPeriodo = firstDay ? firstDay.initialBalance : 0;
    const lastDayTotals = lastDay ? calculateDayTotals(lastDay) : { finalBalance: 0 };

    return {
      totalEntradas: Math.round(totalEntradas * 100) / 100,
      totalSaidas: Math.round(totalSaidas * 100) / 100,
      saldoLiquido: Math.round((totalEntradas - totalSaidas) * 100) / 100,
      saldoInicialPeriodo,
      saldoFinalPeriodo: lastDayTotals.finalBalance,
      diasFechados,
      diasPositivos,
      diasNegativos,
      entradasPorCategoria,
      saidasPorCategoria,
      categoriaMaisGastou: saidasPorCategoria.length > 0 ? saidasPorCategoria[0] : null,
      categoriaMaisRecebeu: entradasPorCategoria.length > 0 ? entradasPorCategoria[0] : null,
    };
  };

  const clearAllData = () => {
    const clean = getInitialCleanState();
    setClosings(clean);
    setSelectedDate(getTodayDateString());
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
      localStorage.removeItem('caixa_diario_store_v2');
      localStorage.removeItem('caixa_diario_records_v1');
    } catch (e) {
      console.error('Falha ao limpar localStorage:', e);
    }
  };

  return (
    <CashRegisterContext.Provider
      value={{
        closings,
        selectedDate,
        setSelectedDate,
        currentClosing,
        saveClosing,
        addTransaction,
        deleteTransaction,
        updateInitialBalance,
        toggleClosingStatus,
        getPreviousClosing,
        getPreviousFinalBalance,
        calculateDayTotals,
        getPeriodSummary,
        getAllClosingsList,
        clearAllData,
      }}
    >
      {children}
    </CashRegisterContext.Provider>
  );
};

export const useCashRegister = () => {
  const context = useContext(CashRegisterContext);
  if (!context) {
    throw new Error('useCashRegister must be used within a CashRegisterProvider');
  }
  return context;
};
