import type { FormFieldConfig, GeneratorResult, Mode, ServerProfile, ToolDefinition } from "./types";
import { generateIptables, iptablesFields } from "./generators/iptables";
import { generateUfw, ufwFields } from "./generators/ufw";
import { generateSsh, sshFields } from "./generators/ssh";
import { generateSudoUser, sudoUserFields } from "./generators/sudo-user";
import { generateDocker, dockerFields } from "./generators/docker";
import { generateNginx, nginxFields } from "./generators/nginx";
import { generateCertbot, certbotFields } from "./generators/certbot";
import { generateNodejs, nodejsFields } from "./generators/nodejs";
import { generateMongodb, mongodbFields } from "./generators/mongodb";
import { generateSystemd, systemdFields } from "./generators/systemd";
import { generateSwap, swapFields } from "./generators/swap";
import { generatePorts, portsFields } from "./generators/ports";
import { generateUpdate, updateFields } from "./generators/update";
import { generateLogs, logsFields } from "./generators/logs";
import { generateFail2ban, fail2banFields } from "./generators/fail2ban";
import { generateDns, dnsFields } from "./generators/dns";
import { generateCron, cronFields } from "./generators/cron";
import { generatePostgresql, postgresqlFields } from "./generators/postgresql";
import { generateRedis, redisFields } from "./generators/redis";
import { generateTailscale, tailscaleFields } from "./generators/tailscale";
import { generateWireguard, wireguardFields } from "./generators/wireguard";
import { generateGitDeploy, gitDeployFields } from "./generators/git-deploy";
import { generateRsyncBackup, generateRsyncRestore, rsyncFields, rsyncRestoreFields } from "./generators/rsync";
import { generateSystemMonitor, systemMonitorFields } from "./generators/system-monitor";
import { generateNtp, generateHostname, generateSecurityAudit, ntpFields, hostnameFields, securityAuditFields } from "./generators/misc";
import { generateNetplan, netplanFields } from "./generators/netplan";

export interface ToolConfig {
  definition: ToolDefinition;
  fields: FormFieldConfig[];
  generate: (input: Record<string, unknown>, mode: Mode) => GeneratorResult;
  getDefaults: () => Record<string, unknown>;
}

function defaultsFromFields(fields: FormFieldConfig[]): Record<string, unknown> {
  const d: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.defaultValue !== undefined) d[f.name] = f.defaultValue;
    else if (f.type === "checkbox") d[f.name] = false;
    else d[f.name] = "";
  }
  return d;
}

function tool(
  definition: ToolDefinition,
  fields: FormFieldConfig[],
  generate: (input: Record<string, unknown>, mode: Mode) => GeneratorResult
): ToolConfig {
  return { definition, fields, generate, getDefaults: () => defaultsFromFields(fields) };
}

