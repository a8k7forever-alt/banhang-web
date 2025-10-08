# 🗄️ Hướng dẫn thiết lập Supabase Database

## Bước 1: Tạo tài khoản Supabase

1. Truy cập: https://supabase.com
2. Nhấn "Start your project" hoặc "Sign up"
3. Đăng ký bằng GitHub (khuyến nghị) hoặc email
4. Xác thực tài khoản qua email

## Bước 2: Tạo project mới

1. Nhấn "New Project"
2. Chọn Organization (hoặc tạo mới)
3. Điền thông tin:
   - **Name:** `banhang-web-db`
   - **Database Password:** Tạo password mạnh (lưu lại!)
   - **Region:** Chọn gần Việt Nam (Singapore hoặc Tokyo)
4. Nhấn "Create new project"

## Bước 3: Lấy thông tin kết nối

Sau khi tạo xong, bạn sẽ thấy:

1. **Project URL:** `https://xxx.supabase.co`
2. **API Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. **Database Password:** (đã tạo ở bước 2)

## Bước 4: Lấy Database URL

1. Vào **Settings** → **Database**
2. Tìm **"Connection string"**
3. Chọn **"URI"**
4. Copy URL có dạng:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

## Bước 5: Cấu hình Environment Variables

### Trên Vercel:

1. Vào **Vercel Dashboard** → **Project Settings** → **Environment Variables**
2. Thêm các biến sau:

```
DATABASE_URL = postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
NEXT_PUBLIC_BASE_URL = https://your-app.vercel.app
```

### Trên Local (tùy chọn):

1. Tạo file `.env.local`:
```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## Bước 6: Chạy Migration

Sau khi cấu hình xong, chạy lệnh:

```bash
npm run db:setup
```

Hoặc từng bước:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

## Bước 7: Kiểm tra kết nối

Chạy lệnh để kiểm tra:

```bash
npx prisma studio
```

Sẽ mở Prisma Studio để xem database.

## ✅ Hoàn thành!

Database đã sẵn sàng sử dụng với ứng dụng Next.js của bạn!

## 🔧 Troubleshooting

### Lỗi kết nối:
- Kiểm tra lại DATABASE_URL
- Đảm bảo password đúng
- Kiểm tra region của database

### Lỗi migration:
- Chạy `npx prisma generate` trước
- Kiểm tra quyền truy cập database
- Thử `npx prisma db push --force-reset` (cẩn thận!)

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Supabase Dashboard → Database → Logs
2. Vercel Dashboard → Functions → Logs
3. Terminal output khi chạy migration
