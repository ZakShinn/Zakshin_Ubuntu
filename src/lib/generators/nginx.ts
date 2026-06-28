import type { FormFieldConfig, GeneratorResult, Mode } from "../types";
import { wrapResult } from "./utils";

export interface NginxInput {
  domain: string;
  backendPort: string;
  websocket: boolean;
  redirectHttps: boolean;
  largeUpload: boolean;
  gzip: boolean;
}

export const nginxFields: FormFieldConfig[] = [
  { name: "domain", label: "Domain", type: "text", placeholder: "example.com", validate: "domain", required: true },
  { name: "backendPort", label: "Port app backend", type: "number", defaultValue: "3000", validate: "port", required: true },
  { name: "websocket", label: "Dùng WebSocket", type: "checkbox", defaultValue: false },
  { name: "redirectHttps", label: "Redirect HTTP → HTTPS (cần SSL)", type: "checkbox", defaultValue: false },
  { name: "largeUpload", label: "Upload file lớn (>10MB)", type: "checkbox", defaultValue: false },
  { name: "gzip", label: "Bật gzip", type: "checkbox", defaultValue: true },
];

const SOURCE = "https://nginx.org/en/docs/";

export function generateNginx(input: NginxInput, _mode: Mode): GeneratorResult {
  const domain = input.domain.trim();
  const port = input.backendPort || "3000";

  const locationBlock = [
    "    location / {",
    `        proxy_pass http://127.0.0.1:${port};`,
    "        proxy_http_version 1.1;",
    "",
    "        proxy_set_header Host $host;",
    "        proxy_set_header X-Real-IP $remote_addr;",
    "        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;",
    "        proxy_set_header X-Forwarded-Proto $scheme;",
  ];

  if (input.websocket) {
    locationBlock.push(
      "",
      "        proxy_set_header Upgrade $http_upgrade;",
      '        proxy_set_header Connection "upgrade";'
    );
  }

  if (input.largeUpload) {
    locationBlock.push("", "        client_max_body_size 100M;");
  }

  locationBlock.push("    }");

  const gzipBlock = input.gzip
    ? "\n    gzip on;\n    gzip_types text/plain text/css application/json application/javascript;\n"
    : "";

  const serverConfig = `server {
    listen 80;
    server_name ${domain};
${gzipBlock}
${locationBlock.join("\n")}
}`;

  const commands: GeneratorResult["commands"] = [
    {
      title: "Cài Nginx",
      commands: `sudo apt update\nsudo apt install -y nginx`,
      riskLevel: "low",
      category: "install",
      source: SOURCE,
    },
    {
      title: `Tạo config ${domain}`,
      description: "Lưu vào /etc/nginx/sites-available/",
      commands: `sudo tee /etc/nginx/sites-available/${domain} > /dev/null <<'EOF'\n${serverConfig}\nEOF`,
      riskLevel: "low",
      category: "execute",
    },
    {
      title: "Kích hoạt site",
      commands: `sudo ln -sf /etc/nginx/sites-available/${domain} /etc/nginx/sites-enabled/\nsudo nginx -t\nsudo systemctl reload nginx`,
      riskLevel: "medium",
      rollback: `sudo rm /etc/nginx/sites-enabled/${domain}\nsudo systemctl reload nginx`,
      category: "execute",
    },
    {
      title: "Kiểm tra Nginx",
      commands: `sudo systemctl status nginx --no-pager\ncurl -I http://${domain}`,
      riskLevel: "low",
      category: "check",
    },
  ];

  if (input.redirectHttps) {
    commands.push({
      title: "Redirect HTTP → HTTPS",
      description: "Thêm sau khi đã cài SSL Certbot",
      commands: `sudo certbot --nginx -d ${domain}`,
      riskLevel: "low",
      category: "execute",
    });
  }

  const explanations = [
    { title: "proxy_pass", content: "Chuyển tiếp request tới app backend trên localhost." },
    { title: "proxy_set_header", content: "Truyền IP thật và protocol cho app." },
    { title: "WebSocket", content: "Cần Upgrade và Connection headers." },
  ];

  const warnings = input.redirectHttps
    ? ["Cần cài SSL trước khi redirect HTTPS hoạt động."]
    : [];

  return wrapResult(commands, explanations, warnings, `nginx-${domain}`);
}
