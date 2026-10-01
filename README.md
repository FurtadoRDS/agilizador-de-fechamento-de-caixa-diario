# 💰 Agilizador de Fechamento de Caixa Diário

Uma aplicação web moderna, ágil e focada em produtividade operacional para fechamento diário de caixa, controle de receitas/despesas, visualização de histórico financeiro, dashboards analíticos e exportação de planilhas nativas em Excel (`.xlsx`).

---

## ✨ Principais Funcionalidades

### 1. ⚡ Fechamento de Caixa Diário (Foco em Agilidade)
- **Lançamento Ultra-Rápido**: Digite o valor, selecione ou digite a descrição e tecle **`Enter`** para registrar imediatamente sem precisar usar o mouse.
- **Cálculos Diretos no Campo**: O campo de valor aceita operações matemáticas na hora (ex: digitar `50+20` ou `100-15` já calcula automaticamente).
- **Saldo Inicial Automático**: O saldo de abertura do dia é puxado automaticamente a partir do saldo final do dia anterior. Permite ajuste manual a qualquer momento.
- **Categorização Rápida**: Botões de um clique para categorias comuns de Entradas (Pix, Cartão de Débito, Cartão de Crédito, Dinheiro, etc.) e Saídas (Fornecedores, Contas, Sangrias, Salários, etc.).
- **Fechamento / Proteção de Caixa**: Permite travar o caixa do dia como "Fechado" para evitar edições acidentais, com opção de reabertura se necessário.

### 2. 📅 Histórico de Fechamentos Anteriores
- Visualização de todos os dias operados em formato de cartões interativos.
- Busca em tempo real por data, descrição de item ou categoria.
- Filtros rápidos por status (Todos, Fechados, Em Aberto).
- Prévia em gaveta dos itens do dia sem sair da página e botão direto para reabrir/editar qualquer dia passado.

### 3. 📊 Dashboard & Indicadores Financeiros
- Totalizadores consolidados de **Total de Entradas**, **Total de Saídas**, **Resultado Líquido** e **Caixa Final Acumulado**.
- Seletores de período dinâmicos: **Semana Atual**, **Mês Atual**, **Ano Atual** e **Todo o Histórico**.
- Alertas e destaques inteligentes:
  - Categoria que mais consumiu recursos (alerta de custos operacionais).
  - Principal canal de arrecadação e receita.
- Gráficos visuais de barras com distribuição percentual por categoria.

### 4. 📑 Exportação Profissional para Excel (`.xlsx`)
Exportação nativa e formatada gerada via biblioteca `exceljs` (sem ser um CSV simples):
- **Aba 1 (Lançamentos Detalhados)**: Cabeçalho personalizado, tabela zebrada, colunas ajustadas, formatação contábil de moeda (`R$ #,##0.00`), Saldo Inicial (Abertura), movimentação total e Saldo Final com linha dupla contábil.
- **Aba 2 (Totais e Resumo Diário)**: Tabela consolidada com Data, Saldo Inicial/Abertura, Total Entradas, Total Saídas, Saldo do Dia (Variação) e Saldo Final acumulado, além de linha de totais do período.
- **Aba 3 (Resumo por Categorias)**: Totalizadores por categoria de receita e despesa com cálculo automático de percentual de participação (`% Total`).
- Modal para escolher o escopo da exportação: Dia Selecionado, Semana, Mês ou Histórico Inteiro.

### 5. 🔒 Privacidade & Funcionamento Off-line
- **100% Client-Side**: Todos os dados ficam salvos de forma privada no `localStorage` do seu navegador.
- Não requer envio de dados financeiros confidenciais para servidores externos.
- Pode ser usado normalmente sem internet após carregado.

---

## 🛠️ Tecnologias Utilizadas

- **[React 19](https://react.dev/)**: Interface declarativa, reativa e componentizada.
- **[TypeScript](https://www.typescriptlang.org/)**: Tipagem estática rigorosa para segurança nos cálculos e estruturas de dados.
- **[Vite](https://vite.dev/)**: Ferramenta de build ultrarrápida para desenvolvimento front-end.
- **[Tailwind CSS v4](https://tailwindcss.com/)**: Estilização moderna com design system limpo e responsivo.
- **[ExcelJS](https://github.com/exceljs/exceljs)**: Geração de planilhas Excel nativas com formatação rica, bordas e estilos.
- **[Lucide React](https://lucide.dev/)**: Conjunto de ícones leves e elegantes.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
- `npm` (gerenciador de pacotes incluído com o Node.js)

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git
   ```

2. **Acesse a pasta do projeto:**
   ```bash
   cd agilizador-de-fechamento-de-caixa-diario
   ```

3. **Instale as dependências:**
   ```bash
   npm install
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Abra no navegador:**
   Acesse o endereço exibido no terminal (por padrão: `http://localhost:3000`).

---

## 📦 Scripts Disponíveis

- `npm run dev`: Inicia o servidor local de desenvolvimento na porta 3000.
- `npm run build`: Compila a aplicação para produção na pasta `dist/`.
- `npm run preview`: Executa localmente o build de produção para testes.
- `npm run lint`: Checagem de tipagem com TypeScript (`tsc --noEmit`).

---

## 💡 Dicas de Uso

- **Lançar com agilidade**: Digite o valor no campo, digite a descrição (opcional) e pressione `Enter`. O cursor volta automaticamente para o campo de valor para o próximo lançamento.
- **Ajustar saldo inicial de um dia**: Clique no ícone de lápis ✏️ ao lado do "Saldo Inicial" para inserir o valor de abertura manualmente, se necessário.
- **Zerar todos os lançamentos**: Use o botão de reinicialização no canto superior direito para limpar os dados e recomeçar do zero.

---

## 📄 Licença

Este projeto é disponibilizado para uso pessoal e profissional sob os termos da licença [MIT](LICENSE).
