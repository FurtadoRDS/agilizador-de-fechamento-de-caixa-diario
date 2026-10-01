import ExcelJS from 'exceljs';
import { DailyClosing, Transaction } from '../types';
import { formatDateBR } from './formatters';

export interface ExcelExportOptions {
  closings: DailyClosing[];
  title?: string;
  periodLabel?: string;
  fileName?: string;
}

export async function exportClosingsToExcel({
  closings,
  title = 'Relatório de Fechamento de Caixa',
  periodLabel = 'Período Completo',
  fileName,
}: ExcelExportOptions): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Agilizador de Fechamento de Caixa';
  workbook.lastModifiedBy = 'Agilizador Caixa Diário';
  workbook.created = new Date();
  workbook.modified = new Date();

  // ordeno os dias da data mais antiga pra mais nova
  const sortedClosings = [...closings].sort((a, b) => a.date.localeCompare(b.date));

  // junto todas as entradas e saídas numa lista só pra jogar na tabela
  interface DetailedRow {
    date: string;
    time: string;
    type: 'Entrada' | 'Saída';
    category: string;
    description: string;
    amount: number;
    closingStatus: string;
  }

  const allRows: DetailedRow[] = [];
  let grandTotalEntradas = 0;
  let grandTotalSaidas = 0;

  sortedClosings.forEach((c) => {
    c.transactions.forEach((t: Transaction) => {
      const isEntrada = t.type === 'entrada';
      const amountVal = t.amount;
      if (isEntrada) grandTotalEntradas += amountVal;
      else grandTotalSaidas += amountVal;

      allRows.push({
        date: formatDateBR(c.date),
        time: t.time || '12:00',
        type: isEntrada ? 'Entrada' : 'Saída',
        category: t.category,
        description: t.description || (isEntrada ? 'Recebimento' : 'Pagamento'),
        amount: isEntrada ? amountVal : -amountVal,
        closingStatus: c.status === 'closed' ? 'Fechado' : 'Em Aberto',
      });
    });
  });

  // contas de saldo: abertura, movimento do dia e o saldo final somado
  const saldoInicialPeriodo = sortedClosings.length > 0 ? sortedClosings[0].initialBalance : 0;
  const saldoMovimentacaoPeriodo = grandTotalEntradas - grandTotalSaidas;
  const saldoFinalPeriodo = saldoInicialPeriodo + saldoMovimentacaoPeriodo;

  // -------------------------------------------------------------
  // ABA 1: LANÇAMENTOS DETALHADOS
  // -------------------------------------------------------------
  const ws1 = workbook.addWorksheet('Lançamentos Detalhados', {
    views: [{ showGridLines: true }],
  });

  // bloco do título no topo
  ws1.mergeCells('A1:G1');
  const titleCell = ws1.getCell('A1');
  titleCell.value = title.toUpperCase();
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F172A' }, // Slate 900
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws1.getRow(1).height = 36;

  // subtítulo com período e data de emissão
  ws1.mergeCells('A2:G2');
  const subCell = ws1.getCell('A2');
  subCell.value = `Período: ${periodLabel} | Emitido em: ${new Date().toLocaleString('pt-BR')}`;
  subCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF64748B' } };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws1.getRow(2).height = 20;

  // cards de resumo na linha 3: saldo inicial, entradas e saídas
  ws1.getCell('A3').value = 'Saldo Inicial (Abertura):';
  ws1.getCell('A3').font = { bold: true, size: 10, color: { argb: 'FF0F172A' } };
  ws1.getCell('A3').alignment = { vertical: 'middle', horizontal: 'right' };
  ws1.getCell('B3').value = saldoInicialPeriodo;
  ws1.getCell('B3').numFmt = '"R$" #,##0.00;[Red]-"R$" #,##0.00';
  ws1.getCell('B3').font = { bold: true, size: 10, color: { argb: 'FF0F172A' } };
  ws1.getCell('B3').alignment = { vertical: 'middle', horizontal: 'left' };

  ws1.getCell('C3').value = 'Total Entradas (+):';
  ws1.getCell('C3').font = { bold: true, size: 10, color: { argb: 'FF166534' } };
  ws1.getCell('C3').alignment = { vertical: 'middle', horizontal: 'right' };
  ws1.getCell('D3').value = grandTotalEntradas;
  ws1.getCell('D3').numFmt = '"R$" #,##0.00;[Red]-"R$" #,##0.00';
  ws1.getCell('D3').font = { bold: true, size: 10, color: { argb: 'FF166534' } };
  ws1.getCell('D3').alignment = { vertical: 'middle', horizontal: 'left' };

  ws1.getCell('E3').value = 'Total Saídas (-):';
  ws1.getCell('E3').font = { bold: true, size: 10, color: { argb: 'FF991B1B' } };
  ws1.getCell('E3').alignment = { vertical: 'middle', horizontal: 'right' };
  ws1.getCell('F3').value = grandTotalSaidas;
  ws1.getCell('F3').numFmt = '"R$" #,##0.00;[Red]-"R$" #,##0.00';
  ws1.getCell('F3').font = { bold: true, size: 10, color: { argb: 'FF991B1B' } };
  ws1.getCell('F3').alignment = { vertical: 'middle', horizontal: 'left' };

  ws1.getCell('G3').value = saldoMovimentacaoPeriodo;
  ws1.getCell('G3').numFmt = '"R$" #,##0.00;[Red]-"R$" #,##0.00';
  ws1.getCell('G3').font = {
    bold: true,
    size: 10,
    color: { argb: saldoMovimentacaoPeriodo >= 0 ? 'FF166534' : 'FF991B1B' },
  };
  ws1.getCell('G3').alignment = { vertical: 'middle', horizontal: 'center' };
  ws1.getRow(3).height = 22;

  // linha 4: saldo do dia e o saldo final com a abertura somada
  ws1.mergeCells('A4:C4');
  ws1.getCell('A4').value = 'Saldo do Dia / Período (Entradas - Saídas):';
  ws1.getCell('A4').font = { bold: true, size: 10, color: { argb: 'FF334155' } };
  ws1.getCell('A4').alignment = { vertical: 'middle', horizontal: 'right' };

  ws1.getCell('D4').value = saldoMovimentacaoPeriodo;
  ws1.getCell('D4').numFmt = '"R$" #,##0.00;[Red]-"R$" #,##0.00';
  ws1.getCell('D4').font = {
    bold: true,
    size: 10,
    color: { argb: saldoMovimentacaoPeriodo >= 0 ? 'FF166534' : 'FF991B1B' },
  };
  ws1.getCell('D4').alignment = { vertical: 'middle', horizontal: 'left' };

  ws1.mergeCells('E4:F4');
  ws1.getCell('E4').value = 'Saldo Final (Inicial + Saldo do Dia):';
  ws1.getCell('E4').font = { bold: true, size: 10, color: { argb: 'FF0F172A' } };
  ws1.getCell('E4').alignment = { vertical: 'middle', horizontal: 'right' };

  ws1.getCell('G4').value = saldoFinalPeriodo;
  ws1.getCell('G4').numFmt = '"R$" #,##0.00;[Red]-"R$" #,##0.00';
  ws1.getCell('G4').font = {
    bold: true,
    size: 11,
    color: { argb: saldoFinalPeriodo >= 0 ? 'FF166534' : 'FF991B1B' },
  };
  ws1.getCell('G4').alignment = { vertical: 'middle', horizontal: 'center' };
  ws1.getCell('G4').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' },
  };
  ws1.getRow(4).height = 24;

  // linha em branco pra dar um respiro antes da tabela
  ws1.addRow([]);

  // cabeçalho das colunas da tabela (linha 6)
  const headers = ['Data', 'Hora', 'Tipo', 'Categoria', 'Descrição', 'Valor Líquido', 'Status'];
  const headerRow = ws1.addRow(headers);
  headerRow.height = 26;

  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' }, // cor escura padrão
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF94A3B8' } },
      left: { style: 'thin', color: { argb: 'FF94A3B8' } },
      bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
      right: { style: 'thin', color: { argb: 'FF94A3B8' } },
    };
  });

  // linhas com os lançamentos da tabela
  let startRow = 6;
  allRows.forEach((r, idx) => {
    const row = ws1.addRow([
      r.date,
      r.time,
      r.type,
      r.category,
      r.description,
      r.amount,
      r.closingStatus,
    ]);
    row.height = 20;

    const isEven = idx % 2 === 0;
    const isEntrada = r.type === 'Entrada';

    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };

      if (isEven) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' }, // zebrado clarinho pras linhas
        };
      }

      // alinhamento e formato certinho pra cada coluna
      if (colNumber === 1 || colNumber === 2 || colNumber === 7) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (colNumber === 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = {
          bold: true,
          color: { argb: isEntrada ? 'FF16A34A' : 'FFDC2626' },
        };
      } else if (colNumber === 6) {
        // formato de moeda nativo do excel
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = '"R$" #,##0.00;[Red]-"R$" #,##0.00';
        cell.font = {
          bold: true,
          color: { argb: isEntrada ? 'FF15803D' : 'FFB91C1C' },
        };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    });
  });

  // rodapé de totais: movimento, abertura e saldo final fechado
  const rowTotMov = ws1.addRow([
    'TOTAIS DE MOVIMENTAÇÃO (Entradas - Saídas)',
    '',
    '',
    '',
    '',
    grandTotalEntradas - grandTotalSaidas,
    `${allRows.length} lançamentos`,
  ]);
  rowTotMov.height = 24;
  ws1.mergeCells(`A${rowTotMov.number}:E${rowTotMov.number}`);

  rowTotMov.eachCell((cell, colNumber) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2E8F0' },
    };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF0F172A' } },
      bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
    if (colNumber === 1) {
      cell.font = { bold: true, size: 10, color: { argb: 'FF0F172A' } };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    } else if (colNumber === 6) {
      cell.numFmt = '"R$" #,##0.00;[Red]-"R$" #,##0.00';
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
      cell.font = {
        bold: true,
        size: 11,
        color: { argb: (grandTotalEntradas - grandTotalSaidas) >= 0 ? 'FF166534' : 'FF991B1B' },
      };
    } else if (colNumber === 7) {
      cell.font = { italic: true, size: 9, color: { argb: 'FF64748B' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    }
  });

  const rowSaldoInicial = ws1.addRow([
    '(+) SALDO INICIAL (ABERTURA)',
    '',
    '',
    '',
    '',
    saldoInicialPeriodo,
    'Abertura',
  ]);
  rowSaldoInicial.height = 24;
  ws1.mergeCells(`A${rowSaldoInicial.number}:E${rowSaldoInicial.number}`);

  rowSaldoInicial.eachCell((cell, colNumber) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF1F5F9' },
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
    if (colNumber === 1) {
      cell.font = { bold: true, size: 10, color: { argb: 'FF334155' } };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    } else if (colNumber === 6) {
      cell.numFmt = '"R$" #,##0.00;[Red]-"R$" #,##0.00';
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
      cell.font = { bold: true, size: 11, color: { argb: 'FF0F172A' } };
    } else if (colNumber === 7) {
      cell.font = { italic: true, size: 9, color: { argb: 'FF64748B' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    }
  });

  const rowSaldoFinal = ws1.addRow([
    '(=) SALDO FINAL (SALDO DO DIA + SALDO INICIAL)',
    '',
    '',
    '',
    '',
    saldoFinalPeriodo,
    'Fechamento',
  ]);
  rowSaldoFinal.height = 28;
  ws1.mergeCells(`A${rowSaldoFinal.number}:E${rowSaldoFinal.number}`);

  rowSaldoFinal.eachCell((cell, colNumber) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2E8F0' },
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF0F172A' } },
      bottom: { style: 'double', color: { argb: 'FF0F172A' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
    if (colNumber === 1) {
      cell.font = { bold: true, size: 11, color: { argb: 'FF0F172A' } };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    } else if (colNumber === 6) {
      cell.numFmt = '"R$" #,##0.00;[Red]-"R$" #,##0.00';
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
      cell.font = {
        bold: true,
        size: 12,
        color: { argb: saldoFinalPeriodo >= 0 ? 'FF166534' : 'FF991B1B' },
      };
    } else if (colNumber === 7) {
      cell.font = { bold: true, size: 10, color: { argb: 'FF0F172A' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    }
  });

  // ajusto a largura das colunas pra nada ficar cortado
  ws1.columns = [
    { width: 14 }, // Data
    { width: 10 }, // Hora
    { width: 12 }, // Tipo
    { width: 24 }, // Categoria
    { width: 34 }, // Descrição
    { width: 22 }, // Valor Líquido
    { width: 16 }, // Status
  ];

  // -------------------------------------------------------------
  // ABA 2: TOTAIS E RESUMO DIÁRIO DE CAIXA
  // -------------------------------------------------------------
  const ws2 = workbook.addWorksheet('Totais e Resumo Diário', {
    views: [{ showGridLines: true }],
  });

  // título da aba 2
  ws2.mergeCells('A1:G1');
  const ws2Title = ws2.getCell('A1');
  ws2Title.value = 'RESUMO CONSOLIDADO E TOTAIS POR DIA';
  ws2Title.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  ws2Title.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF047857' }, // verde escuro bonitão
  };
  ws2Title.alignment = { vertical: 'middle', horizontal: 'center' };
  ws2.getRow(1).height = 32;

  // cabeçalho da aba 2
  const headers2 = [
    'Data',
    'Saldo Inicial / Abertura (R$)',
    'Total Entradas (R$)',
    'Total Saídas (R$)',
    'Saldo do Dia (Variação) (R$)',
    'Saldo Final (Inicial + Saldo do Dia) (R$)',
    'Status do Caixa',
  ];
  const hRow2 = ws2.addRow(headers2);
  hRow2.height = 26;
  hRow2.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF065F46' }, // verde mais escuro pro cabeçalho
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  sortedClosings.forEach((c, idx) => {
    const totalE = c.transactions
      .filter((t) => t.type === 'entrada')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalS = c.transactions
      .filter((t) => t.type === 'saida')
      .reduce((sum, t) => sum + t.amount, 0);
    const variacao = totalE - totalS;
    const finalBal = c.initialBalance + variacao;

    const row = ws2.addRow([
      formatDateBR(c.date),
      c.initialBalance,
      totalE,
      totalS,
      variacao,
      finalBal,
      c.status === 'closed' ? 'Fechado' : 'Em Aberto',
    ]);
    row.height = 20;

    const isEven = idx % 2 === 0;
    row.eachCell((cell, colNum) => {
      if (isEven) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF0FDF4' },
        };
      }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };

      if (colNum >= 2 && colNum <= 6) {
        cell.numFmt = '"R$" #,##0.00;[Red]-"R$" #,##0.00';
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        if (colNum === 5) {
          cell.font = {
            bold: true,
            color: { argb: variacao >= 0 ? 'FF166534' : 'FF991B1B' },
          };
        }
        if (colNum === 6) {
          cell.font = {
            bold: true,
            color: { argb: finalBal >= 0 ? 'FF166534' : 'FF991B1B' },
          };
        }
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    });
  });

  // linha final de totais consolidados na aba 2
  const totalRowWs2 = ws2.addRow([
    'TOTAIS DO PERÍODO',
    saldoInicialPeriodo,
    grandTotalEntradas,
    grandTotalSaidas,
    saldoMovimentacaoPeriodo,
    saldoFinalPeriodo,
    `${sortedClosings.length} dia(s)`,
  ]);
  totalRowWs2.height = 28;

  totalRowWs2.eachCell((cell, colNum) => {
    cell.font = { bold: true, size: 11, color: { argb: 'FF0F172A' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2E8F0' },
    };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF047857' } },
      bottom: { style: 'double', color: { argb: 'FF047857' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
    if (colNum >= 2 && colNum <= 6) {
      cell.numFmt = '"R$" #,##0.00;[Red]-"R$" #,##0.00';
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
      if (colNum === 5) {
        cell.font = {
          bold: true,
          color: { argb: saldoMovimentacaoPeriodo >= 0 ? 'FF166534' : 'FF991B1B' },
        };
      }
      if (colNum === 6) {
        cell.font = {
          bold: true,
          size: 12,
          color: { argb: saldoFinalPeriodo >= 0 ? 'FF166534' : 'FF991B1B' },
        };
      }
    } else {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    }
  });

  ws2.columns = [
    { width: 16 }, // Data
    { width: 25 }, // Saldo Inicial / Abertura (R$)
    { width: 20 }, // Total Entradas (R$)
    { width: 20 }, // Total Saídas (R$)
    { width: 25 }, // Saldo do Dia (Variação) (R$)
    { width: 32 }, // Saldo Final (Inicial + Saldo do Dia) (R$)
    { width: 18 }, // Status do Caixa
  ];

  // -------------------------------------------------------------
  // ABA 3: RESUMO POR CATEGORIAS
  // -------------------------------------------------------------
  const ws3 = workbook.addWorksheet('Resumo por Categorias', {
    views: [{ showGridLines: true }],
  });

  ws3.mergeCells('A1:C1');
  const ws3TitleE = ws3.getCell('A1');
  ws3TitleE.value = 'RECEITAS POR CATEGORIA';
  ws3TitleE.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws3TitleE.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF15803D' } };
  ws3TitleE.alignment = { horizontal: 'center', vertical: 'middle' };

  ws3.mergeCells('E1:G1');
  const ws3TitleS = ws3.getCell('E1');
  ws3TitleS.value = 'DESPESAS POR CATEGORIA';
  ws3TitleS.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws3TitleS.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB91C1C' } };
  ws3TitleS.alignment = { horizontal: 'center', vertical: 'middle' };

  ws3.getRow(1).height = 28;

  // somo quanto foi gasto e recebido por categoria
  const catE: Record<string, number> = {};
  const catS: Record<string, number> = {};

  sortedClosings.forEach((c) => {
    c.transactions.forEach((t) => {
      if (t.type === 'entrada') {
        catE[t.category] = (catE[t.category] || 0) + t.amount;
      } else {
        catS[t.category] = (catS[t.category] || 0) + t.amount;
      }
    });
  });

  const sortedCatE = Object.entries(catE).sort((a, b) => b[1] - a[1]);
  const sortedCatS = Object.entries(catS).sort((a, b) => b[1] - a[1]);

  const maxRows = Math.max(sortedCatE.length, sortedCatS.length);

  ws3.getRow(2).values = ['Categoria', 'Total (R$)', '% Total', '', 'Categoria', 'Total (R$)', '% Total'];
  ws3.getRow(2).font = { bold: true };
  ws3.getRow(2).alignment = { horizontal: 'center', vertical: 'middle' };
  ws3.getRow(2).height = 22;

  for (let i = 0; i < maxRows; i++) {
    const itemE = sortedCatE[i];
    const itemS = sortedCatS[i];

    const rowVals = [
      itemE ? itemE[0] : '',
      itemE ? itemE[1] : '',
      itemE && grandTotalEntradas > 0 ? itemE[1] / grandTotalEntradas : '',
      '',
      itemS ? itemS[0] : '',
      itemS ? itemS[1] : '',
      itemS && grandTotalSaidas > 0 ? itemS[1] / grandTotalSaidas : '',
    ];

    const row = ws3.addRow(rowVals);
    row.height = 20;

    // formatação de moeda e porcentagem
    if (itemE) {
      row.getCell(2).numFmt = '"R$" #,##0.00';
      row.getCell(3).numFmt = '0.0%';
    }
    if (itemS) {
      row.getCell(6).numFmt = '"R$" #,##0.00';
      row.getCell(7).numFmt = '0.0%';
    }
  }

  ws3.columns = [
    { width: 25 },
    { width: 18 },
    { width: 12 },
    { width: 6 },
    { width: 25 },
    { width: 18 },
    { width: 12 },
  ];

  // gero o arquivo excel e disparo o download no navegador
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName || `Fechamento_Caixa_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
