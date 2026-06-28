import type { FormFieldConfig, GeneratorResult, Mode } from "../types";
import { wrapResult } from "./utils";

export interface CertbotInput {
  domain: string;
  email: string;
  webServer: string;
  autoRenew: boolean;
}

export const certbotFields: FormFieldConfig[] = [
  { name: "domain", label: "Domain", type: "text", placeholder: "example.com", validate: "domain", required: true },
  { name: "email", label: "Email", type: "text", placeholder: "admin@example.com", required: true },
  {
    name: "webServer",
    label: "Web server",
    type: "select",
    options: [
      { value: "nginx", label: "Nginx" },
      { value: "apache", label: "Apache" },
      { value: "standalone", label: "Standalone (không dùng web server)" },
    ],
    defaultValue: "nginx",
  },
  { name: "autoRenew", label: "Kiểm tra tự gia hạn", type: "checkbox", defaultValue: true },
];

const SOURCE = "https://certbot.eff.org/instructions";

export function generateCertbot(input: CertbotInput, _mode: Mode): GeneratorResult {
  const domain = input.domain.trim();
  const pkg =
    input.webServer === "apache"
      ? "python3-certbot-apache"
      : "python3-certbot-nginx";

  let certCmd = "";
  if (input.webServer === "nginx") {
    certCmd = `sudo certbot --nginx -d ${domain} --email ${input.email} --agree-tos --no-eff-email`;
  } else if (input.webServer === "apache") {
    certCmd = `sudo certbot --apache -d ${domain} --email ${input.email} --agree-tos --no-eff-email`;
  } else {
    certCmd = `sudo certbot certonly --standalone -d ${domain} --email ${input.email} --agree-tos --no-eff-email`;
  }

  const commands: GeneratorResult["commands"] = [
    {
      title: "Cài Certbot",
      commands: `sudo apt update\nsudo apt install -y certbot ${input.webServer !== "standalone" ? pkg : ""}`,
      riskLevel: "low",
      category: "install",
      source: SOURCE,
    },
    {
      title: "Tạo SSL certificate",
      commands: certCmd,
      riskLevel: "medium",
      category: "execute",
      warnings: ["Domain phải trỏ DNS về IP server. Port 80 phải mở."],
      source: SOURCE,
    },
    {
      title: "Kiểm tra certificate",
      commands: `sudo certbot certificates`,
      riskLevel: "low",
      category: "check",
    },
  ];

  if (input.autoRenew) {
    commands.push({
      title: "Kiểm tra tự gia hạn (dry-run)",
      commands: `sudo certbot renew --dry-run`,
      riskLevel: "low",
      category: "check",
      source: SOURCE,
    });
  }

  const warnings = [
    "Port 80 và 443 phải mở trên firewall.",
    "DNS A record phải trỏ đúng IP server.",
  ];

  const explanations = [
    { title: "Let's Encrypt", content: "Chứng chỉ SSL miễn phí, gia hạn tự động qua certbot." },
    { title: "Nguồn", content: "Certbot Official - certbot.eff.org" },
  ];

  return wrapResult(commands, explanations, warnings, `certbot-${domain}`);
}
