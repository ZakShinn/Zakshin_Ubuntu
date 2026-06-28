import Link from "next/link";
import { tools, serverProfiles } from "@/lib/tools";
import {
  Shield,
  Terminal,
  Copy,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <section className="rounded-2xl bg-gradient-to-br from-ubuntu-aubergine to-gray-900 p-8 text-white">
        <h1 className="text-3xl font-bold sm:text-4xl">Ubuntu Command Helper</h1>
        <p className="mt-4 text-lg text-gray-200 leading-relaxed">
          Ubuntu Command Helper giúp bạn tạo nhanh các lệnh cấu hình Ubuntu Server như
          firewall, SSH, Docker, Nginx, SSL, Node.js, MongoDB, systemd và nhiều công cụ
          quản trị phổ biến khác. Công cụ chỉ sinh lệnh để bạn kiểm tra và copy,{" "}
          <strong>không tự chạy lệnh trên server</strong>.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/tools/ufw"
            className="inline-flex items-center gap-2 rounded-lg bg-ubuntu-orange px-5 py-2.5 font-medium hover:bg-orange-600"
          >
            Bắt đầu <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/profiles"
            className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-2.5 font-medium hover:bg-white/10"
          >
            Hồ sơ server
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Terminal, title: "Sinh lệnh", desc: "Form nhập → lệnh chuẩn copy" },
          { icon: Copy, title: "Copy & tải .sh", desc: "Copy từng block hoặc tải script" },
          { icon: Shield, title: "An toàn", desc: "Cảnh báo, rollback, kiểm tra" },
          { icon: AlertTriangle, title: "Nguồn gốc", desc: "Dẫn chứng tài liệu chính thức" },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <item.icon className="h-8 w-8 text-ubuntu-orange" />
            <h3 className="mt-2 font-semibold text-gray-900 dark:text-white">{item.title}</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Hồ sơ cấu hình phổ biến
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {serverProfiles.map((profile) => (
            <Link
              key={profile.id}
              href={`/profiles#${profile.id}`}
              className="rounded-lg border border-gray-200 bg-white p-4 transition hover:border-ubuntu-orange dark:border-gray-700 dark:bg-gray-800"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">{profile.name}</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{profile.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Tất cả công cụ ({tools.length})
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <Link
              key={t.definition.id}
              href={`/tools/${t.definition.id}`}
              className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-ubuntu-orange hover:text-ubuntu-orange dark:border-gray-700 dark:text-gray-300"
            >
              {t.definition.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
        <h3 className="font-semibold text-amber-900 dark:text-amber-200">Lưu ý quan trọng</h3>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-800 dark:text-amber-300">
          <li>Ứng dụng không SSH hoặc chạy lệnh trên server của bạn.</li>
          <li>Luôn đọc và hiểu lệnh trước khi chạy trên VPS production.</li>
          <li>Nếu lệnh không khớp phiên bản Ubuntu, tham khảo tài liệu gốc từ nhà phát triển.</li>
          <li>Không lưu mật khẩu — dữ liệu chỉ xử lý trên trình duyệt.</li>
        </ul>
      </section>
    </div>
  );
}
