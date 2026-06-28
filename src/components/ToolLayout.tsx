"use client";

import { useState, useMemo } from "react";
import { Sparkles, Wand2, ExternalLink, FileCode2 } from "lucide-react";
import type { GeneratorResult, Mode } from "@/lib/types";
import type { ToolConfig } from "@/lib/tools";
import { FormField, validateForm } from "./FormField";
import { CommandBlock, DownloadScriptButton } from "./CommandBlock";
import { WarningBox } from "./WarningBox";
import { buildScript } from "@/lib/generators/utils";
import { saveHistory } from "@/lib/history";
import clsx from "clsx";

type ResultTab = "install" | "execute" | "check" | "rollback" | "explain" | "warning";

const tabLabels: Record<ResultTab, string> = {
  install: "Cài đặt",
  execute: "Thực thi",
  check: "Kiểm tra",
  rollback: "Rollback",
  explain: "Giải thích",
  warning: "Cảnh báo",
};

interface ToolLayoutProps {
  tool: ToolConfig;
}

export function ToolLayout({ tool }: ToolLayoutProps) {
  const [values, setValues] = useState<Record<string, unknown>>(tool.getDefaults());
  const [mode, setMode] = useState<Mode>("safe");
  const [result, setResult] = useState<GeneratorResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<ResultTab>("execute");
  const [historyName, setHistoryName] = useState("");

  const visibleFields = useMemo(
    () => tool.fields.filter((f) => !f.advancedOnly || mode === "advanced"),
    [tool.fields, mode]
  );

  function handleChange(name: string, value: unknown) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function handleGenerate() {
    const formErrors = validateForm(visibleFields, values);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    const generated = tool.generate(values, mode);
    setResult(generated);
    setActiveTab("execute");

    if (historyName.trim()) {
      saveHistory({
        id: crypto.randomUUID(),
        name: historyName.trim(),
        toolId: tool.definition.id,
        inputs: values,
        timestamp: Date.now(),
      });
    }
  }

  const tabCommands = useMemo(() => {
    if (!result) return [];
    if (activeTab === "rollback") return result.commands.filter((c) => c.rollback);
    if (activeTab === "warning" || activeTab === "explain") return [];
    return result.commands.filter((c) => c.category === activeTab);
  }, [result, activeTab]);

  const fullScript = result ? buildScript(result.commands, result.scriptName) : "";

  const hasPassword = tool.fields.some(
    (f) => f.type === "password" && values[f.name]
  );

  const tabCounts = useMemo(() => {
    if (!result) return {} as Record<ResultTab, number>;
    return {
      install: result.commands.filter((c) => c.category === "install").length,
      execute: result.commands.filter((c) => c.category === "execute").length,
      check: result.commands.filter((c) => c.category === "check").length,
      rollback: result.commands.filter((c) => c.rollback).length,
      explain: result.explanations.length,
      warning: result.warnings.length,
    };
  }, [result]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-elevated p-6 shadow-card">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-ubuntu-orange/10 blur-2xl" />
        <div className="relative">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="badge bg-ubuntu-orange/10 text-ubuntu-orange">
              {tool.definition.category}
            </span>
            {mode === "advanced" && (
              <span className="badge bg-violet-500/10 text-violet-500">Nâng cao</span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-content sm:text-3xl">
            {tool.definition.name}
          </h1>
          <p className="mt-1.5 text-content-muted">{tool.definition.description}</p>
          {tool.definition.source && (
            <a
              href={tool.definition.source}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs text-content-faint transition-colors hover:text-ubuntu-orange"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Tài liệu tham khảo
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Form panel */}
        <div className="space-y-4">
          {/* Mode toggle */}
          <div className="flex rounded-xl border border-border bg-surface-muted/50 p-1">
            {(["safe", "advanced"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={clsx(
                  "flex-1 rounded-lg py-2 text-sm font-semibold transition-all duration-200",
                  mode === m
                    ? "bg-surface-elevated text-content shadow-sm"
                    : "text-content-muted hover:text-content"
                )}
              >
                {m === "safe" ? "🛡 An toàn" : "⚡ Nâng cao"}
              </button>
            ))}
          </div>

          <div className="card space-y-5 p-5">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <Sparkles className="h-4 w-4 text-ubuntu-orange" />
              <span className="text-sm font-bold text-content">Cấu hình</span>
            </div>

            {visibleFields.map((field) => (
              <FormField
                key={field.name}
                field={field}
                value={values[field.name]}
                onChange={handleChange}
                error={errors[field.name]}
              />
            ))}

            <div className="space-y-1.5 border-t border-border pt-4">
              <label className="block text-sm font-semibold text-content">
                Lưu lịch sử <span className="font-normal text-content-faint">(tùy chọn)</span>
              </label>
              <input
                type="text"
                value={historyName}
                onChange={(e) => setHistoryName(e.target.value)}
                placeholder="VD: VPS production firewall"
                className="input-modern"
              />
            </div>

            <button type="button" onClick={handleGenerate} className="btn-primary w-full">
              <Wand2 className="h-4 w-4" />
              Sinh lệnh
            </button>
          </div>
        </div>

        {/* Results panel */}
        <div className="space-y-4">
          {result ? (
            <div className="animate-slide-up space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FileCode2 className="h-5 w-5 text-ubuntu-orange" />
                  <h2 className="text-lg font-bold text-content">Kết quả</h2>
                </div>
                <DownloadScriptButton
                  content={fullScript}
                  filename={`${result.scriptName}.sh`}
                />
              </div>

              {hasPassword && (
                <WarningBox
                  warnings={[
                    "Script chứa mật khẩu. Xóa file .sh sau khi dùng, không commit lên git.",
                    "Ứng dụng không lưu password lên server — chỉ sinh lệnh local.",
                  ]}
                  variant="danger"
                />
              )}

              {result.warnings.length > 0 && activeTab !== "warning" && (
                <WarningBox warnings={result.warnings.slice(0, 2)} variant="danger" />
              )}

              {/* Tabs */}
              <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-surface-muted/50 p-1">
                {(Object.keys(tabLabels) as ResultTab[]).map((tab) => {
                  const count = tabCounts[tab];
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={clsx(
                        "tab-pill",
                        activeTab === tab ? "tab-pill-active" : "tab-pill-inactive"
                      )}
                    >
                      {tabLabels[tab]}
                      {count !== undefined && count > 0 && (
                        <span
                          className={clsx(
                            "ml-1 rounded-full px-1.5 text-[10px]",
                            activeTab === tab ? "bg-white/20" : "bg-surface-muted"
                          )}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {activeTab === "explain" && (
                <div className="space-y-3">
                  {result.explanations.map((exp, i) => (
                    <div key={i} className="card p-4">
                      <h4 className="font-bold text-content">{exp.title}</h4>
                      <p className="mt-1 text-sm leading-relaxed text-content-muted">
                        {exp.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "warning" && (
                <WarningBox
                  warnings={
                    result.warnings.length > 0
                      ? result.warnings
                      : ["Không có cảnh báo đặc biệt cho cấu hình này."]
                  }
                  variant="danger"
                />
              )}

              {activeTab === "rollback" && tabCommands.length === 0 && (
                <div className="card flex items-center justify-center p-8 text-sm text-content-faint">
                  Không có lệnh rollback cho cấu hình này.
                </div>
              )}

              {activeTab !== "explain" && activeTab !== "warning" && (
                <div className="space-y-4">
                  {activeTab === "rollback"
                    ? tabCommands.map((cmd, i) => (
                        <CommandBlock
                          key={i}
                          title={`Rollback: ${cmd.title}`}
                          commands={cmd.rollback!}
                          riskLevel={cmd.riskLevel}
                          source={cmd.source}
                        />
                      ))
                    : tabCommands.map((cmd, i) => (
                        <CommandBlock
                          key={i}
                          title={cmd.title}
                          description={cmd.description}
                          commands={cmd.commands}
                          riskLevel={cmd.riskLevel}
                          checks={cmd.checks}
                          rollback={cmd.rollback}
                          warnings={cmd.warnings}
                          source={cmd.source}
                        />
                      ))}
                  {tabCommands.length === 0 && activeTab !== "rollback" && (
                    <div className="card flex items-center justify-center p-8 text-sm text-content-faint">
                      Không có lệnh trong tab này.
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="card flex min-h-[320px] flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-muted">
                <Wand2 className="h-8 w-8 text-content-faint" />
              </div>
              <p className="font-medium text-content-muted">Chưa có kết quả</p>
              <p className="mt-1 text-sm text-content-faint">
                Nhập thông tin bên trái và bấm &quot;Sinh lệnh&quot;
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
