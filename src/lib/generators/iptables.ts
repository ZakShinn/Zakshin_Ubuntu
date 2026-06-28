import type { FormFieldConfig, GeneratorResult, Mode } from "../types";
import { parseIPs, parsePorts } from "../validators";
import { wrapResult } from "./utils";

export interface IptablesInput {
  openPorts: string;
  closePorts: string;
  protocol: string;
  allowedIPs: string;
  enableIPv6: boolean;
  persistRules: boolean;
  useDocker: boolean;
  defaultPolicy: string;
  currentSSHPort: string;
}

export const iptablesFields: FormFieldConfig[] = [
  { name: "openPorts", label: "Port cần mở", type: "ports", placeholder: "22, 80, 443", validate: "port" },
  { name: "closePorts", label: "Port cần đóng", type: "ports", placeholder: "3306, 27017", validate: "port" },
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
  { name: "allowedIPs", label: "IP được phép (all hoặc IP/CIDR, mỗi dòng một IP)", type: "multiline-ips", placeholder: "all\n1.2.3.4\n172.16.0.0/16", helpText: "Để trống hoặc 'all' = cho phép mọi IP" },
  { name: "currentSSHPort", label: "Port SSH hiện tại", type: "number", defaultValue: "22", validate: "port", required: true },
  { name: "enableIPv6", label: "Áp dụng IPv6 (ip6tables)", type: "checkbox", defaultValue: false },
  { name: "persistRules", label: "Lưu rule vĩnh viễn (iptables-persistent)", type: "checkbox", defaultValue: true },
  { name: "useDocker", label: "Máy đang dùng Docker", type: "checkbox", defaultValue: false },
  {
    name: "defaultPolicy",
    label: "Chính sách mặc định",
    type: "select",
    options: [
      { value: "allow", label: "Allow all, chỉ chặn port chỉ định" },
      { value: "drop", label: "Drop all, chỉ mở port cần thiết" },
    ],
    defaultValue: "allow",
    advancedOnly: true,
  },
];

const SOURCE = "https://help.ubuntu.com/community/IptablesHowTo";

