import type { FormFieldConfig, GeneratorResult, Mode } from "../types";
import { wrapResult } from "./utils";

export interface UpdateInput {
  fullUpgrade: boolean;
  autoReboot: boolean;
}

export const updateFields: FormFieldConfig[] = [
  { name: "fullUpgrade", label: "Dùng full-upgrade (kernel mới)", type: "checkbox", defaultValue: false },
  { name: "autoReboot", label: "Hiển thị lệnh reboot nếu cần", type: "checkbox", defaultValue: true },
];

export function generateUpdate(input: UpdateInput, _mode: Mode): GeneratorResult {
  const upgradeCmd = input.fullUpgrade
    ? `sudo apt update\nsudo apt full-upgrade -y\nsudo apt autoremove -y\nsudo apt autoclean`
    : `sudo apt update\nsudo apt upgrade -y\nsudo apt autoremove -y\nsudo apt autoclean`;

  const commands: GeneratorResult["commands"] = [
    {
      title: "Cập nhật hệ thống",
      commands: upgradeCmd,
      riskLevel: "medium",
      category: "execute",
      warnings: input.fullUpgrade ? ["full-upgrade có thể cần reboot"] : undefined,
    },
    {
      title: "Kiểm tra cần reboot",
      commands: `[ -f /var/run/reboot-required ] && cat /var/run/reboot-required || echo "Không cần reboot"`,
      riskLevel: "low",
      category: "check",
    },
  ];

  if (input.autoReboot) {
    commands.push({
      title: "Reboot (nếu cần)",
      commands: `sudo reboot`,
      riskLevel: "high",
      category: "execute",
      warnings: ["Chỉ chạy khi đã lưu công việc và có cách truy cập lại server!"],
    });
  }

  const warnings = [
    "Backup quan trọng trước khi upgrade production.",
    "Giữ session SSH dự phòng khi upgrade kernel.",
  ];

  return wrapResult(commands, [], warnings, "ubuntu-update");
}
