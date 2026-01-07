# BTRIX Setup Guide

This guide will help you set up and run the BTRIX Business Control Web App.

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn

## Installation Steps

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE btrix_db;
```

2. Create `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

3. Update the `.env` file with your database credentials:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/btrix_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### 3. Run Database Migrations

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Seed Initial Data

```bash
cd backend
npm run db:seed
```

This will create:
- A demo company
- Admin user: `admin@btrix.com` / `admin123`
- Staff user: `staff@btrix.com` / `staff123`
- Kitchen user: `kitchen@btrix.com` / `kitchen123`
- Sample services and products

### 5. Start Development Servers

From the root directory:

```bash
# Start both backend and frontend
npm run dev
```

Or start them separately:

```bash
# Terminal 1 - Backend (port 3001)
cd backend
npm run dev

# Terminal 2 - Frontend (port 3000)
cd frontend
npm run dev
```

## Accessing the Application

1. Open your browser and navigate to: `http://localhost:3000`
2. Login with one of the seeded accounts:
   - Admin: `admin@btrix.com` / `admin123`
   - Staff: `staff@btrix.com` / `staff123`
   - Kitchen: `kitchen@btrix.com` / `kitchen123`

## Calendar & Appointments

- Backend env vars needed for sync: `APP_BASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_REDIRECT_URI`, `MICROSOFT_TENANT` (defaults to `common`).
- Google OAuth: create an OAuth client (Web) in Google Cloud, enable Calendar API, add redirect `http://localhost:3001/api/calendar/google/callback`, and allow scope `https://www.googleapis.com/auth/calendar` (or the narrower `calendar.events`).
- Microsoft OAuth: register an app in Azure AD, set redirect `http://localhost:3001/api/calendar/microsoft/callback`, allow scopes `offline_access Calendars.ReadWrite User.Read`, and set `MICROSOFT_TENANT` to `common` or your tenant ID.
- ICS export: call `GET /api/appointments/{id}/ics` with a valid JWT to download `appointment-{id}.ics` (example: `curl -H "Authorization: Bearer <token>" http://localhost:3001/api/appointments/<seed-id>/ics`).
- Sync testing without external creds: endpoints return 400/501 when env or connections are missing; you can still queue jobs (`POST /api/calendar/google/sync/push/{appointmentId}` or `/sync/pull?safe=true`) to verify retry/backoff without crashing the app.

## Auto Atendimento (Leads & Conversas)

- Configure `INGEST_TENANT_KEYS` in `backend/.env` as comma-separated `key:tenantId` pairs (e.g., `INGEST_TENANT_KEYS=demo-key:<tenant-id>`). Ingest endpoints expect header `X-Tenant-Key: <key>`.
- Create webhook endpoints (for n8n) via `POST /api/webhook-endpoints` (auth): `{ "name": "...", "url": "...", "secret": "...", "eventTypes": ["lead.created","message.inbound"] }`. Payloads are signed with `X-Signature` (HMAC-SHA256 over raw body) and `X-Event`.
- ManyChat ingest example:
  ```bash
  curl -X POST http://localhost:3001/api/ingest/manychat \
    -H "Content-Type: application/json" \
    -H "X-Tenant-Key: demo-key" \
    -d '{"platform":"whatsapp","user":{"id":"user-123","name":"Lead A","phone":"+551199999999"},"message":{"text":"Quero comprar"}}'
  ```
- Website ingest example:
  ```bash
  curl -X POST http://localhost:3001/api/ingest/website \
    -H "Content-Type: application/json" \
    -H "X-Tenant-Key: demo-key" \
    -d '{"fullName":"Site Lead","email":"lead@site.com","phone":"+15551234567","message":"Preciso de orçamento"}'
  ```
- Authenticated examples:
  - List leads: `curl -H "Authorization: Bearer <token>" http://localhost:3001/api/leads`
  - Change status: `curl -X POST -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"status":"QUALIFIED","reason":"AI classify"}' http://localhost:3001/api/leads/<id>/status`
  - AI classify: `curl -X POST -H "Authorization: Bearer <token>" http://localhost:3001/api/ai/leads/<id>/classify`

## IA opcional

- Configure `OPENAI_API_KEY` (e opcionalmente `OPENAI_BASE_URL`, `DEFAULT_AI_MODEL`) em `backend/.env`. Sem chave, os endpoints de resumo/rascunho usam fallback básico e classificação retorna 503.
- Por tenant, habilite IA via `PATCH /api/ai/settings` (auth admin) com body típico:
  ```json
  {
    "enabled": true,
    "dailyTokenLimit": 5000,
    "defaultModel": "gpt-4.1-mini",
    "allowSummarize": true,
    "allowDraftReply": true
  }
  ```
- Endpoints:
  - `POST /api/ai/leads/:leadId/classify`
  - `POST /api/ai/conversations/:conversationId/summarize` (body opcional `{ "style": "short|medium|detailed", "locale": "pt-BR|en-US|es-ES" }`)
  - `POST /api/ai/conversations/:conversationId/draft-reply` (body opcional `{ "goal": "sales|support|billing|booking|generic", "tone": "friendly|neutral|premium", "locale": "pt-BR|en-US|es-ES" }`)
- Eventos emitidos para n8n: `lead.ai_classified` e `conversation.ai_summarized` (payload assinado pela infra de webhook outbound).
- Se IA estiver desabilitada ou limite diário estourado, retorna 403/429 com mensagem clara.

## Project Structure

```
btrix-app/
├── backend/              # Node.js + TypeScript API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth, validation, etc.
│   │   └── utils/        # Utilities
│   └── prisma/           # Database schema
├── frontend/             # React + TypeScript app
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── layouts/      # Layout components
│   │   ├── store/        # Zustand state management
│   │   └── utils/        # Utilities
└── package.json          # Root workspace config
```

## Features by Role

### Admin
- Full dashboard with business overview
- Inventory management
- Staff management and roster
- Services/products management
- Calendar and scheduling
- Orders and payments tracking
- Company settings

### Staff
- View personal roster
- Check-in/check-out
- View assigned orders and tasks

### Kitchen
- Real-time order display
- Update order status (Pending → In Preparation → Ready)
- Large, readable interface for kitchen screens

## API Endpoints

All API endpoints are prefixed with `/api`:

- `/api/auth/*` - Authentication
- `/api/dashboard/*` - Dashboard data
- `/api/orders/*` - Order management
- `/api/inventory/*` - Inventory management
- `/api/staff/*` - Staff management
- `/api/rosters/*` - Roster management
- `/api/services/*` - Services management
- `/api/payments/*` - Payment tracking
- `/api/schedules/*` - Calendar/scheduling
- `/api/check-ins/*` - Check-in/check-out
- `/api/webhooks/*` - BTRIX automation webhooks

## Production Build

```bash
# Build both applications
npm run build

# Start production server (backend)
cd backend
npm start

# Frontend build will be in frontend/dist
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env` file
- Ensure database exists

### Port Already in Use
- Backend defaults to port 3001
- Frontend defaults to port 3000
- Change ports in `.env` or `vite.config.ts`

### Migration Issues
- Run `npx prisma generate` before migrations
- Check Prisma schema for errors
- Reset database if needed: `npx prisma migrate reset`

## Next Steps

- Configure email service for password recovery
- Set up Stripe/PayPal webhooks for payment processing
- Connect BTRIX automations via webhook endpoints
- Customize company settings and branding
- Add more services/products through the admin panel

## Support

For issues or questions, refer to the main README.md file.


