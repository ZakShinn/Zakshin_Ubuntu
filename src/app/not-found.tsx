import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 text-8xl font-extrabold gradient-text">404</div>
      <h1 className="text-2xl font-bold text-content">Không tìm thấy công cụ</h1>
      <p className="mt-2 max-w-sm text-content-muted">
        Trang hoặc công cụ bạn tìm không tồn tại.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-primary">
          <Home className="h-4 w-4" />
          Trang chủ
        </Link>
        <Link href="/tools/ufw" className="btn-secondary">
          <Search className="h-4 w-4" />
          Khám phá công cụ
        </Link>
      </div>
    </div>
  );
}
