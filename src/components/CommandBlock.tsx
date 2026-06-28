"use client";

import { useState } from "react";
import { Copy, Check, Download, ExternalLink } from "lucide-react";
import type { RiskLevel } from "@/lib/types";
import clsx from "clsx";

const riskStyles: Record<RiskLevel, string> = {
  low: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20",
  high: "bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20",
};

const riskLabels: Record<RiskLevel, string> = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
};

const riskDots: Record<RiskLevel, string> = {
  low: "bg-emerald-500",
  medium: "bg-amber-500",
  high: "bg-red-500",
};

interface CopyButtonProps {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" onClick={handleCopy} className="btn-ghost">
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Đã copy" : label}
    </button>
  );
}

interface DownloadScriptButtonProps {
  content: string;
  filename: string;
}

export function DownloadScriptButton({ content, filename }: DownloadScriptButtonProps) {
  function handleDownload() {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" onClick={handleDownload} className="btn-primary !px-3 !py-1.5 !text-xs">
      <Download className="h-3.5 w-3.5" />
      Tải .sh
    </button>
  );
}

interface CommandBlockProps {
  title: string;
  description?: string;
  commands: string;
  riskLevel: RiskLevel;
  checks?: string;
  rollback?: string;
  warnings?: string[];
  source?: string;
}

export function CommandBlock({
  title,
  description,
  commands,
  riskLevel,
  checks,
  rollback,
  warnings,
  source,
}: CommandBlockProps) {
  const scriptContent = `#!/bin/bash\nset -e\n\n# ${title}\n${commands}`;

  return (
    <div className="card animate-slide-up overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-content">{title}</h3>
          {description && (
            <p className="mt-0.5 text-sm text-content-muted">{description}</p>
          )}
        </div>
        <span
          className={clsx(
            "badge ring-1 ring-inset",
            riskStyles[riskLevel]
          )}
        >
          <span className={clsx("mr-1.5 inline-block h-1.5 w-1.5 rounded-full", riskDots[riskLevel])} />
          Rủi ro {riskLabels[riskLevel]}
        </span>
      </div>

      {warnings && warnings.length > 0 && (
        <div className="space-y-1 border-b border-border bg-red-500/5 px-4 py-3">
          {warnings.map((w, i) => (
            <p key={i} className="text-sm text-red-600 dark:text-red-400">
              ⚠ {w}
            </p>
          ))}
        </div>
      )}

      {/* Terminal */}
      <div className="p-4">
        <div className="terminal-window">
          <div className="terminal-header">
            <span className="terminal-dot bg-[#ff5f57]" />
            <span className="terminal-dot bg-[#febc2e]" />
            <span className="terminal-dot bg-[#28c840]" />
            <span className="ml-2 text-xs text-white/40">bash</span>
          </div>
          <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-[#7ee787]">
            <code>{commands}</code>
          </pre>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={commands} />
          <DownloadScriptButton
            content={scriptContent}
            filename={`${title.replace(/\s+/g, "-").toLowerCase()}.sh`}
          />
        </div>
      </div>

      {checks && (
        <div className="border-t border-border bg-surface-muted/50 px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-content-faint">
            Kiểm tra
          </p>
          <pre className="overflow-x-auto rounded-lg bg-[#0d1117] p-3 font-mono text-xs text-[#79c0ff]">
            <code>{checks}</code>
          </pre>
          <div className="mt-2">
            <CopyButton text={checks} label="Copy kiểm tra" />
          </div>
        </div>
      )}

      {rollback && (
        <div className="border-t border-border bg-amber-500/5 px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
            Rollback
          </p>
          <pre className="overflow-x-auto rounded-lg bg-[#0d1117] p-3 font-mono text-xs text-amber-300/90">
            <code>{rollback}</code>
          </pre>
          <div className="mt-2">
            <CopyButton text={rollback} label="Copy rollback" />
          </div>
        </div>
      )}

      {source && (
        <div className="border-t border-border px-4 py-3">
          <a
            href={source}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-content-muted transition-colors hover:text-ubuntu-orange"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Nguồn: {new URL(source).hostname}
            <span className="text-content-faint">— tham khảo tài liệu gốc nếu lệnh không khớp</span>
          </a>
        </div>
      )}
    </div>
  );
}
