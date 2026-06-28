"use client";

import { useState, useMemo } from "react";
import type { GeneratorResult, Mode } from "@/lib/types";
import type { ToolConfig } from "@/lib/tools";
import { FormField, validateForm } from "./FormField";
import { CommandBlock } from "./CommandBlock";
import { WarningBox } from "./WarningBox";
import { DownloadScriptButton } from "./CommandBlock";
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
    if (activeTab === "rollback") {
      return result.commands.filter((c) => c.rollback);
    }
    if (activeTab === "warning") return [];
    if (activeTab === "explain") return [];
    return result.commands.filter((c) => c.category === activeTab);
  }, [result, activeTab]);

  const fullScript = result
    ? buildScript(result.commands, result.scriptName)
    : "";

  const hasPassword = tool.fields.some(
    (f) => f.type === "password" && values[f.name]
  );

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {tool.definition.name}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {tool.definition.description}
          </p>
          {tool.definition.source && (
            <p className="mt-1 text-xs text-gray-500">
              Nguồn tham khảo:{" "}
              <a
                href={tool.definition.source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ubuntu-orange hover:underline"
              >
                {tool.definition.source}
              </a>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-700">
            {(["safe", "advanced"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={clsx(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition",
                  mode === m
                    ? "bg-ubuntu-orange text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                )}
              >
                {m === "safe" ? "An toàn" : "Nâng cao"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          {visibleFields.map((field) => (
            <FormField
              key={field.name}
              field={field}
              value={values[field.name]}
              onChange={handleChange}
              error={errors[field.name]}
            />
          ))}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tên lưu lịch sử (tùy chọn)
            </label>
            <input
              type="text"
              value={historyName}
              onChange={(e) => setHistoryName(e.target.value)}
              placeholder="VD: VPS production firewall"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            className="w-full rounded-lg bg-ubuntu-orange px-4 py-2.5 font-medium text-white hover:bg-orange-600 sm:w-auto"
          >
            Sinh lệnh
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {result ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Kết quả
              </h2>
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

            {result.warnings.length > 0 && (
              <WarningBox warnings={result.warnings} variant="danger" />
            )}

            <div className="flex flex-wrap gap-1 border-b border-gray-200 dark:border-gray-700">
              {(Object.keys(tabLabels) as ResultTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    "px-3 py-2 text-sm font-medium transition",
                    activeTab === tab
                      ? "border-b-2 border-ubuntu-orange text-ubuntu-orange"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                >
                  {tabLabels[tab]}
                </button>
              ))}
            </div>

            {activeTab === "explain" && (
              <div className="space-y-3">
                {result.explanations.map((exp, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {exp.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
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
              <p className="text-sm text-gray-500">Không có lệnh rollback cho cấu hình này.</p>
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
                  <p className="text-sm text-gray-500">
                    Không có lệnh trong tab này.
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
            <p className="text-sm text-gray-500">
              Nhập thông tin và bấm &quot;Sinh lệnh&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