export const tools: ToolConfig[] = [
  tool(
    { id: "iptables", name: "iptables / ip6tables", description: "Sinh lệnh firewall iptables cho Ubuntu", category: "firewall", keywords: ["iptables", "ip6tables", "firewall", "port", "drop", "accept"], source: "https://help.ubuntu.com/community/IptablesHowTo" },
    iptablesFields,
    (i, m) => generateIptables(i as never, m)
  ),
  tool(
    { id: "ufw", name: "UFW Firewall", description: "Cài và cấu hình UFW", category: "firewall", keywords: ["ufw", "firewall", "port", "allow", "deny"], source: "https://help.ubuntu.com/community/UFW" },
    ufwFields,
    (i, m) => generateUfw(i as never, m)
  ),
  tool(
    { id: "ssh", name: "SSH Hardening", description: "Cấu hình SSH an toàn", category: "security", keywords: ["ssh", "sshd", "port", "hardening", "key"], source: "https://www.openssh.com/manual.html" },
    sshFields,
    (i, m) => generateSsh(i as never, m)
  ),
  tool(
    { id: "sudo-user", name: "Tạo user sudo", description: "Thêm user quản trị thay root", category: "security", keywords: ["user", "sudo", "adduser", "ssh key"] },
    sudoUserFields,
    (i, m) => generateSudoUser(i as never, m)
  ),
  tool(
    { id: "docker", name: "Cài Docker", description: "Cài Docker Engine chuẩn", category: "docker", keywords: ["docker", "container", "compose"], source: "https://docs.docker.com/engine/install/ubuntu/" },
    dockerFields,
    (i, m) => generateDocker(i as never, m)
  ),
  tool(
    { id: "nginx", name: "Nginx Reverse Proxy", description: "Proxy cho Node.js/Docker app", category: "web", keywords: ["nginx", "reverse proxy", "websocket"], source: "https://nginx.org/en/docs/" },
    nginxFields,
    (i, m) => generateNginx(i as never, m)
  ),
  tool(
    { id: "certbot", name: "SSL Certbot", description: "Let's Encrypt SSL", category: "web", keywords: ["cert", "ssl", "letsencrypt", "certbot", "https"], source: "https://certbot.eff.org/instructions" },
    certbotFields,
    (i, m) => generateCertbot(i as never, m)
  ),
  tool(
    { id: "nodejs", name: "Node.js + PM2", description: "Cài Node.js và chạy PM2", category: "web", keywords: ["nodejs", "node", "npm", "pm2"], source: "https://github.com/nodesource/distributions" },
    nodejsFields,
    (i, m) => generateNodejs(i as never, m)
  ),
  tool(
    { id: "mongodb", name: "MongoDB Docker", description: "MongoDB container an toàn", category: "database", keywords: ["mongodb", "mongo", "database", "docker"], source: "https://hub.docker.com/_/mongo" },
    mongodbFields,
    (i, m) => generateMongodb(i as never, m)
  ),
  tool(
    { id: "postgresql", name: "PostgreSQL Docker", description: "PostgreSQL container", category: "database", keywords: ["postgresql", "postgres", "database"], source: "https://hub.docker.com/_/postgres" },
    postgresqlFields,
    (i, m) => generatePostgresql(i as never, m)
  ),
  tool(
    { id: "redis", name: "Redis Docker", description: "Redis container", category: "database", keywords: ["redis", "cache"], source: "https://hub.docker.com/_/redis" },
    redisFields,
    (i, m) => generateRedis(i as never, m)
  ),
  tool(
    { id: "systemd", name: "Systemd Service", description: "Tạo systemd service", category: "system", keywords: ["systemd", "service", "daemon"] },
    systemdFields,
    (i, m) => generateSystemd(i as never, m)
  ),
  tool(
    { id: "swap", name: "Swap File", description: "Tạo swap file", category: "system", keywords: ["swap", "memory", "swappiness"] },
    swapFields,
    (i, m) => generateSwap(i as never, m)
  ),
  tool(
    { id: "ports", name: "Kiểm tra port", description: "Lệnh kiểm tra port đang mở", category: "network", keywords: ["port", "ss", "lsof", "listen", "nc"] },
    portsFields,
    (i, m) => generatePorts(i as never, m)
  ),
  tool(
    { id: "update", name: "Update Ubuntu", description: "Cập nhật hệ thống", category: "system", keywords: ["update", "upgrade", "apt", "reboot"] },
    updateFields,
    (i, m) => generateUpdate(i as never, m)
  ),
  tool(
    { id: "logs", name: "Log cleanup", description: "Dọn log journal và Docker", category: "system", keywords: ["log", "journal", "cleanup", "prune"] },
    logsFields,
    (i, m) => generateLogs(i as never, m)
  ),
  tool(
    { id: "fail2ban", name: "Fail2ban", description: "Bảo vệ SSH bằng fail2ban", category: "security", keywords: ["fail2ban", "ban", "ssh", "bruteforce"], source: "https://github.com/fail2ban/fail2ban" },
    fail2banFields,
    (i, m) => generateFail2ban(i as never, m)
  ),
  tool(
    { id: "dns", name: "DNS / systemd-resolved", description: "Cấu hình DNS", category: "network", keywords: ["dns", "resolved", "netplan"], source: "https://www.freedesktop.org/software/systemd/man/latest/resolved.conf.html" },
    dnsFields,
    (i, m) => generateDns(i as never, m)
  ),
  tool(
    { id: "cron", name: "Cron Job", description: "Tạo cron job", category: "system", keywords: ["cron", "crontab", "schedule"] },
    cronFields,
    (i, m) => generateCron(i as never, m)
  ),
  tool(
    { id: "tailscale", name: "Tailscale", description: "Cài Tailscale VPN", category: "network", keywords: ["tailscale", "vpn", "mesh"], source: "https://tailscale.com/kb/1031/install-linux" },
    tailscaleFields,
    (i, m) => generateTailscale(i as never, m)
  ),
  tool(
    { id: "wireguard", name: "WireGuard", description: "VPN WireGuard cơ bản", category: "network", keywords: ["wireguard", "vpn", "wg"], source: "https://www.wireguard.com/quickstart/" },
    wireguardFields,
    (i, m) => generateWireguard(i as never, m)
  ),
  tool(
    { id: "git-deploy", name: "Git Deploy", description: "Deploy từ Git repo", category: "system", keywords: ["git", "deploy", "clone", "pull"] },
    gitDeployFields,
    (i, m) => generateGitDeploy(i as never, m)
  ),
  tool(
    { id: "rsync-backup", name: "Backup rsync", description: "Backup bằng rsync", category: "backup", keywords: ["rsync", "backup"] },
    rsyncFields,
    (i, m) => generateRsyncBackup(i as never, m)
  ),
  tool(
    { id: "rsync-restore", name: "Restore rsync", description: "Restore từ backup rsync", category: "backup", keywords: ["rsync", "restore"] },
    rsyncRestoreFields,
    (i, m) => generateRsyncRestore(i as never, m)
  ),
  tool(
    { id: "system-monitor", name: "Disk / RAM / CPU", description: "Kiểm tra tài nguyên hệ thống", category: "system", keywords: ["disk", "ram", "cpu", "process", "journal"] },
    systemMonitorFields,
    (i, m) => generateSystemMonitor(i, m)
  ),
  tool(
    { id: "ntp", name: "NTP / Timezone", description: "Cấu hình thời gian", category: "system", keywords: ["ntp", "timezone", "timedatectl"] },
    ntpFields,
    (i, m) => generateNtp(i as never, m)
  ),
  tool(
    { id: "hostname", name: "Đổi hostname", description: "Thay đổi hostname server", category: "system", keywords: ["hostname"] },
    hostnameFields,
    (i, m) => generateHostname(i as never, m)
  ),
  tool(
    { id: "security-audit", name: "Security audit", description: "Kiểm tra bảo mật cơ bản", category: "security", keywords: ["security", "audit", "lynis"] },
    securityAuditFields,
    (i, m) => generateSecurityAudit(i, m)
  ),
  tool(
    { id: "netplan", name: "Netplan Static IP", description: "Cấu hình IP tĩnh", category: "network", keywords: ["netplan", "static ip", "network"], source: "https://netplan.io/" },
    netplanFields,
    (i, m) => generateNetplan(i as never, m)
  ),
];