export function generateIptables(input: IptablesInput, mode: Mode): GeneratorResult {
  const openPorts = parsePorts(input.openPorts);
  const closePorts = parsePorts(input.closePorts);
  const allowedIPs = parseIPs(input.allowedIPs);
  const sshPort = parseInt(input.currentSSHPort || "22", 10);
  const protos = input.protocol === "both" ? ["tcp", "udp"] : [input.protocol];
  const warnings: string[] = [];
  const commands: GeneratorResult["commands"] = [];

  if (input.useDocker) {
    warnings.push("Docker tự thêm rule iptables. Cấu hình thủ công có thể bị ghi đè hoặc xung đột.");
  }
  if (input.defaultPolicy === "drop") {
    warnings.push("CẢNH BÁO ĐỎ: Chính sách DROP ALL có thể khóa SSH nếu chưa mở port SSH trước!");
  }
  if (closePorts.includes(sshPort) && !openPorts.includes(sshPort)) {
    warnings.push(`KHÔNG đóng port SSH (${sshPort}) nếu chưa mở port SSH mới!`);
  }
  if (input.enableIPv6) {
    warnings.push("IPv6 cần cấu hình riêng bằng ip6tables.");
  }
  warnings.push("Không nên chạy DROP toàn bộ khi đang SSH từ xa mà chưa có rule ALLOW.");
  warnings.push("Không dùng iptables thủ công song song UFW nếu không hiểu rõ.");

  commands.push({
    title: "Cài đặt iptables-persistent",
    description: "Cài gói cần thiết để quản lý firewall",
    commands: `sudo apt update\nsudo apt install -y iptables iptables-persistent netfilter-persistent`,
    riskLevel: "low",
    category: "install",
    source: SOURCE,
  });

  if (input.defaultPolicy === "drop" && mode === "advanced") {
    commands.push({
      title: "Thiết lập chính sách DROP mặc định",
      description: "Chặn tất cả traffic đến trừ rule ALLOW",
      commands: `sudo iptables -P INPUT DROP\nsudo iptables -P FORWARD DROP\nsudo iptables -A INPUT -i lo -j ACCEPT\nsudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT`,
      riskLevel: "high",
      rollback: `sudo iptables -P INPUT ACCEPT\nsudo iptables -P FORWARD ACCEPT`,
      category: "execute",
      warnings: ["Chỉ chạy khi đã mở port SSH!"],
    });
  }

  for (const port of openPorts) {
    for (const proto of protos) {
      const pFlag = `-p ${proto}`;
      if (allowedIPs.length > 0 && !allowedIPs.includes("all")) {
        for (const ip of allowedIPs) {
          commands.push({
            title: `Mở port ${port}/${proto} cho IP ${ip}`,
            description: `Cho phép ${ip} truy cập port ${port}`,
            commands: `sudo iptables -A INPUT ${pFlag} -s ${ip} --dport ${port} -j ACCEPT`,
            riskLevel: "low",
            rollback: `sudo iptables -D INPUT ${pFlag} -s ${ip} --dport ${port} -j ACCEPT`,
            checks: `sudo iptables -L -n -v --line-numbers | grep ${port}`,
            category: "execute",
          });
        }
        commands.push({
          title: `Chặn port ${port}/${proto} từ IP khác`,
          description: "DROP các IP không trong danh sách",
          commands: `sudo iptables -A INPUT ${pFlag} --dport ${port} -j DROP`,
          riskLevel: port === sshPort ? "high" : "medium",
          rollback: `sudo iptables -D INPUT ${pFlag} --dport ${port} -j DROP`,
          category: "execute",
        });
      } else {
        commands.push({
          title: `Mở port ${port}/${proto}`,
          description: `Cho phép traffic ${proto.toUpperCase()} vào port ${port}`,
          commands: `sudo iptables -A INPUT ${pFlag} --dport ${port} -j ACCEPT`,
          riskLevel: "low",
          rollback: `sudo iptables -D INPUT ${pFlag} --dport ${port} -j ACCEPT`,
          checks: `sudo iptables -L -n -v --line-numbers | grep ${port}`,
          category: "execute",
        });
      }
    }
  }

  for (const port of closePorts) {
    for (const proto of protos) {
      commands.push({
        title: `Chặn port ${port}/${proto}`,
        description: `DROP traffic vào port ${port}`,
        commands: `sudo iptables -A INPUT -p ${proto} --dport ${port} -j DROP`,
        riskLevel: port === sshPort ? "high" : "medium",
        rollback: `sudo iptables -D INPUT -p ${proto} --dport ${port} -j DROP`,
        category: "execute",
        warnings: port === sshPort ? ["Có thể khóa SSH!"] : undefined,
      });
    }
  }

  if (input.enableIPv6) {
    for (const port of openPorts) {
      commands.push({
        title: `Mở port ${port} IPv6`,
        description: "Rule ip6tables cho IPv6",
        commands: `sudo ip6tables -A INPUT -p tcp --dport ${port} -j ACCEPT`,
        riskLevel: "low",
        rollback: `sudo ip6tables -D INPUT -p tcp --dport ${port} -j ACCEPT`,
        category: "execute",
      });
    }
  }

  if (input.persistRules) {
    commands.push({
      title: "Lưu rule vĩnh viễn",
      description: "Lưu và reload iptables",
      commands: `sudo netfilter-persistent save\nsudo netfilter-persistent reload`,
      riskLevel: "medium",
      category: "save",
    });
  }

  commands.push({
    title: "Kiểm tra rule iptables",
    description: "Xem danh sách rule hiện tại",
    commands: `sudo iptables -L -n -v --line-numbers\nsudo ip6tables -L -n -v --line-numbers`,
    riskLevel: "low",
    category: "check",
  });

  const explanations = [
    { title: "iptables -A INPUT", content: "Thêm rule vào chain INPUT (traffic đến server)." },
    { title: "--dport", content: "Chỉ định port đích của gói tin." },
    { title: "-j ACCEPT/DROP", content: "ACCEPT cho phép, DROP chặn gói tin." },
    { title: "netfilter-persistent", content: "Lưu rule qua reboot. Nguồn: Ubuntu Community Wiki." },
  ];

  return wrapResult(commands, explanations, warnings, "iptables-setup");
}
