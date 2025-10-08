# 🚀 Hướng dẫn Deploy lên Vercel

## Bước 1: Cài đặt Git
1. Tải Git từ: https://git-scm.com/download/win
2. Cài đặt với default settings
3. Restart terminal

## Bước 2: Tạo GitHub Repository
1. Vào https://github.com
2. Click "New repository"
3. Tên: `banhang-web`
4. Chọn "Public" hoặc "Private"
5. Click "Create repository"

## Bước 3: Push code lên GitHub
```bash
# Khởi tạo git
git init

# Thêm tất cả files
git add .

# Commit lần đầu
git commit -m "Initial commit: Hệ thống quản lý bán hàng"

# Kết nối với GitHub (thay yourusername)
git remote add origin https://github.com/yourusername/banhang-web.git

# Push lên GitHub
git push -u origin main
```

## Bước 4: Deploy lên Vercel
1. Vào https://vercel.com
2. Click "Sign up" → "Continue with GitHub"
3. Click "New Project"
4. Import repository `banhang-web`
5. Cấu hình:
   - Framework: Next.js (auto-detect)
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Click "Deploy"

## Bước 5: Cấu hình Database
### Option 1: Vercel Postgres (Khuyến nghị)
1. Vào Vercel Dashboard → Project → Storage
2. Click "Create Database" → "Postgres"
3. Tên: `banhang-db`
4. Click "Create"
5. Copy connection string

### Option 2: Railway (Miễn phí)
1. Vào https://railway.app
2. Click "New Project" → "Provision PostgreSQL"
3. Click database → "Connect" → "Postgres"
4. Copy connection string

## Bước 6: Cấu hình Environment Variables
Vào Vercel Dashboard → Project → Settings → Environment Variables:

```env
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
NODE_ENV=production
```

## Bước 7: Chạy Migration
1. Vào Vercel Dashboard → Project → Functions
2. Click "Terminal"
3. Chạy lệnh:
```bash
npx prisma migrate deploy
npx prisma generate
```

## Bước 8: Test Production
1. Vào URL: `https://your-project.vercel.app`
2. Test các tính năng:
   - Đăng nhập: admin@example.com / admin123
   - Tạo sản phẩm, khách hàng, hóa đơn
   - Xem báo cáo

## ✅ Kết quả
- 🌐 URL: https://your-project.vercel.app
- 🔒 SSL: Tự động
- ⚡ CDN: Global
- 🔄 Auto deploy: Mỗi khi push code

## 🆘 Troubleshooting
### Lỗi Database:
```bash
npx prisma migrate deploy
npx prisma generate
```

### Lỗi Build:
```bash
npm run build
npm run lint
```

### Lỗi Environment:
- Kiểm tra Environment Variables
- Restart deployment

