interface WarningBoxProps {
  warnings: string[];
  variant?: "default" | "danger";
}

export function WarningBox({ warnings, variant = "default" }: WarningBoxProps) {
  if (warnings.length === 0) return null;

  const styles =
    variant === "danger"
      ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
      : "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20";

  return (
    <div className={`rounded-lg border p-4 ${styles}`}>
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
        {variant === "danger" ? "⚠ Cảnh báo quan trọng" : "Lưu ý an toàn"}
      </h3>
      <ul className="list-inside list-disc space-y-1 text-sm text-gray-700 dark:text-gray-300">
        {warnings.map((w, i) => (
          <li key={i}>{w}</li>
        ))}
      </ul>
    </div>
  );
}
