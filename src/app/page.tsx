import Link from "next/link";
import { tools, serverProfiles } from "@/lib/tools";
import {
  Shield,
  Terminal,
  Copy,
  AlertTriangle,
  ArrowRight,
  Zap,
  Lock,
  BookOpen,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-12 pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface-elevated p-8 sm:p-12 shadow-card">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-ubuntu-orange/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-ubuntu-orange/20 bg-ubuntu-orange/5 px-3 py-1 text-xs font-semibold text-ubuntu-orange">
            <Zap className="h-3.5 w-3.5" />
            30+ công cụ quản trị Ubuntu
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-content sm:text-5xl lg:text-6xl">
            Sinh lệnh VPS
            <br />
            <span className="gradient-text">nhanh & an toàn</span>
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-content-muted">
            Ubuntu Command Helper giúp bạn tạo nhanh các lệnh cấu hình Ubuntu Server —
            firewall, SSH, Docker, Nginx, SSL, Node.js, MongoDB và nhiều hơn nữa.
            Chỉ sinh lệnh để copy,{" "}
            <strong className="font-semibold text-content">không chạy trên server</strong>.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/tools/ufw" className="btn-primary">
              Bắt đầu ngay
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/profiles" className="btn-secondary">
              Hồ sơ server
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 text-sm text-content-faint">
            <span className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-emerald-500" />
              Không lưu password
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-ubuntu-orange" />
              Cảnh báo & rollback
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-blue-500" />
              Dẫn chứng nguồn gốc
            </span>
          </div>
        </div>
      </section>

      {/* Features bento */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: Terminal,
            title: "Sinh lệnh",
            desc: "Form nhập → lệnh chuẩn, sẵn sàng copy",
            accent: "from-orange-500/20 to-orange-600/5",
          },
          {
            icon: Copy,
            title: "Copy & .sh",
            desc: "Copy từng block hoặc tải script tổng hợp",
            accent: "from-blue-500/20 to-blue-600/5",
          },
          {
            icon: Shield,
            title: "An toàn",
            desc: "Cảnh báo rủi ro, rollback, lệnh kiểm tra",
            accent: "from-emerald-500/20 to-emerald-600/5",
          },
          {
            icon: AlertTriangle,
            title: "Nguồn gốc",
            desc: "Link tài liệu chính thức từ nhà phát triển",
            accent: "from-violet-500/20 to-violet-600/5",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="card-hover group p-5"
          >
            <div
              className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${item.accent} p-3 transition-transform group-hover:scale-110`}
            >
              <item.icon className="h-6 w-6 text-ubuntu-orange" />
            </div>
            <h3 className="font-bold text-content">{item.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-content-muted">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Profiles */}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="section-title">Hồ sơ cấu hình</h2>
            <p className="section-subtitle">Workflow phổ biến cho từng loại server</p>
          </div>
          <Link
            href="/profiles"
            className="hidden items-center gap-1 text-sm font-medium text-ubuntu-orange hover:underline sm:flex"
          >
            Xem tất cả <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {serverProfiles.map((profile, i) => (
            <Link
              key={profile.id}
              href={`/profiles#${profile.id}`}
              className="card-hover group flex flex-col p-6"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="badge bg-ubuntu-orange/10 text-ubuntu-orange">
                  {profile.tools.length} bước
                </span>
                <ArrowRight className="h-4 w-4 text-content-faint transition-transform group-hover:translate-x-1 group-hover:text-ubuntu-orange" />
              </div>
              <h3 className="text-lg font-bold text-content">{profile.name}</h3>
              <p className="mt-1.5 flex-1 text-sm text-content-muted">{profile.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* All tools */}
      <section>
        <h2 className="section-title mb-6">
          Tất cả công cụ
          <span className="ml-2 text-lg font-normal text-content-faint">({tools.length})</span>
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <Link
              key={t.definition.id}
              href={`/tools/${t.definition.id}`}
              className="group flex items-center gap-3 rounded-xl border border-border bg-surface-muted/50 px-4 py-3 text-sm transition-all duration-200 hover:border-ubuntu-orange/30 hover:bg-surface-elevated hover:shadow-card"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-elevated text-xs font-bold text-ubuntu-orange shadow-sm transition-transform group-hover:scale-110">
                {t.definition.name.charAt(0)}
              </span>
              <span className="font-medium text-content-muted group-hover:text-content">
                {t.definition.name}
              </span>
              <ChevronRight className="ml-auto h-4 w-4 text-content-faint opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-6">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-content">Lưu ý quan trọng</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-content-muted">
              <li>• Ứng dụng không SSH hoặc chạy lệnh trên server của bạn.</li>
              <li>• Luôn đọc và hiểu lệnh trước khi chạy trên VPS production.</li>
              <li>• Nếu lệnh không khớp phiên bản Ubuntu, tham khảo tài liệu gốc.</li>
              <li>• Dữ liệu chỉ xử lý trên trình duyệt — không gửi ra ngoài.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
