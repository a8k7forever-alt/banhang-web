# Hệ thống quản lý bán hàng

Hệ thống quản lý bán hàng toàn diện với Next.js 15, Prisma, và SQLite.

## 🚀 Tính năng

- 📦 Quản lý sản phẩm và vật liệu
- 👥 Quản lý khách hàng
- 🧾 Tạo và quản lý hóa đơn
- 📥 Quản lý nhập hàng
- 💰 Quản lý nguồn tiền
- 📊 Báo cáo lợi nhuận
- 🔐 Hệ thống phân quyền (Admin/User)

## 🛠️ Công nghệ

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite với Prisma ORM
- **Authentication**: Custom auth system
- **UI**: Tailwind CSS với custom components

## 📦 Cài đặt

```bash
# Clone repository
git clone <repository-url>
cd banhang-web

# Cài đặt dependencies
npm install

# Tạo database
npx prisma migrate dev

# Chạy development server
npm run dev
```

## 🌐 Deploy lên Vercel

### Bước 1: Chuẩn bị
1. Tạo tài khoản Vercel: https://vercel.com
2. Kết nối GitHub account
3. Push code lên GitHub repository

### Bước 2: Deploy
1. Vào Vercel Dashboard
2. Click "New Project"
3. Import GitHub repository
4. Cấu hình:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Click "Deploy"

### Bước 3: Cấu hình Database
1. Vào Vercel Dashboard → Project Settings
2. Vào tab "Environment Variables"
3. Thêm:
   - `DATABASE_URL`: URL database production
   - `NEXTAUTH_SECRET`: Secret key cho auth

### Bước 4: Database Production
Sử dụng một trong các options:
- **Vercel Postgres** (khuyến nghị)
- **PlanetScale** (MySQL)
- **Supabase** (PostgreSQL)
- **Railway** (PostgreSQL)

## 🔧 Cấu hình Production

### Environment Variables
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-secret-key"
NODE_ENV="production"
```

### Database Migration
```bash
# Chạy migration cho production
npx prisma migrate deploy
```

## 📱 Demo

- **Development**: http://localhost:3000
- **Production**: https://your-domain.vercel.app

## 👥 Tài khoản mặc định

- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123

## 📄 License

MIT License