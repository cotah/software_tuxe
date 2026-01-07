# BTRIX Frontend

Sistema de gestão inteligente para bicicletarias. Frontend moderno construído com Next.js 14, Tailwind CSS, e shadcn/ui.

![BTRIX Preview](https://via.placeholder.com/800x400?text=BTRIX+Dashboard)

## 🚀 Stack Técnica

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Componentes:** Radix UI + shadcn/ui
- **Ícones:** Lucide React
- **Estado:** Zustand (UI) + TanStack Query (dados)
- **Drag & Drop:** @dnd-kit

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/your-org/btrix-frontend.git
cd btrix-frontend

# Instale as dependências
npm install

# Copie o arquivo de variáveis de ambiente
cp .env.example .env.local

# Rode o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# URL da API backend
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Usar dados mockados (útil para desenvolvimento)
NEXT_PUBLIC_USE_MOCKS=true
```

### Conectando à API Real

1. Altere `NEXT_PUBLIC_USE_MOCKS=false` no `.env.local`
2. Configure `NEXT_PUBLIC_API_URL` para apontar para seu backend
3. Reinicie o servidor de desenvolvimento

A camada de API está em `src/lib/api.ts`. Cada função verifica a flag `USE_MOCKS` e retorna dados mockados ou faz chamadas HTTP reais.

## 📁 Estrutura do Projeto

```
src/
├── app/                      # Next.js App Router
│   ├── (dashboard)/          # Rotas protegidas (layout com TopBar)
│   │   ├── page.tsx          # Command Center (Home)
│   │   ├── orders/           # Ordens de Serviço
│   │   ├── customers/        # Clientes
│   │   ├── inventory/        # Estoque
│   │   ├── calendar/         # Agenda
│   │   └── settings/         # Configurações
│   ├── login/                # Página de login
│   └── layout.tsx            # Layout raiz
│
├── components/
│   ├── ui/                   # Componentes base (Button, Card, Badge, etc.)
│   ├── blocks/               # Componentes compostos (OrderCard, AlertPanel)
│   └── layout/               # Shell (TopBar, CommandBar, MobileNav)
│
├── features/                 # Código organizado por domínio
│   ├── orders/
│   │   └── components/       # KanbanBoard, OrderProgress, OrderTimeline
│   ├── customers/
│   └── inventory/
│
├── lib/
│   ├── api.ts                # Cliente HTTP + mocks
│   └── utils.ts              # Funções utilitárias
│
├── hooks/                    # Hooks customizados
├── stores/                   # Zustand stores
└── types/                    # Definições TypeScript
```

## 🎨 Design System

### Cores

| Nome | Uso |
|------|-----|
| `brand-500` | Cor primária, ações interativas |
| `text-primary` | Texto principal |
| `text-secondary` | Texto secundário |
| `surface-secondary` | Background de página |
| `status-success` | Positivo, OK |
| `status-warning` | Atenção, pendente |
| `status-error` | Erro, crítico |
| `ai-50` | Background de sugestões IA |

### Tipografia

- **Display:** 30px, semi-bold (títulos de página)
- **Heading:** 24px, semi-bold
- **Body:** 16px, regular
- **Caption:** 12px, medium

### Componentes

Todos os componentes base estão em `src/components/ui/`:

- `Button` - Variantes: default, secondary, ghost, danger
- `Card` - Container com sombra suave
- `Badge` - Status tags
- `Input` - Campo de texto
- `Dialog` - Modal
- `Tooltip` - Dicas de hover

## 🔌 Integrações

### API Endpoints Esperados

O frontend espera os seguintes endpoints:

```
POST /auth/login              # Autenticação
GET  /dashboard/stats         # Estatísticas do dashboard
GET  /dashboard/alerts        # Alertas ativos
GET  /dashboard/timeline      # Timeline do dia
GET  /dashboard/upcoming-deliveries

GET  /orders                  # Lista de ordens
GET  /orders/:id              # Detalhe da ordem
PATCH /orders/:id/status      # Atualizar status

GET  /customers               # Lista de clientes
GET  /customers/:id           # Detalhe do cliente
GET  /customers/:id/conversation
GET  /customers/:id/orders

GET  /inventory               # Lista de itens
PATCH /inventory/:id          # Atualizar quantidade
```

### Trocando Mocks por API Real

1. Localize a função em `src/lib/api.ts`
2. O bloco `if (USE_MOCKS)` contém a lógica de mock
3. O bloco `return apiClient<T>(...)` faz a chamada real
4. Ajuste os tipos conforme necessário em `src/types/index.ts`

## 🏃 Scripts

```bash
npm run dev       # Servidor de desenvolvimento
npm run build     # Build de produção
npm run start     # Servidor de produção
npm run lint      # Verificação de código
```

## 📱 Responsividade

O sistema é **desktop-first** mas funciona em tablet e mobile:

- **Desktop (≥1024px):** Layout completo com navegação no topo
- **Tablet (768-1023px):** Layout adaptado
- **Mobile (<768px):** Navegação bottom bar, layouts simplificados

## 🔐 Autenticação

Por enquanto, a autenticação é simulada. Para testar:

- **Email:** demo@btrix.com
- **Senha:** demo123

Em produção, integre com seu sistema de autenticação (Clerk, Auth.js, etc.).

## 🤝 Contribuindo

1. Crie uma branch: `git checkout -b feature/minha-feature`
2. Commit: `git commit -m 'feat: adiciona nova feature'`
3. Push: `git push origin feature/minha-feature`
4. Abra um Pull Request

## 📄 Licença

Propriedade de BTRIX. Todos os direitos reservados.
