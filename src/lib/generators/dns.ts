import type { FormFieldConfig, GeneratorResult, Mode } from "../types";
import { wrapResult } from "./utils";

export interface DnsInput {
  dnsIPv4: string;
  dnsIPv6: string;
  dnsOverTLS: boolean;
  networkInterface: string;
  useNetplan: boolean;
}

export const dnsFields: FormFieldConfig[] = [
  { name: "dnsIPv4", label: "DNS IPv4", type: "text", placeholder: "9.9.9.9 149.112.112.112", defaultValue: "1.1.1.1 8.8.8.8" },
  { name: "dnsIPv6", label: "DNS IPv6", type: "text", placeholder: "2606:4700:4700::1111" },
  { name: "dnsOverTLS", label: "Bật DNS over TLS", type: "checkbox", defaultValue: false },
  { name: "networkInterface", label: "Interface mạng", type: "text", placeholder: "eth0", advancedOnly: true },
  { name: "useNetplan", label: "Dùng Netplan (Ubuntu 18.04+)", type: "checkbox", defaultValue: false, advancedOnly: true },
];

const SOURCE = "https://www.freedesktop.org/software/systemd/man/latest/resolved.conf.html";

export function generateDns(input: DnsInput, _mode: Mode): GeneratorResult {
  const resolvedConfig = `[Resolve]
DNS=${input.dnsIPv4 || "1.1.1.1 8.8.8.8"}${input.dnsIPv6 ? `\nDNS=${input.dnsIPv6}` : ""}
FallbackDNS=1.1.1.1 8.8.8.8
${input.dnsOverTLS ? "DNSOverTLS=yes" : "DNSOverTLS=no"}`;

  const commands: GeneratorResult["commands"] = [
    {
      title: "Kiểm tra DNS hiện tại",
      commands: `resolvectl status\ncat /etc/resolv.conf`,
      riskLevel: "low",
      category: "check",
    },
    {
      title: "Cấu hình systemd-resolved",
      commands: `sudo tee /etc/systemd/resolved.conf > /dev/null <<'EOF'\n${resolvedConfig}\nEOF\nsudo systemctl restart systemd-resolved`,
      riskLevel: "medium",
      rollback: `sudo cp /etc/systemd/resolved.conf.bak /etc/systemd/resolved.conf 2>/dev/null; sudo systemctl restart systemd-resolved`,
      category: "execute",
      source: SOURCE,
    },
    {
      title: "Kiểm tra sau cấu hình",
      commands: `resolvectl status\ndig example.com`,
      riskLevel: "low",
      category: "check",
    },
  ];

  if (input.useNetplan) {
    commands.push({
      title: "Netplan DNS (ví dụ)",
      description: "Chỉnh /etc/netplan/*.yaml",
      commands: `# network:\n#   version: 2\n#   ethernets:\n#     ${input.networkInterface || "eth0"}:\n#       nameservers:\n#         addresses: [${(input.dnsIPv4 || "1.1.1.1").split(" ").join(", ")}]\n# sudo netplan apply`,
      riskLevel: "medium",
      category: "execute",
    });
  }

  return wrapResult(commands, [
    { title: "systemd-resolved", content: "DNS resolver mặc định trên Ubuntu modern." },
    { title: "DNSOverTLS", content: "Mã hóa DNS query - cần DNS server hỗ trợ." },
  ], ["Backup resolved.conf trước khi sửa."], "dns-config");
}
