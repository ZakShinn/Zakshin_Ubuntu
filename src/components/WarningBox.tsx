import { AlertTriangle, Info } from "lucide-react";
import clsx from "clsx";

interface WarningBoxProps {
  warnings: string[];
  variant?: "default" | "danger";
}

export function WarningBox({ warnings, variant = "default" }: WarningBoxProps) {
  if (warnings.length === 0) return null;

  const isDanger = variant === "danger";

  return (
    <div
      className={clsx(
        "flex gap-4 rounded-2xl border p-4",
        isDanger
          ? "border-red-500/20 bg-gradient-to-br from-red-500/5 to-orange-500/5"
          : "border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-yellow-500/5"
      )}
    >
      <div
        className={clsx(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          isDanger ? "bg-red-500/10" : "bg-amber-500/10"
        )}
      >
        {isDanger ? (
          <AlertTriangle className="h-5 w-5 text-red-500" />
        ) : (
          <Info className="h-5 w-5 text-amber-500" />
        )}
      </div>
      <div>
        <h3 className="font-bold text-content">
          {isDanger ? "Cảnh báo quan trọng" : "Lưu ý an toàn"}
        </h3>
        <ul className="mt-2 space-y-1.5">
          {warnings.map((w, i) => (
            <li key={i} className="text-sm text-content-muted">
              • {w}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
