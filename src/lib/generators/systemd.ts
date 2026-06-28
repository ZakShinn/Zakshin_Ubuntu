import type { FormFieldConfig, GeneratorResult, Mode } from "../types";
import { wrapResult } from "./utils";

export interface SystemdInput {
  serviceName: string;
  runUser: string;
  workingDirectory: string;
  execCommand: string;
  restartPolicy: string;
  envVars: string;
}

export const systemdFields: FormFieldConfig[] = [
  { name: "serviceName", label: "Tên service", type: "text", placeholder: "my-app", required: true },
  { name: "runUser", label: "User chạy service", type: "text", defaultValue: "ubuntu", validate: "username" },
  { name: "workingDirectory", label: "WorkingDirectory", type: "text", placeholder: "/home/ubuntu/app", validate: "path" },
  { name: "execCommand", label: "Command chạy", type: "text", placeholder: "/usr/bin/npm start", required: true },
  {
    name: "restartPolicy",
    label: "Restart policy",
    type: "select",
    options: [
      { value: "always", label: "always" },
      { value: "on-failure", label: "on-failure" },
      { value: "no", label: "no" },
    ],
    defaultValue: "always",
  },
  { name: "envVars", label: "Environment variables (mỗi dòng KEY=VALUE)", type: "textarea", placeholder: "NODE_ENV=production\nPORT=3000" },
];

const SOURCE = "https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html";

export function generateSystemd(input: SystemdInput, _mode: Mode): GeneratorResult {
  const name = input.serviceName.trim();
  const envLines = (input.envVars || "")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => `Environment=${l.trim()}`)
    .join("\n");

  const serviceFile = `[Unit]
Description=${name} Service
After=network.target

[Service]
Type=simple
User=${input.runUser || "ubuntu"}
WorkingDirectory=${input.workingDirectory || "/home/ubuntu/app"}
ExecStart=${input.execCommand}
Restart=${input.restartPolicy || "always"}
RestartSec=5
${envLines}

[Install]
WantedBy=multi-user.target`;

  const commands: GeneratorResult["commands"] = [
    {
      title: `Tạo file service ${name}`,
      commands: `sudo tee /etc/systemd/system/${name}.service > /dev/null <<'EOF'\n${serviceFile}\nEOF`,
      riskLevel: "low",
      category: "execute",
      source: SOURCE,
    },
    {
      title: "Áp dụng service",
      commands: `sudo systemctl daemon-reload\nsudo systemctl enable ${name}\nsudo systemctl start ${name}`,
      riskLevel: "medium",
      rollback: `sudo systemctl stop ${name}\nsudo systemctl disable ${name}\nsudo rm /etc/systemd/system/${name}.service\nsudo systemctl daemon-reload`,
      category: "execute",
    },
    {
      title: "Kiểm tra service",
      commands: `sudo systemctl status ${name} --no-pager\njournalctl -u ${name} -f --no-pager -n 20`,
      riskLevel: "low",
      category: "check",
    },
  ];

  return wrapResult(commands, [
    { title: "systemctl enable", content: "Tự khởi động service khi reboot." },
    { title: "journalctl -u", content: "Xem log của service." },
  ], [], `systemd-${name}`);
}
