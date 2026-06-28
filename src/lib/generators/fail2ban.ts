import type { FormFieldConfig, GeneratorResult, Mode } from "../types";
import { wrapResult } from "./utils";

export interface Fail2banInput {
  sshPort: string;
  maxRetry: string;
  banTime: string;
  findTime: string;
}

export const fail2banFields: FormFieldConfig[] = [
  { name: "sshPort", label: "Port SSH", type: "number", defaultValue: "22", validate: "port" },
  { name: "maxRetry", label: "Max retry", type: "number", defaultValue: "5" },
  { name: "banTime", label: "Ban time", type: "text", defaultValue: "1h", helpText: "VD: 1h, 30m, 3600" },
  { name: "findTime", label: "Find time", type: "text", defaultValue: "10m" },
];

const SOURCE = "https://github.com/fail2ban/fail2ban";

export function generateFail2ban(input: Fail2banInput, _mode: Mode): GeneratorResult {
  const port = input.sshPort || "22";
  const jailConfig = `[sshd]
enabled = true
port = ${port}
filter = sshd
logpath = /var/log/auth.log
maxretry = ${input.maxRetry || "5"}
findtime = ${input.findTime || "10m"}
bantime = ${input.banTime || "1h"}`;

  const commands: GeneratorResult["commands"] = [
    {
      title: "Cài Fail2ban",
      commands: `sudo apt update\nsudo apt install -y fail2ban`,
      riskLevel: "low",
      category: "install",
      source: SOURCE,
    },
    {
      title: "Cấu hình jail SSH",
      commands: `sudo tee /etc/fail2ban/jail.local > /dev/null <<'EOF'\n${jailConfig}\nEOF`,
      riskLevel: "low",
      category: "execute",
      source: SOURCE,
    },
    {
      title: "Áp dụng Fail2ban",
      commands: `sudo systemctl restart fail2ban\nsudo systemctl enable fail2ban`,
      riskLevel: "medium",
      category: "execute",
    },
    {
      title: "Kiểm tra Fail2ban",
      commands: `sudo fail2ban-client status\nsudo fail2ban-client status sshd`,
      riskLevel: "low",
      category: "check",
    },
  ];

  const warnings = [
    "Đảm bảo port SSH trong jail khớp với sshd_config.",
    "Test SSH trước khi bật để tránh tự khóa IP.",
  ];

  return wrapResult(commands, [
    { title: "jail.local", content: "Override config mặc định, không sửa jail.conf." },
  ], warnings, "fail2ban");
}
