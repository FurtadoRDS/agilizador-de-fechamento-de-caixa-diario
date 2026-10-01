export type TransactionType = 'entrada' | 'saida';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  time: string; // formato HH:mm, hora que rolou
}

export interface DailyClosing {
  date: string; // formato YYYY-MM-DD, a data do dia
  initialBalance: number;
  initialBalanceOverridden?: boolean;
  transactions: Transaction[];
  status: 'open' | 'closed';
  closedAt?: string;
  notes?: string;
}

export interface CategorySummary {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface PeriodSummary {
  totalEntradas: number;
  totalSaidas: number;
  saldoLiquido: number;
  saldoInicialPeriodo: number;
  saldoFinalPeriodo: number;
  diasFechados: number;
  diasPositivos: number;
  diasNegativos: number;
  entradasPorCategoria: CategorySummary[];
  saidasPorCategoria: CategorySummary[];
  categoriaMaisGastou: { category: string; total: number } | null;
  categoriaMaisRecebeu: { category: string; total: number } | null;
}

export const CATEGORIAS_ENTRADAS = [
  'Dinheiro',
  'Pix',
  'Cartão de Débito',
  'Cartão de Crédito',
  'Transferência / TED',
  'Cheque / Boleto',
  'Outras Entradas',
] as const;

export const CATEGORIAS_SAIDAS = [
  'Fornecedores',
  'Contas / Boletos',
  'Sangria de Caixa',
  'Salários e Vales',
  'Despesas Gerais',
  'Mercadorias / Reposição',
  'Taxas e Impostos',
  'Outras Saídas',
] as const;
