import type { FormFieldConfig, GeneratorResult, Mode } from "../types";
import { wrapResult } from "./utils";

export interface LogsInput {
  journalDays: string;
  journalSize: string;
  pruneDocker: boolean;
  dockerPruneVolumes: boolean;
}

export const logsFields: FormFieldConfig[] = [
  { name: "journalDays", label: "Giữ journal log (ngày)", type: "number", defaultValue: "7" },
  { name: "journalSize", label: "Giới hạn journal (MB)", type: "number", defaultValue: "500" },
  { name: "pruneDocker", label: "Dọn Docker (images/containers không dùng)", type: "checkbox", defaultValue: true },
  { name: "dockerPruneVolumes", label: "Prune Docker volumes (NGUY HIỂM)", type: "checkbox", defaultValue: false, advancedOnly: true },
];

export function generateLogs(input: LogsInput, mode: Mode): GeneratorResult {
  const warnings: string[] = [
    "KHÔNG tự xóa /var/log bằng rm -rf.",
  ];

  if (input.dockerPruneVolumes) {
    warnings.push("CẢNH BÁO ĐỎ: Prune volumes sẽ XÓA dữ liệu Docker volume!");
  }

  const commands: GeneratorResult["commands"] = [
    {
      title: "Kiểm tra dung lượng journal",
      commands: `sudo journalctl --disk-usage`,
      riskLevel: "low",
      category: "check",
    },
    {
      title: "Dọn journal log",
      commands: `sudo journalctl --vacuum-time=${input.journalDays || "7"}d\nsudo journalctl --vacuum-size=${input.journalSize || "500"}M`,
      riskLevel: "medium",
      category: "execute",
    },
  ];

  if (input.pruneDocker) {
    commands.push({
      title: "Kiểm tra Docker disk",
      commands: `docker system df`,
      riskLevel: "low",
      category: "check",
    });
    commands.push({
      title: "Dọn Docker",
      commands: `docker system prune -f`,
      riskLevel: "medium",
      category: "execute",
      warnings: ["Xóa container/image không dùng"],
    });
  }

  if (input.dockerPruneVolumes && mode === "advanced") {
    commands.push({
      title: "Prune Docker volumes",
      commands: `docker volume prune -f`,
      riskLevel: "high",
      category: "execute",
      warnings: ["XÓA DỮ LIỆU VOLUME!"],
    });
  }

  return wrapResult(commands, [], warnings, "log-cleanup");
}
