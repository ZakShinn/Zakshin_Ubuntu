"use client";

import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import type { RiskLevel } from "@/lib/types";
import clsx from "clsx";

const riskStyles: Record<RiskLevel, string> = {
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

const riskLabels: Record<RiskLevel, string> = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
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
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
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
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex items-center gap-1.5 rounded-md bg-ubuntu-orange px-2.5 py-1.5 text-xs font-medium text-white hover:bg-orange-600"
    >
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
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          {description && (
            <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">{description}</p>
          )}
        </div>
        <span className={clsx("rounded-full px-2.5 py-0.5 text-xs font-medium", riskStyles[riskLevel])}>
          Rủi ro: {riskLabels[riskLevel]}
        </span>
      </div>

      {warnings && warnings.length > 0 && (
        <div className="mb-3 space-y-1">
          {warnings.map((w, i) => (
            <p key={i} className="text-sm text-red-600 dark:text-red-400">⚠ {w}</p>
          ))}
        </div>
      )}

      <pre className="mb-3 overflow-x-auto rounded-md bg-gray-900 p-3 text-sm text-green-400">
        <code>{commands}</code>
      </pre>

      <div className="flex flex-wrap gap-2">
        <CopyButton text={commands} />
        <DownloadScriptButton content={scriptContent} filename={`${title.replace(/\s+/g, "-").toLowerCase()}.sh`} />
      </div>

      {checks && (
        <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-700">
          <p className="mb-1 text-xs font-medium text-gray-500">Kiểm tra:</p>
          <pre className="overflow-x-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-900 dark:text-gray-300">
            <code>{checks}</code>
          </pre>
          <div className="mt-1">
            <CopyButton text={checks} label="Copy kiểm tra" />
          </div>
        </div>
      )}

      {rollback && (
        <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-700">
          <p className="mb-1 text-xs font-medium text-amber-600">Rollback:</p>
          <pre className="overflow-x-auto rounded bg-amber-50 p-2 text-xs dark:bg-amber-900/20 dark:text-amber-200">
            <code>{rollback}</code>
          </pre>
          <div className="mt-1">
            <CopyButton text={rollback} label="Copy rollback" />
          </div>
        </div>
      )}

      {source && (
        <p className="mt-3 text-xs text-gray-500">
          Nguồn:{" "}
          <a href={source} target="_blank" rel="noopener noreferrer" className="text-ubuntu-orange hover:underline">
            {source}
          </a>
          {" "}— Nếu lệnh không khớp, tham khảo tài liệu gốc từ nhà phát triển.
        </p>
      )}
    </div>
  );
}
