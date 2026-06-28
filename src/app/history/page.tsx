"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getHistory, deleteHistory, clearHistory } from "@/lib/history";
import type { HistoryEntry } from "@/lib/types";
import { toolsById } from "@/lib/tools";
import { Trash2 } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  function handleDelete(id: string) {
    deleteHistory(id);
    setHistory(getHistory());
  }

  function handleClear() {
    if (confirm("Xóa toàn bộ lịch sử?")) {
      clearHistory();
      setHistory([]);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lịch sử cấu hình</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Lưu trên trình duyệt (localStorage). Không gửi lên server.
          </p>
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-red-600 hover:underline"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-gray-500">Chưa có lịch sử. Sinh lệnh và đặt tên khi lưu.</p>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => {
            const tool = toolsById[entry.toolId];
            return (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{entry.name}</p>
                  <p className="text-sm text-gray-500">
                    {tool?.definition.name || entry.toolId} ·{" "}
                    {new Date(entry.timestamp).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/tools/${entry.toolId}`}
                    className="text-sm text-ubuntu-orange hover:underline"
                  >
                    Mở
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    className="text-gray-400 hover:text-red-500"
                    aria-label="Xóa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
