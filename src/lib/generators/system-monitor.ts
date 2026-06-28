import type { GeneratorResult, Mode } from "../types";
import { wrapResult } from "./utils";

export function generateSystemMonitor(_input: Record<string, unknown>, _mode: Mode): GeneratorResult {
  const commands: GeneratorResult["commands"] = [
    { title: "Disk usage", commands: `df -h\ndu -sh /* 2>/dev/null | sort -hr | head -20`, riskLevel: "low", category: "check" },
    { title: "RAM / CPU", commands: `free -h\ntop -bn1 | head -20\nuptime`, riskLevel: "low", category: "check" },
    { title: "Process", commands: `ps aux --sort=-%mem | head -15\nps aux --sort=-%cpu | head -15`, riskLevel: "low", category: "check" },
    { title: "Journal logs", commands: `sudo journalctl -p err -n 50 --no-pager\nsudo journalctl --disk-usage`, riskLevel: "low", category: "check" },
  ];
  return wrapResult(commands, [], [], "system-monitor");
}

export const systemMonitorFields = [
  { name: "info", label: "Không cần nhập - click Sinh lệnh", type: "text" as const, defaultValue: "" },
];
