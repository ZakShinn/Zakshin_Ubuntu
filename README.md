# Ubuntu Command Helper

Công cụ web sinh lệnh cấu hình Ubuntu Server — chạy trên Vercel với Next.js 15.

## Tính năng

- 30+ module: iptables, UFW, SSH, Docker, Nginx, Certbot, Node.js, MongoDB, systemd, v.v.
- Form nhập → sinh lệnh cài đặt, thực thi, kiểm tra, rollback
- Chế độ an toàn / nâng cao
- Copy từng block, tải file `.sh`
- Dark mode, responsive mobile
- Lịch sử localStorage (không backend)
- Hồ sơ cấu hình server phổ biến

## Chạy local

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

## Deploy Vercel

```bash
vercel
```

Hoặc kết nối repo GitHub với Vercel — framework tự nhận Next.js.

## Lưu ý

Ứng dụng **không** SSH hoặc chạy lệnh trên server. Chỉ sinh lệnh để người dùng tự kiểm tra và copy.
