#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Bắt đầu chuẩn bị deploy...');

// 1. Kiểm tra Git
try {
  execSync('git --version', { stdio: 'pipe' });
  console.log('✅ Git đã được cài đặt');
} catch (error) {
  console.log('❌ Git chưa được cài đặt. Vui lòng cài đặt Git từ: https://git-scm.com/download/win');
  process.exit(1);
}

// 2. Kiểm tra Git repository
try {
  execSync('git status', { stdio: 'pipe' });
  console.log('✅ Git repository đã được khởi tạo');
} catch (error) {
  console.log('📁 Khởi tạo Git repository...');
  execSync('git init', { stdio: 'inherit' });
  console.log('✅ Git repository đã được khởi tạo');
}

// 3. Thêm tất cả files
console.log('📦 Thêm files vào Git...');
execSync('git add .', { stdio: 'inherit' });

// 4. Commit
console.log('💾 Commit changes...');
try {
  execSync('git commit -m "Prepare for production deployment"', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️  Không có thay đổi để commit');
}

// 5. Kiểm tra remote
try {
  execSync('git remote -v', { stdio: 'pipe' });
  console.log('✅ Remote repository đã được cấu hình');
} catch (error) {
  console.log('⚠️  Chưa có remote repository. Vui lòng thêm remote:');
  console.log('   git remote add origin https://github.com/yourusername/banhang-web.git');
}

// 6. Build test
console.log('🔨 Test build...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build thành công');
} catch (error) {
  console.log('❌ Build thất bại. Vui lòng kiểm tra lỗi:');
  console.log(error.message);
  process.exit(1);
}

console.log('\n🎉 Chuẩn bị deploy hoàn tất!');
console.log('\n📋 Các bước tiếp theo:');
console.log('1. Tạo GitHub repository: https://github.com/new');
console.log('2. Thêm remote: git remote add origin https://github.com/yourusername/banhang-web.git');
console.log('3. Push code: git push -u origin main');
console.log('4. Deploy lên Vercel: https://vercel.com');
console.log('5. Cấu hình database và environment variables');
console.log('\n📖 Xem hướng dẫn chi tiết trong file DEPLOY.md');

