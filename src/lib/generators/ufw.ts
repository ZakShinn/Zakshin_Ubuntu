import type { FormFieldConfig, GeneratorResult, Mode } from "../types";
import { parseIPs, parsePorts } from "../validators";
import { ufwProto, wrapResult } from "./utils";

export interface UfwInput {
  openPorts: string;
  closePorts: string;
  protocol: string;
  allowedIPs: string;
  enableIPv6: boolean;
  enableLogging: boolean;
  defaultPolicy: string;
  useDocker: boolean;
}

export const ufwFields: FormFieldConfig[] = [
  { name: "openPorts", label: "Port cần mở", type: "ports", placeholder: "22, 80, 443", validate: "port", required: true },
  { name: "closePorts", label: "Port cần đóng", type: "ports", placeholder: "8080", validate: "port" },
  {
    name: "protocol",
    label: "Giao thức",
    type: "select",
    options: [
      { value: "tcp", label: "TCP" },
      { value: "udp", label: "UDP" },
      { value: "both", label: "TCP + UDP" },
    ],
    defaultValue: "tcp",
  },
  { name: "allowedIPs", label: "IP cho phép (mỗi dòng một IP)", type: "multiline-ips", placeholder: "1.2.3.4" },
  { name: "enableIPv6", label: "Bật IPv6", type: "checkbox", defaultValue: true },
  { name: "enableLogging", label: "Bật logging", type: "checkbox", defaultValue: false },
  {
    name: "defaultPolicy",
    label: "Default policy",
    type: "select",
    options: [
      { value: "deny", label: "deny incoming / allow outgoing" },
      { value: "allow", label: "allow incoming (không khuyến nghị)" },
    ],
    defaultValue: "deny",
  },
  { name: "useDocker", label: "Máy đang dùng Docker", type: "checkbox", defaultValue: false },
];

const SOURCE = "https://help.ubuntu.com/community/UFW";

export function generateUfw(input: UfwInput, _mode: Mode): GeneratorResult {
  const openPorts = parsePorts(input.openPorts);
  const closePorts = parsePorts(input.closePorts);
  const allowedIPs = parseIPs(input.allowedIPs);
  const warnings: string[] = [
    "Không nên dùng UFW và iptables thủ công lẫn lộn nếu không hiểu rõ.",
  ];
  if (input.useDocker) {
    warnings.push("Với Docker, UFW có thể không chặn được container port publish trực tiếp.");
  }

  const commands: GeneratorResult["commands"] = [];

  commands.push({
    title: "Cài đặt UFW",
    description: "Cài Uncomplicated Firewall",
    commands: `sudo apt update\nsudo apt install -y ufw`,
    riskLevel: "low",
    category: "install",
    source: SOURCE,
  });

  if (input.defaultPolicy === "deny") {
    commands.push({
      title: "Thiết lập policy mặc định",
      description: "Chặn incoming, cho phép outgoing",
      commands: `sudo ufw default deny incoming\nsudo ufw default allow outgoing`,
      riskLevel: "low",
      category: "execute",
    });
  }

  if (input.enableIPv6) {
    commands.push({
      title: "Bật IPv6 trong UFW",
      description: "Chỉnh /etc/default/ufw",
      commands: `sudo sed -i 's/IPV6=no/IPV6=yes/' /etc/default/ufw`,
      riskLevel: "low",
      category: "execute",
    });
  }

  if (input.enableLogging) {
    commands.push({
      title: "Bật logging UFW",
      commands: `sudo ufw logging on`,
      riskLevel: "low",
      category: "execute",
    });
  }

  const protos = input.protocol === "both" ? ["tcp", "udp"] : [input.protocol];

  for (const port of openPorts) {
    for (const proto of protos) {
      const suffix = ufwProto(proto);
      if (allowedIPs.length > 0) {
        for (const ip of allowedIPs) {
          commands.push({
            title: `Mở port ${port}${suffix} cho ${ip}`,
            commands: `sudo ufw allow from ${ip} to any port ${port} proto ${proto}`,
            riskLevel: "low",
            rollback: `sudo ufw delete allow from ${ip} to any port ${port} proto ${proto}`,
            category: "execute",
          });
        }
      } else {
        commands.push({
          title: `Mở port ${port}${suffix}`,
          commands: `sudo ufw allow ${port}${suffix}`,
          riskLevel: "low",
          rollback: `sudo ufw delete allow ${port}${suffix}`,
          category: "execute",
        });
      }
    }
  }

  for (const port of closePorts) {
    for (const proto of protos) {
      const suffix = ufwProto(proto);
      commands.push({
        title: `Đóng port ${port}${suffix}`,
        commands: `sudo ufw delete allow ${port}${suffix}`,
        riskLevel: "medium",
        category: "execute",
      });
    }
  }

  commands.push({
    title: "Bật UFW",
    description: "Kích hoạt firewall (xác nhận y khi hỏi)",
    commands: `sudo ufw enable`,
    riskLevel: "medium",
    category: "execute",
    warnings: ["Đảm bảo port SSH đã được mở trước!"],
  });

  commands.push({
    title: "Kiểm tra trạng thái UFW",
    commands: `sudo ufw status verbose\nsudo ufw status numbered`,
    riskLevel: "low",
    category: "check",
  });

  const explanations = [
    { title: "ufw allow", content: "Thêm rule cho phép port hoặc IP." },
    { title: "ufw enable", content: "Kích hoạt firewall. Cần mở SSH trước!" },
    { title: "Nguồn", content: "Ubuntu Community - UFW Documentation." },
  ];

  return wrapResult(commands, explanations, warnings, "ufw-setup");
}
