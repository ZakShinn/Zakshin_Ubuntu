"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getHistory, deleteHistory, clearHistory } from "@/lib/history";
import type { HistoryEntry } from "@/lib/types";
import { toolsById } from "@/lib/tools";
import { Trash2, History, Clock, ExternalLink } from "lucide-react";

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
    <div className="space-y-8 pb-8">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-elevated p-6 shadow-card sm:p-8">
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
              <History className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h1 className="section-title">Lịch sử cấu hình</h1>
              <p className="section-subtitle">
                Lưu trên trình duyệt (localStorage). Không gửi lên server.
              </p>
            </div>
          </div>
          {history.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
            >
              Xóa tất cả
            </button>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="card flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-muted">
            <Clock className="h-8 w-8 text-content-faint" />
          </div>
          <p className="font-medium text-content-muted">Chưa có lịch sử</p>
          <p className="mt-1 text-sm text-content-faint">
            Sinh lệnh và đặt tên khi lưu để xem lại sau.
          </p>
          <Link href="/tools/ufw" className="btn-primary mt-6">
            Bắt đầu cấu hình
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => {
            const tool = toolsById[entry.toolId];
            return (
              <div
                key={entry.id}
                className="card-hover group flex items-center gap-4 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-sm font-bold text-ubuntu-orange">
                  {(tool?.definition.name || "?").charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-content">{entry.name}</p>
                  <p className="flex items-center gap-2 text-sm text-content-faint">
                    <span>{tool?.definition.name || entry.toolId}</span>
                    <span>·</span>
                    <span>{new Date(entry.timestamp).toLocaleString("vi-VN")}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/tools/${entry.toolId}`}
                    className="btn-ghost opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Mở
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    className="rounded-lg p-2 text-content-faint transition-colors hover:bg-red-500/10 hover:text-red-500"
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
