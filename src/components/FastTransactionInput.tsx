import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  ArrowDownRight, 
  ArrowUpRight, 
  Sparkles,
  Tag, 
  AlignLeft,
  DollarSign
} from 'lucide-react';
import { TransactionType, CATEGORIAS_ENTRADAS, CATEGORIAS_SAIDAS } from '../types';
import { parseCurrencyInput } from '../utils/formatters';

interface FastTransactionInputProps {
  onAddTransaction: (data: {
    type: TransactionType;
    category: string;
    description: string;
    amount: number;
  }) => void;
  disabled?: boolean;
}

export const FastTransactionInput: React.FC<FastTransactionInputProps> = ({
  onAddTransaction,
  disabled = false,
}) => {
  const [type, setType] = useState<TransactionType>('entrada');
  const [category, setCategory] = useState<string>(CATEGORIAS_ENTRADAS[0]);
  const [description, setDescription] = useState<string>('');
  const [amountStr, setAmountStr] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [recentAdded, setRecentAdded] = useState<boolean>(false);

  const amountInputRef = useRef<HTMLInputElement>(null);

  // troca a categoria padrão quando mudo de entrada pra saída
  useEffect(() => {
    if (type === 'entrada') {
      setCategory(CATEGORIAS_ENTRADAS[0]);
    } else {
      setCategory(CATEGORIAS_SAIDAS[0]);
    }
  }, [type]);

  const categories = type === 'entrada' ? CATEGORIAS_ENTRADAS : CATEGORIAS_SAIDAS;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (disabled) return;

    const parsed = parseCurrencyInput(amountStr);
    if (!parsed || parsed <= 0) {
      setErrorMsg('Informe um valor válido maior que zero');
      amountInputRef.current?.focus();
      return;
    }

    setErrorMsg('');
    onAddTransaction({
      type,
      category,
      description: description.trim() || (type === 'entrada' ? `${category}` : `${category}`),
      amount: parsed,
    });

    // limpa o campo e já foca de novo pra eu lançar o próximo sem parar
    setAmountStr('');
    setDescription('');
    setRecentAdded(true);
    setTimeout(() => setRecentAdded(false), 800);

    // joga o cursor de volta no campo de valor pra não precisar encostar no mouse
    setTimeout(() => {
      amountInputRef.current?.focus();
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border p-4 sm:p-5 transition-all ${
      disabled ? 'opacity-60 pointer-events-none' : 'hover:shadow-md'
    } ${type === 'entrada' ? 'border-emerald-200/80 bg-gradient-to-b from-emerald-50/20 to-white' : 'border-rose-200/80 bg-gradient-to-b from-rose-50/20 to-white'}`}>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        {/* abas pra alternar entre entrada e saída */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-fit">
          <button
            type="button"
            onClick={() => setType('entrada')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
              type === 'entrada'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>+ Entrada (Receita)</span>
          </button>
          
          <button
            type="button"
            onClick={() => setType('saida')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
              type === 'saida'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>- Saída (Despesa)</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Dica de agilidade: Digite o valor e tecle <strong>Enter</strong> para lançar direto</span>
        </div>
      </div>

      {/* botões rápidos de categoria */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1 shrink-0 mr-1">
          <Tag className="w-3 h-3" /> Categoria:
        </span>
        {categories.map((cat) => {
          const isSelected = category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition shrink-0 cursor-pointer ${
                isSelected
                  ? type === 'entrada'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold'
                    : 'bg-rose-100 text-rose-800 border border-rose-300 font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/70'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* formulário rápido de digitação */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
        {/* campo de valor (o foco principal) */}
        <div className="sm:col-span-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <span className="text-sm font-bold">R$</span>
          </div>
          <input
            ref={amountInputRef}
            type="text"
            inputMode="decimal"
            placeholder="0,00 (ex: 150,50)"
            value={amountStr}
            onChange={(e) => {
              setAmountStr(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={`w-full pl-9 pr-3 py-2.5 text-base sm:text-lg font-bold rounded-xl border focus:outline-none focus:ring-2 transition ${
              type === 'entrada'
                ? 'border-emerald-300 focus:ring-emerald-500 text-emerald-950 placeholder-slate-400 bg-emerald-50/30'
                : 'border-rose-300 focus:ring-rose-500 text-rose-950 placeholder-slate-400 bg-rose-50/30'
            }`}
          />
        </div>

        {/* descrição rápida opcional */}
        <div className="sm:col-span-5 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <AlignLeft className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder={type === 'entrada' ? 'Descrição rápida (ex: Pix cliente João)' : 'Descrição rápida (ex: Fornecedor pão)'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 text-slate-900 bg-white placeholder-slate-400"
          />
        </div>

        {/* botão de lançar */}
        <div className="sm:col-span-3">
          <button
            type="submit"
            disabled={disabled}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer ${
              recentAdded
                ? 'bg-emerald-700 ring-2 ring-emerald-400 scale-95'
                : type === 'entrada'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{recentAdded ? 'Lançado!' : 'Lançar (Enter)'}</span>
          </button>
        </div>
      </form>

      {errorMsg && (
        <p className="mt-2 text-xs font-semibold text-rose-600 animate-fade-in flex items-center gap-1">
          • {errorMsg}
        </p>
      )}
    </div>
  );
};
