import Link from "next/link";
import { serverProfiles, toolsById } from "@/lib/tools";
import { ArrowRight, LayoutTemplate } from "lucide-react";

export default function ProfilesPage() {
  return (
    <div className="space-y-8 pb-8">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-elevated p-6 shadow-card sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
            <LayoutTemplate className="h-6 w-6 text-violet-500" />
          </div>
          <div>
            <h1 className="section-title">Hồ sơ cấu hình server</h1>
            <p className="section-subtitle">
              Chọn hồ sơ phù hợp để xem danh sách công cụ cần cấu hình theo thứ tự khuyến nghị.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {serverProfiles.map((profile, pi) => (
          <section
            key={profile.id}
            id={profile.id}
            className="card overflow-hidden"
            style={{ animationDelay: `${pi * 60}ms` }}
          >
            <div className="border-b border-border bg-surface-muted/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-content">{profile.name}</h2>
                  <p className="mt-0.5 text-sm text-content-muted">{profile.description}</p>
                </div>
                <span className="badge bg-ubuntu-orange/10 text-ubuntu-orange">
                  {profile.tools.length} bước
                </span>
              </div>
            </div>

            <ol className="divide-y divide-border">
              {profile.tools.map((toolId: string, index: number) => {
                const tool = toolsById[toolId];
                if (!tool) return null;
                return (
                  <li key={toolId}>
                    <Link
                      href={`/tools/${toolId}`}
                      className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-surface-muted/50"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ubuntu-orange/20 to-ubuntu-orange/5 text-sm font-bold text-ubuntu-orange transition-transform group-hover:scale-110">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-content">{tool.definition.name}</p>
                        <p className="truncate text-xs text-content-faint">
                          {tool.definition.description}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-content-faint transition-all group-hover:translate-x-1 group-hover:text-ubuntu-orange" />
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
