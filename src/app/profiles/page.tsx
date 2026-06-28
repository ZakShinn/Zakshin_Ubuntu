import Link from "next/link";
import { serverProfiles, toolsById } from "@/lib/tools";
import { ArrowRight } from "lucide-react";

export default function ProfilesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hồ sơ cấu hình server</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Chọn hồ sơ phù hợp để xem danh sách công cụ cần cấu hình theo thứ tự khuyến nghị.
        </p>
      </div>

      <div className="space-y-6">
        {serverProfiles.map((profile) => (
          <section
            key={profile.id}
            id={profile.id}
            className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{profile.name}</h2>
            <p className="mt-1 text-gray-600 dark:text-gray-400">{profile.description}</p>

            <ol className="mt-4 space-y-2">
              {profile.tools.map((toolId: string, index: number) => {
                const tool = toolsById[toolId];
                if (!tool) return null;
                return (
                  <li key={toolId}>
                    <Link
                      href={`/tools/${toolId}`}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ubuntu-orange/10 text-xs font-bold text-ubuntu-orange">
                        {index + 1}
                      </span>
                      <span className="flex-1 font-medium text-gray-900 dark:text-white">
                        {tool.definition.name}
                      </span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
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
