import type { FormFieldConfig, GeneratorResult, Mode } from "../types";
import { wrapResult } from "./utils";

export interface DockerInput {
  installCompose: boolean;
  addUserToDocker: boolean;
  logRotate: boolean;
  enableIPv6: boolean;
}

export const dockerFields: FormFieldConfig[] = [
  { name: "installCompose", label: "Cài Docker Compose plugin", type: "checkbox", defaultValue: true },
  { name: "addUserToDocker", label: "Thêm user hiện tại vào group docker", type: "checkbox", defaultValue: true },
  { name: "logRotate", label: "Cấu hình log rotate", type: "checkbox", defaultValue: true },
  { name: "enableIPv6", label: "Bật IPv6 Docker", type: "checkbox", defaultValue: false, advancedOnly: true },
];

const SOURCE = "https://docs.docker.com/engine/install/ubuntu/";

export function generateDocker(input: DockerInput, _mode: Mode): GeneratorResult {
  const warnings: string[] = [
    "Docker có thể can thiệp iptables - cảnh báo khi dùng firewall thủ công.",
    "Sau usermod -aG docker cần logout/login lại.",
  ];

  const commands: GeneratorResult["commands"] = [
    {
      title: "Cài dependencies",
      commands: `sudo apt update\nsudo apt install -y ca-certificates curl gnupg`,
      riskLevel: "low",
      category: "install",
      source: SOURCE,
    },
    {
      title: "Thêm Docker GPG key",
      commands: `sudo install -m 0755 -d /etc/apt/keyrings\ncurl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg\nsudo chmod a+r /etc/apt/keyrings/docker.gpg`,
      riskLevel: "low",
      category: "install",
      source: SOURCE,
    },
    {
      title: "Thêm Docker repository",
      commands: `echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null`,
      riskLevel: "low",
      category: "install",
      source: SOURCE,
    },
    {
      title: "Cài Docker Engine",
      commands: `sudo apt update\nsudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin${input.installCompose ? " docker-compose-plugin" : ""}`,
      riskLevel: "low",
      category: "install",
      source: SOURCE,
    },
  ];

  if (input.addUserToDocker) {
    commands.push({
      title: "Thêm user vào group docker",
      commands: `sudo usermod -aG docker $USER\n# Logout và login lại để áp dụng`,
      riskLevel: "low",
      category: "execute",
    });
  }

  if (input.logRotate) {
    commands.push({
      title: "Cấu hình log rotate",
      commands: `sudo mkdir -p /etc/docker\nsudo tee /etc/docker/daemon.json > /dev/null <<'EOF'\n{\n  "log-driver": "json-file",\n  "log-opts": {\n    "max-size": "10m",\n    "max-file": "3"\n  }\n}\nEOF\n\nsudo systemctl restart docker`,
      riskLevel: "medium",
      category: "execute",
    });
  }

  if (input.enableIPv6) {
    commands.push({
      title: "Bật IPv6 Docker",
      commands: `sudo tee /etc/docker/daemon.json > /dev/null <<'EOF'\n{\n  "ipv6": true,\n  "fixed-cidr-v6": "fd00::/80"\n}\nEOF\nsudo systemctl restart docker`,
      riskLevel: "medium",
      category: "execute",
    });
  }

  commands.push({
    title: "Kiểm tra Docker",
    commands: `docker version\ndocker compose version\ndocker run --rm hello-world`,
    riskLevel: "low",
    category: "check",
  });

  const explanations = [
    { title: "Docker official repo", content: "Cài từ repo chính thức Docker, không dùng docker.io cũ." },
    { title: "daemon.json", content: "Giới hạn log tránh đầy disk." },
  ];

  return wrapResult(commands, explanations, warnings, "docker-install");
}
