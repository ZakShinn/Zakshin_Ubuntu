import type { FormFieldConfig, GeneratorResult, Mode } from "../types";
import { wrapResult } from "./utils";

export interface PortsInput {
  checkPort: string;
  domain: string;
  checkIPv6: boolean;
}

export const portsFields: FormFieldConfig[] = [
  { name: "checkPort", label: "Port cần kiểm tra", type: "number", placeholder: "80", validate: "port" },
  { name: "domain", label: "Domain (kiểm tra từ bên ngoài)", type: "text", placeholder: "example.com", validate: "domain" },
  { name: "checkIPv6", label: "Kiểm tra IPv6", type: "checkbox", defaultValue: false },
];

export function generatePorts(input: PortsInput, _mode: Mode): GeneratorResult {
  const port = input.checkPort;
  const domain = input.domain?.trim();

  const commands: GeneratorResult["commands"] = [
    {
      title: "Liệt kê port đang lắng nghe",
      commands: `sudo ss -tulpen`,
      riskLevel: "low",
      category: "check",
    },
  ];

  if (port) {
    commands.push({
      title: `Kiểm tra port ${port}`,
      commands: `sudo ss -tulpen | grep :${port}\nsudo lsof -i -P -n | grep LISTEN | grep :${port}`,
      riskLevel: "low",
      category: "check",
    });
  }

  if (domain) {
    const extChecks = [
      `nc -vz ${domain} ${port || "443"}`,
      `curl -Iv https://${domain}`,
    ];
    if (input.checkIPv6) {
      extChecks.push(`curl -6 -Iv https://${domain}`);
    }
    commands.push({
      title: "Kiểm tra từ bên ngoài",
      description: "Chạy từ máy local hoặc máy khác",
      commands: extChecks.join("\n"),
      riskLevel: "low",
      category: "check",
    });
  }

  return wrapResult(commands, [
    { title: "ss -tulpen", content: "Hiển thị socket đang listen với process." },
    { title: "lsof", content: "Liệt kê file/port đang mở." },
  ], [], "check-ports");
}
