# BTRIX Business Control Web App

Operational business control system for managing restaurants, clinics, workshops, stores, and other service businesses.

## 🎯 Overview

BTRIX is a **functional operational web app** designed for daily business operations. It is NOT a marketing site or landing page - it's a complete business control system ready for client delivery.

## ✨ Features

### Core Capabilities
- ✅ Multi-tenant architecture (each company isolated)
- ✅ Role-based access control (Admin, Staff, Kitchen)
- ✅ Real-time dashboards for each role
- ✅ Inventory management with low stock alerts
- ✅ Staff roster and schedule management
- ✅ Employee check-in/check-out system
- ✅ Order management and tracking
- ✅ Sales and payments tracking
- ✅ Calendar and appointment scheduling
- ✅ Services/products catalog
- ✅ Company settings and configuration
- ✅ Webhook integration for BTRIX automations

### Role-Specific Features

**Admin (Business Owner)**
- Complete business overview dashboard
- Inventory management with stock tracking
- Staff management and roster creation
- Services/products catalog
- Calendar and scheduling
- Orders and payments tracking
- Analytics and reporting
- Company settings

**Staff**
- Personal roster view
- Check-in/check-out functionality
- Assigned orders and tasks
- Mobile-friendly interface

**Kitchen/Production**
- Real-time order display
- Order status management (Pending → In Preparation → Ready)
- Large, readable interface optimized for kitchen screens
- Auto-refresh for live updates

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS (Dark mode by default)
- **State Management**: Zustand
- **Routing**: React Router v6
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **API**: RESTful architecture

## 📋 Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn

## 🚀 Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Quick Installation

```bash
# Install all dependencies
npm run install:all

# Setup database (create .env file first)
cd backend
npx prisma generate
npx prisma migrate dev
npm run db:seed

# Start development servers
cd ..
npm run dev
```

### Default Login Credentials (from seed)

- **Admin**: `admin@btrix.com` / `admin123`
- **Staff**: `staff@btrix.com` / `staff123`
- **Kitchen**: `kitchen@btrix.com` / `kitchen123`

## 📁 Project Structure

```
btrix-app/
├── backend/                    # Node.js + TypeScript API
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── services/           # Business logic
│   │   ├── routes/             # API route definitions
│   │   ├── middleware/         # Auth, validation, error handling
│   │   ├── utils/              # Helper utilities
│   │   └── prisma/
│   │       └── seed.ts         # Database seeding
│   └── prisma/
│       └── schema.prisma       # Database schema
├── frontend/                   # React + TypeScript app
│   ├── src/
│   │   ├── pages/              # Page components
│   │   │   ├── admin/          # Admin pages
│   │   │   ├── staff/          # Staff pages
│   │   │   └── kitchen/        # Kitchen pages
│   │   ├── layouts/            # Layout components
│   │   ├── store/              # Zustand stores
│   │   └── utils/              # Utilities
│   └── vite.config.ts
└── package.json                # Root workspace config
```

## 🔌 API Endpoints

All endpoints are prefixed with `/api`:

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/password-reset` - Request password reset

### Dashboards
- `GET /api/dashboard/admin` - Admin dashboard data
- `GET /api/dashboard/staff` - Staff dashboard data
- `GET /api/dashboard/kitchen` - Kitchen dashboard data

### Resources
- `/api/orders/*` - Order management
- `/api/inventory/*` - Inventory management
- `/api/users/*` - User/staff management
- `/api/rosters/*` - Roster/schedule management
- `/api/services/*` - Services/products
- `/api/payments/*` - Payment tracking
- `/api/schedules/*` - Calendar/scheduling
- `/api/check-ins/*` - Check-in/check-out
- `/api/companies/*` - Company settings
- `/api/webhooks/*` - BTRIX automation webhooks

## 🔐 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Multi-tenant data isolation
- Input validation and sanitization
- CORS configuration

## 🔗 BTRIX Automation Integration

The app is designed to integrate with BTRIX automations (n8n, etc.) via:

- **Webhooks**: `/api/webhooks/btrix` - Receive events from automations
- **Events**: `/api/webhooks/events` - Create events that trigger automations

The app does NOT execute automations itself but provides:
- Data consumption from automations
- Event triggering for automation workflows
- Status and result storage

## 🚫 What This App Is NOT

- ❌ Landing page or marketing site
- ❌ Sales page or promotional content
- ❌ Public-facing website
- ❌ Contact/sales pages
- ❌ Blog or content management system

This is a **pure operational application** for business control and management.

## 📝 Environment Variables

Create `backend/.env`:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/btrix_db?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

## 🏗 Building for Production

```bash
# Build both applications
npm run build

# Backend will be in backend/dist
# Frontend will be in frontend/dist
```

## 📚 Documentation

- [SETUP.md](./SETUP.md) - Detailed setup guide
- API documentation: See individual route files in `backend/src/routes/`

## 🎨 Design Philosophy

- **Dark mode by default** - Optimized for long-term use
- **Minimalist UI** - Clean, functional, no distractions
- **Mobile-first** - Responsive design for all devices
- **Fast and efficient** - Optimized for daily operations
- **Role-appropriate** - Each role sees only relevant features

## 🔄 Future Enhancements (Architecture Ready)

The codebase is structured to easily support:
- Tablet integration for tables/customers
- Totem kiosks
- POS system integration
- Digital wallet functionality
- Credit/token systems
- PWA capabilities

## 📞 Support

For setup issues, refer to SETUP.md. For code-related questions, check the inline documentation in the source files.

## 📄 License

This is a proprietary business application for BTRIX clients.

