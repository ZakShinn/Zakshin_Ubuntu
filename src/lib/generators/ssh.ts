import type { FormFieldConfig, GeneratorResult, Mode } from "../types";
import { wrapResult } from "./utils";

export interface SshInput {
  sshPort: string;
  allowedUsers: string;
  permitRootLogin: boolean;
  passwordAuth: boolean;
  pubkeyAuth: boolean;
  backupConfig: boolean;
}

export const sshFields: FormFieldConfig[] = [
  { name: "sshPort", label: "Port SSH mới", type: "number", defaultValue: "22", validate: "port", required: true },
  { name: "allowedUsers", label: "User được phép login (AllowUsers)", type: "text", placeholder: "ubuntu, hainghia", validate: "username" },
  { name: "permitRootLogin", label: "Cho phép root login", type: "checkbox", defaultValue: false },
  { name: "passwordAuth", label: "Cho phép password login", type: "checkbox", defaultValue: false },
  { name: "pubkeyAuth", label: "Dùng SSH key (PubkeyAuthentication)", type: "checkbox", defaultValue: true },
  { name: "backupConfig", label: "Backup file config trước khi sửa", type: "checkbox", defaultValue: true },
];

const SOURCE = "https://www.openssh.com/manual.html";

export function generateSsh(input: SshInput, _mode: Mode): GeneratorResult {
  const port = input.sshPort || "22";
  const users = input.allowedUsers?.trim();
  const warnings: string[] = [
    "Luôn mở thêm session SSH thứ hai để test trước khi logout.",
    "Phải mở firewall cho port SSH mới TRƯỚC khi đổi port.",
    "Không tắt password nếu chưa chắc chắn SSH key hoạt động.",
  ];

  const configLines = [
    `Port ${port}`,
    `PermitRootLogin ${input.permitRootLogin ? "yes" : "no"}`,
    `PasswordAuthentication ${input.passwordAuth ? "yes" : "no"}`,
    `PubkeyAuthentication ${input.pubkeyAuth ? "yes" : "no"}`,
  ];
  if (users) {
    configLines.push(`AllowUsers ${users.split(/[,\s]+/).filter(Boolean).join(" ")}`);
  }

  const commands: GeneratorResult["commands"] = [];

  if (input.backupConfig) {
    commands.push({
      title: "Backup cấu hình SSH",
      commands: `sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak.$(date +%Y%m%d)`,
      riskLevel: "low",
      category: "install",
    });
  }

  commands.push({
    title: "Mở firewall port SSH mới (UFW ví dụ)",
    description: "Chạy TRƯỚC khi đổi port SSH",
    commands: `sudo ufw allow ${port}/tcp`,
    riskLevel: "low",
    category: "execute",
    warnings: ["Bắt buộc trước khi restart SSH với port mới"],
  });

  commands.push({
    title: "Nội dung cấu hình sshd_config",
    description: "Thêm/sửa các dòng sau trong /etc/ssh/sshd_config",
    commands: `sudo nano /etc/ssh/sshd_config\n\n# Thêm hoặc sửa:\n${configLines.join("\n")}`,
    riskLevel: "medium",
    category: "execute",
    source: SOURCE,
  });

  commands.push({
    title: "Kiểm tra cấu hình SSH",
    commands: `sudo sshd -t`,
    riskLevel: "low",
    category: "check",
  });

  commands.push({
    title: "Restart SSH service",
    commands: `sudo systemctl restart ssh`,
    riskLevel: "high",
    rollback: `sudo cp /etc/ssh/sshd_config.bak.$(date +%Y%m%d) /etc/ssh/sshd_config\nsudo systemctl restart ssh`,
    category: "execute",
    warnings: ["Giữ session SSH hiện tại mở, test session mới trước"],
  });

  commands.push({
    title: "Kiểm tra port SSH",
    commands: `sudo ss -tulpen | grep ssh`,
    riskLevel: "low",
    category: "check",
  });

  const explanations = [
    { title: "Port", content: "Đổi port SSH giảm scan tự động. Mở firewall trước!" },
    { title: "PermitRootLogin no", content: "Khuyến nghị tắt login root trực tiếp." },
    { title: "PasswordAuthentication no", content: "Chỉ dùng khi đã test SSH key thành công." },
    { title: "sshd -t", content: "Kiểm tra syntax config trước restart." },
  ];

  return wrapResult(commands, explanations, warnings, "ssh-hardening");
}
