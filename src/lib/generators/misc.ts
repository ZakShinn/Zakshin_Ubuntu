import type { FormFieldConfig, GeneratorResult, Mode } from "../types";
import { wrapResult } from "./utils";

export const ntpFields: FormFieldConfig[] = [
  { name: "timezone", label: "Timezone", type: "select", options: [
    { value: "Asia/Ho_Chi_Minh", label: "Asia/Ho_Chi_Minh" },
    { value: "UTC", label: "UTC" },
    { value: "Asia/Tokyo", label: "Asia/Tokyo" },
    { value: "America/New_York", label: "America/New_York" },
  ], defaultValue: "Asia/Ho_Chi_Minh" },
];

export function generateNtp(input: { timezone?: string }, _mode: Mode): GeneratorResult {
  const tz = input.timezone || "Asia/Ho_Chi_Minh";
  const commands: GeneratorResult["commands"] = [
    { title: "Đặt timezone", commands: `sudo timedatectl set-timezone ${tz}`, riskLevel: "low", category: "execute" },
    { title: "Bật NTP sync", commands: `sudo timedatectl set-ntp true\ntimedatectl status`, riskLevel: "low", category: "execute" },
    { title: "Kiểm tra", commands: `date\ntimedatectl`, riskLevel: "low", category: "check" },
  ];
  return wrapResult(commands, [], [], "ntp-timezone");
}

export const hostnameFields: FormFieldConfig[] = [
  { name: "hostname", label: "Hostname mới", type: "text", placeholder: "web-server-01", required: true },
];

export function generateHostname(input: { hostname?: string }, _mode: Mode): GeneratorResult {
  const commands: GeneratorResult["commands"] = [
    { title: "Đổi hostname", commands: `sudo hostnamectl set-hostname ${input.hostname}\nsudo sed -i 's/^127.0.1.1.*/127.0.1.1 ${input.hostname}/' /etc/hosts`, riskLevel: "medium", category: "execute" },
    { title: "Kiểm tra", commands: `hostnamectl`, riskLevel: "low", category: "check" },
  ];
  return wrapResult(commands, [], [], "hostname");
}

export function generateSecurityAudit(_input: Record<string, unknown>, _mode: Mode): GeneratorResult {
  const commands: GeneratorResult["commands"] = [
    { title: "Kiểm tra user có shell", commands: `grep -E '/bin/(bash|sh)$' /etc/passwd`, riskLevel: "low", category: "check" },
    { title: "Kiểm tra sudoers", commands: `sudo grep -v '^#' /etc/sudoers /etc/sudoers.d/* 2>/dev/null`, riskLevel: "low", category: "check" },
    { title: "Kiểm tra port mở", commands: `sudo ss -tulpen`, riskLevel: "low", category: "check" },
    { title: "Kiểm tra fail2ban", commands: `sudo fail2ban-client status 2>/dev/null || echo "fail2ban chưa cài"`, riskLevel: "low", category: "check" },
    { title: "Kiểm tra SSH config", commands: `sudo sshd -T | grep -E 'permitrootlogin|passwordauthentication|port'`, riskLevel: "low", category: "check" },
    { title: "Lynis audit (tùy chọn)", commands: `sudo apt install -y lynis\nsudo lynis audit system`, riskLevel: "low", category: "check", source: "https://cisofy.com/lynis/" },
  ];
  const warnings = ["Audit cơ bản - không thay thế pentest chuyên nghiệp."];
  return wrapResult(commands, [], warnings, "security-audit");
}

export const securityAuditFields: FormFieldConfig[] = [
  { name: "info", label: "Không cần nhập", type: "text", defaultValue: "" },
];
