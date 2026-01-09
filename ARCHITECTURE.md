# BTRIX Platform Architecture

## Overview

BTRIX is a modular, scalable web platform with a **single centralized back-end** capable of supporting multiple business types (restaurants, bike shops, clinics, pet stores, etc.). The core back-end manages all automation, logic, and data while allowing the creation of customized front-end interfaces for each sector.

## System Architecture

### 1. Centralized Back-End

The shared back-end provides:

- **Unified Authentication**: JWT with refresh tokens, role-based access control (RBAC)
- **Order/Service Management**: Multi-business type order handling with workflow engine
- **Workflow Engine**: Customizable status flows per business type
- **Notification System**: Email, WhatsApp, SMS, Push with queue and logs
- **Calendar & Appointments**: Multi-tenant scheduling system
- **Financial Module**: Transactions, payouts, reporting
- **Multi-tenant Database**: PostgreSQL with company isolation
- **REST APIs**: Full REST API with Swagger documentation
- **WebSocket Support**: Real-time updates for orders, notifications
- **Webhook System**: Incoming and outgoing webhooks for integrations

### 2. Tech Stack

#### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Queue System**: Redis + BullMQ for async job processing
- **Real-time**: Socket.IO for WebSocket connections
- **Authentication**: JWT with refresh tokens
- **Logging**: Winston with file and console transports
- **API Docs**: Swagger/OpenAPI 3.0
- **Testing**: Jest with 80%+ coverage target
- **Security**: Helmet, rate limiting, field encryption

#### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **i18n**: react-i18next
- **HTTP Client**: Axios
- **Real-time**: Socket.IO client
- **Backoffice App**: Next.js App Router with shared shell (TopBar + CommandBar + mobile drawer)
- **Backoffice Routes**: /dashboard, /orders, /customers, /agenda, /inventory, /robots, /data

### 3. Database Schema

#### Multi-Tenant Architecture
- All entities are scoped by `companyId`
- Company model stores business type, locale, timezone, currency
- Data isolation enforced at application level

#### Core Models
- **Company**: Multi-tenant root entity
- **User**: Authentication and authorization
- **Order**: Orders with workflow-based status
- **Service/Product**: Catalog items
- **Inventory**: Stock management
- **Payment**: Financial transactions
- **Schedule**: Calendar/appointments
- **Workflow**: Customizable status flows
- **Integration**: External system connections
- **Notification**: Notification queue and logs
- **Webhook**: Webhook subscriptions
- **Translation**: i18n translations
- **AuditLog**: GDPR compliance logging

### 4. Workflow Engine

The workflow engine allows each business type to have custom status flows:

**Restaurant Order Flow:**
```
PENDING → CONFIRMED → PREPARING → READY → DELIVERED/COMPLETED
```

**Bike Shop Service Flow:**
```
QUOTE_REQUESTED → QUOTE_SENT → QUOTE_APPROVED → IN_PROGRESS → READY_FOR_PICKUP → COMPLETED
```

- Workflows are defined per business type and entity type
- Status transitions are validated
- Status history is tracked
- Terminal statuses prevent further transitions

### 5. Notification System

- **Channels**: Email (SMTP), WhatsApp (Twilio), SMS (Twilio), Push (planned)
- **Queue**: BullMQ with Redis for async processing
- **Retry Logic**: Exponential backoff with configurable max retries
- **Logging**: All notifications logged with status tracking
- **Templates**: Support for template-based notifications

### 6. Integration System

Supported integrations:
- **CRM**: Bitrix24
- **Delivery**: iFood, Rappi
- **ERP**: Bling, Tiny ERP
- **Payments**: Stripe, MercadoPago, Pagar.me
- **Shipping**: MelhorEnvio, Correios, JadLog
- **Analytics**: Google Analytics, Meta Pixel

Integration features:
- Encrypted credential storage
- Sync logging and error tracking
- Webhook support for incoming events
- Async processing via queue

### 7. Security Features

- **Authentication**: JWT with short-lived access tokens (15m) and long-lived refresh tokens (30d)
- **Authorization**: Role-based access control (ADMIN, STAFF, KITCHEN)
- **Rate Limiting**: Per-endpoint rate limits (auth: 5/15min, API: 100/15min)
- **Field Encryption**: Sensitive data (API keys, PII) encrypted at rest
- **Security Headers**: Helmet.js with CSP, XSS protection, etc.
- **GDPR Compliance**: Data access requests, audit logging, consent management

### 8. Internationalization (i18n)

- **Backend**: Translation service with company-specific and system-wide translations
- **Frontend**: react-i18next with language detection
- **Currency**: Formatting based on company locale
- **Timezone**: All dates stored in UTC, converted on display
- **Locale Support**: pt-BR (default), en-US, es-ES, etc.

### 9. Real-Time Features

WebSocket events:
- `order:update` - Order status changes
- `notification` - New notifications
- Company-wide and user-specific rooms

### 10. API Documentation

- **Swagger UI**: Available at `/api-docs` (development only)
- **OpenAPI 3.0**: JSON spec at `/api-docs.json`
- **Authentication**: Bearer token required for protected endpoints

## Deployment

### Docker Setup

```bash
# Start all services
docker-compose up -d

# Services:
# - PostgreSQL (port 5432)
# - Redis (port 6379)
# - Backend API (port 3001)
# - Frontend (port 3000)
```

### Environment Variables

See `.env.example` for required variables:
- Database connection
- Redis connection
- JWT secrets
- SMTP configuration
- Twilio credentials
- Encryption keys

### Database Migrations

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

## Testing

```bash
# Run tests
cd backend
npm test

# Coverage report
npm run test:coverage

# Target: 80%+ coverage
```

## Monitoring & Logging

- **Logs**: Winston with file rotation
- **Request Logging**: Morgan HTTP logger
- **Error Tracking**: Structured error logging
- **Queue Monitoring**: BullMQ dashboard (planned)

## Scalability

- **Horizontal Scaling**: Stateless API, can run multiple instances
- **Database**: Connection pooling, read replicas supported
- **Queue**: Redis cluster support
- **CDN**: Frontend assets can be served via CDN
- **Load Balancing**: Nginx/HAProxy compatible

## Future Enhancements

- [ ] Microservices architecture option
- [ ] GraphQL API layer
- [ ] Advanced analytics dashboard
- [ ] Mobile app support
- [ ] Plugin system for custom business logic
- [ ] Multi-region deployment support

