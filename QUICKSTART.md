# BTRIX Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Setup Database

Create PostgreSQL database:
```sql
CREATE DATABASE btrix_db;
```

Create `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/btrix_db?schema=public"
JWT_SECRET="change-this-in-production"
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### 3. Initialize Database
```bash
cd backend
npx prisma generate
npx prisma migrate dev
npm run db:seed
```

### 4. Start App
```bash
cd ..
npm run dev
```

### 5. Login
Open http://localhost:3000

**Default Accounts:**
- Admin: `admin@btrix.com` / `admin123`
- Staff: `staff@btrix.com` / `staff123`
- Kitchen: `kitchen@btrix.com` / `kitchen123`

## 📱 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Prisma Studio**: `cd backend && npm run db:studio`

## 🎯 What You Can Do

### As Admin
- View business dashboard
- Manage inventory
- Create staff schedules
- Track orders and payments
- Configure services/products

### As Staff
- Check in/out
- View your schedule
- See assigned orders

### As Kitchen
- View live orders
- Update order status
- Large display for kitchen screens

## 🐛 Troubleshooting

**Database connection error?**
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env`

**Port already in use?**
- Backend: Change `PORT` in `.env`
- Frontend: Change port in `vite.config.ts`

**Can't login?**
- Make sure you ran `npm run db:seed`
- Check browser console for errors

## 📚 Next Steps

- Customize company settings
- Add your services/products
- Create staff members
- Set up inventory items
- Connect BTRIX automations via webhooks

For detailed setup, see [SETUP.md](./SETUP.md)