export const toolsById = Object.fromEntries(tools.map((t) => [t.definition.id, t]));

export const categoryLabels: Record<string, string> = {
  firewall: "Firewall",
  security: "Bảo mật",
  docker: "Docker",
  web: "Web Server",
  database: "Database",
  system: "Hệ thống",
  network: "Mạng",
  backup: "Backup",
};

export const serverProfiles: ServerProfile[] = [
  {
    id: "web-basic",
    name: "VPS web cơ bản",
    description: "UFW, Nginx, SSL, Node.js + PM2",
    tools: ["ufw", "nginx", "certbot", "nodejs"],
  },
  {
    id: "ssh-hardening",
    name: "SSH Hardening",
    description: "User sudo, SSH hardening, fail2ban",
    tools: ["sudo-user", "ssh", "fail2ban", "ufw"],
  },
  {
    id: "docker-server",
    name: "Server Docker",
    description: "Docker, log rotate, firewall warning",
    tools: ["docker", "ufw", "ports"],
  },
  {
    id: "nodejs-server",
    name: "Server Node.js",
    description: "Node.js, PM2, Nginx, SSL",
    tools: ["nodejs", "nginx", "certbot", "systemd"],
  },
  {
    id: "mongodb-test",
    name: "MongoDB test",
    description: "MongoDB Docker localhost, firewall",
    tools: ["mongodb", "ufw"],
  },
];

export function searchTools(query: string): ToolConfig[] {
  const q = query.toLowerCase().trim();
  if (!q) return tools;
  return tools.filter(
    (t) =>
      t.definition.name.toLowerCase().includes(q) ||
      t.definition.description.toLowerCase().includes(q) ||
      t.definition.keywords.some((k) => k.includes(q))
  );
}
