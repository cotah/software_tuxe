# BTRIX - Design Notes

Este documento explica como as decisões de design seguem o blueprint estabelecido.

## 🎯 Filosofia Core

### "Não é um ERP, é um Copiloto"

O BTRIX foi projetado para parecer um **assistente inteligente**, não um sistema burocrático. Isso se manifesta em:

1. **Linguagem humana no Command Center**
   - Em vez de: "3 ordens prontas"
   - Usamos: "Hoje você tem 3 bikes para entregar"

2. **IA invisível mas presente**
   - Resumos de cliente gerados automaticamente
   - Sugestões de resposta em conversas
   - Alertas proativos sobre problemas
   - Tudo aparece como `AiSuggestionCard` com ícone 💡

3. **Priorização automática**
   - Alertas ordenados por severidade
   - OS atrasadas pulsam em âmbar
   - Itens críticos no topo

## 🖼️ Decisões Visuais

### Paleta de Cores

Seguimos a filosofia **"cor como significado"**:

| Cor | Hex | Quando usar |
|-----|-----|-------------|
| Cinza/Branco | - | Default, neutro |
| Azul (brand-500) | #2563eb | Ações, links, seleção |
| Verde (status-success) | #22c55e | Positivo, OK, concluído |
| Âmbar (status-warning) | #f59e0b | Atenção, pendente |
| Vermelho (status-error) | #ef4444 | Crítico (usado com moderação) |
| Violeta (ai-50) | #ede9fe | Background de IA/sugestões |

### Tipografia

Inter como fonte base, com hierarquia clara:
- Display (30px) para saudações
- Heading (24px) para títulos de página
- Body (16px) mínimo para legibilidade
- Caption (12px) para metadados

### Espaçamento

Sistema de 8pt grid. Margens generosas. Breathing room em cards.

## 🏗️ Arquitetura de Telas

### Command Center (Home)

Seguindo o blueprint:

```
┌─────────────────────────────────────────────────────────────┐
│ Saudação + Resumo humano                                    │
├─────────────────────────────────────────────────────────────┤
│ Timeline do Dia (eventos visuais no tempo)                  │
├─────────────────────────────────────────────────────────────┤
│ Oficina Agora (3 cards: em trabalho | aguardando | prontas) │
├───────────────────────────────────────┬─────────────────────┤
│ Próximas Entregas                     │ Painel de Atenção   │
├───────────────────────────────────────┤ (alertas ordenados) │
│ Insights IA                           │                     │
└───────────────────────────────────────┴─────────────────────┘
```

**Decisões:**
- Grid 2/3 + 1/3 em desktop
- Cards clicáveis filtram ordens
- Timeline horizontal mostra o dia de forma visual

### Ordens de Serviço (Kanban)

```
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│Recebidas│ │Diagnóst.│ │Execução │ │ Prontas │
│         │ │         │ │         │ │         │
│  Card   │ │  Card   │ │  Card   │ │  Card   │
│  Card   │ │         │ │  Card   │ │  Card   │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

**Decisões:**
- Kanban com @dnd-kit para drag & drop nativo
- Cards mostram: cliente, bike, valor, tempo
- OS atrasada pulsa em âmbar
- 4 colunas no MVP (não "Entregue" por default)

### Detalhe da OS

```
[← Voltar] OS #42                    [PDF] [...]
┌─────────────────────────────────────────────┐
│ ●───●───●───○───○  Progresso visual         │
└─────────────────────────────────────────────┘
┌─────────────────────┐ ┌─────────────────────┐
│ Cliente & Bike      │ │ Ações               │
├─────────────────────┤ ├─────────────────────┤
│ Serviços (checklist)│ │ Timeline/Histórico  │
├─────────────────────┤ │                     │
│ Notas internas      │ │                     │
└─────────────────────┘ └─────────────────────┘
```

**Decisões:**
- Progress bar visual no topo (inspirado em Stripe)
- Serviços como checklist, não tabela
- Peças vinculadas mostram status de estoque
- Timeline de eventos no painel lateral

### Clientes (Master-Detail)

```
┌──────────────────┬──────────────────────────────────┐
│ Lista            │ Detalhe                          │
│ ┌──────────────┐ │ ┌────────────────────────────┐   │
│ │ Customer Card│ │ │ Header (nome, contato)     │   │
│ └──────────────┘ │ ├────────────────────────────┤   │
│ ┌──────────────┐ │ │ 💡 Resumo IA               │   │
│ │ Customer Card│ │ ├────────────────────────────┤   │
│ └──────────────┘ │ │ Conversa + Sugestão IA     │   │
│                  │ ├────────────────────────────┤   │
│                  │ │ Histórico de Serviços      │   │
│                  │ └────────────────────────────┘   │
└──────────────────┴──────────────────────────────────┘
```

**Decisões:**
- Layout inspirado em apps de email
- Resumo IA no topo do detalhe
- Conversa integrada com sugestão de resposta
- Histórico mostra OSs anteriores

### Estoque

```
┌─────────────────────────────────────────────────────┐
│ [🔴 3 zerados] [🟡 5 baixos] [🟢 42 OK]             │
├─────────────────────────────────────────────────────┤
│ 💡 Sugestão de reposição                            │
│    Câmara 29" - 5 usadas este mês, estoque: 1      │
│    [Ignorar] [Marcar para comprar]                  │
├─────────────────────────────────────────────────────┤
│ Lista de peças com barra de progresso visual        │
└─────────────────────────────────────────────────────┘
```

**Decisões:**
- 3 botões de filtro por status no topo
- Sugestão de reposição baseada em uso recente
- Cada item tem barra visual de nível
- Simplicidade: não é ERP fiscal

## 🤖 IA Integrada

A IA aparece em 4 lugares principais:

1. **Resumo de Cliente** (`AiSummaryCard`)
   - Gerado automaticamente
   - Mostra: tempo como cliente, preferências, última visita

2. **Sugestão de Resposta** (`AiReplySuggestion`)
   - Aparece abaixo do input de mensagem
   - Botão "Usar" preenche o campo

3. **Alertas Inteligentes** (`AlertPanel`)
   - OS atrasada, cliente sem resposta, estoque crítico
   - Ordenados por severidade

4. **Insights** (`AiInsight`)
   - No Command Center e Relatórios
   - Frases curtas e acionáveis

## 📱 Responsividade

- **Desktop:** Experiência completa
- **Tablet:** Layouts adaptados, menos colunas
- **Mobile:** Bottom navigation, telas simplificadas

O layout usa Tailwind breakpoints:
- `lg:` (≥1024px) para desktop
- `sm:` (≥640px) para tablet
- Default para mobile

## ⌨️ Atalhos de Teclado

- `⌘K` - Command Bar
- `⌘1-5` - Navegação rápida
- `⌘N` - Nova OS

## 🎬 Animações

Seguindo o princípio "movimento como linguagem":

- `animate-fade-in` - Entrada de páginas
- `transition-all duration-150` - Micro-interações
- `status-pulse` - Alerta de atenção
- Hover states com `shadow-elevated`

## 📐 Anti-Padrões Evitados

❌ Dashboard com 12 cards de KPIs iguais
❌ Tabelas estilo Excel
❌ Sidebar com 47 itens
❌ Modais sobre modais
❌ Configuração manual excessiva
❌ Cores primárias gritantes

✅ Command Center narrativo
✅ Kanban visual com drag
✅ Navegação por ícones + Command Bar
✅ Painéis laterais deslizantes
✅ Defaults inteligentes
✅ Paleta neutra com cor semântica

---

*Este documento acompanha o blueprint de design do BTRIX e deve ser atualizado conforme o produto evolui.*
