import type { FormFieldConfig, GeneratorResult, Mode } from "../types";
import { wrapResult } from "./utils";

export const netplanFields: FormFieldConfig[] = [
  { name: "interface", label: "Interface", type: "text", defaultValue: "eth0", required: true },
  { name: "staticIP", label: "Static IP (CIDR)", type: "text", placeholder: "192.168.1.100/24", required: true },
  { name: "gateway", label: "Gateway", type: "text", placeholder: "192.168.1.1", required: true },
  { name: "dnsServers", label: "DNS servers", type: "text", defaultValue: "1.1.1.1,8.8.8.8" },
];

const SOURCE = "https://netplan.io/";

export function generateNetplan(
  input: { interface?: string; staticIP?: string; gateway?: string; dnsServers?: string },
  _mode: Mode
): GeneratorResult {
  const iface = input.interface || "eth0";
  const dns = (input.dnsServers || "1.1.1.1,8.8.8.8").split(",").map((d) => d.trim());

  const config = `network:
  version: 2
  ethernets:
    ${iface}:
      dhcp4: no
      addresses:
        - ${input.staticIP}
      routes:
        - to: default
          via: ${input.gateway}
      nameservers:
        addresses: [${dns.join(", ")}]`;

  const commands: GeneratorResult["commands"] = [
    {
      title: "Backup netplan",
      commands: `sudo cp /etc/netplan/50-cloud-init.yaml /etc/netplan/50-cloud-init.yaml.bak`,
      riskLevel: "low",
      category: "install",
    },
    {
      title: "Cấu hình static IP",
      commands: `sudo tee /etc/netplan/50-cloud-init.yaml > /dev/null <<'EOF'\n${config}\nEOF`,
      riskLevel: "high",
      category: "execute",
      source: SOURCE,
      warnings: ["Sai config có thể mất kết nối mạng! Giữ console VPS mở."],
      rollback: `sudo cp /etc/netplan/50-cloud-init.yaml.bak /etc/netplan/50-cloud-init.yaml\nsudo netplan apply`,
    },
    {
      title: "Áp dụng netplan",
      commands: `sudo netplan try\n# Xác nhận trong 120s hoặc tự rollback\nsudo netplan apply`,
      riskLevel: "high",
      category: "execute",
    },
    {
      title: "Kiểm tra",
      commands: `ip addr show ${iface}\nip route`,
      riskLevel: "low",
      category: "check",
    },
  ];

  return wrapResult(commands, [], [
    "CẢNH BÁO ĐỎ: Static IP sai = mất SSH!",
    "Dùng netplan try để tự rollback nếu lỗi.",
  ], "netplan-static-ip");
}
