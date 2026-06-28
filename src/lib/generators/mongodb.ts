import type { FormFieldConfig, GeneratorResult, Mode } from "../types";
import { wrapResult } from "./utils";

export interface MongodbInput {
  adminUser: string;
  adminPassword: string;
  exposePort: string;
  dataPath: string;
  bindLocalhost: boolean;
  allowedIP: string;
  mongoVersion: string;
}

export const mongodbFields: FormFieldConfig[] = [
  { name: "adminUser", label: "Username admin", type: "text", defaultValue: "admin", required: true },
  { name: "adminPassword", label: "Password", type: "password", validate: "password", required: true },
  { name: "exposePort", label: "Port expose", type: "number", defaultValue: "27017", validate: "port" },
  { name: "dataPath", label: "Đường dẫn lưu data", type: "text", defaultValue: "/home/ubuntu/mongodb", validate: "path" },
  { name: "bindLocalhost", label: "Chỉ bind localhost (khuyến nghị)", type: "checkbox", defaultValue: true },
  { name: "allowedIP", label: "IP cụ thể (nếu không bind localhost)", type: "text", validate: "ip", advancedOnly: true },
  {
    name: "mongoVersion",
    label: "MongoDB version",
    type: "select",
    options: [
      { value: "7", label: "MongoDB 7" },
      { value: "6", label: "MongoDB 6" },
    ],
    defaultValue: "7",
  },
];

const SOURCE = "https://hub.docker.com/_/mongo";

export function generateMongodb(input: MongodbInput, _mode: Mode): GeneratorResult {
  const user = input.adminUser || "admin";
  const pass = input.adminPassword || "YourStrongPassword";
  const port = input.exposePort || "27017";
  const dataPath = input.dataPath || "/home/ubuntu/mongodb";
  const version = input.mongoVersion || "7";

  let portBinding = `-p 127.0.0.1:${port}:27017`;
  const warnings: string[] = [
    "KHÔNG nên mở MongoDB public ra Internet.",
    "Nếu cần truy cập từ máy khác, dùng VPN, Tailscale hoặc firewall whitelist IP.",
    "Không dùng password yếu.",
    "Password trong script .sh - xóa file sau khi dùng!",
  ];

  if (!input.bindLocalhost) {
  if (input.allowedIP) {
      portBinding = `-p ${input.allowedIP}:${port}:27017`;
    } else {
      portBinding = `-p ${port}:27017`;
      warnings.push("CẢNH BÁO ĐỎ: MongoDB đang bind public! Chỉ dùng trong mạng nội bộ.");
    }
  }

  const runCmd = `docker run -d \\
  --name mongodb \\
  --restart unless-stopped \\
  ${portBinding} \\
  -v ${dataPath}:/data/db \\
  -e MONGO_INITDB_ROOT_USERNAME=${user} \\
  -e MONGO_INITDB_ROOT_PASSWORD='${pass}' \\
  mongo:${version}`;

  const connStr = `mongodb://${user}:${pass}@127.0.0.1:${port}/admin`;

  const commands: GeneratorResult["commands"] = [
    {
      title: "Tạo thư mục data",
      commands: `sudo mkdir -p ${dataPath}\nsudo chown -R 999:999 ${dataPath}`,
      riskLevel: "low",
      category: "install",
    },
    {
      title: "Chạy MongoDB container",
      commands: runCmd,
      riskLevel: input.bindLocalhost ? "low" : "high",
      category: "execute",
      source: SOURCE,
      rollback: `docker stop mongodb && docker rm mongodb`,
    },
    {
      title: "Connection string",
      description: "Dùng trong app (chỉ localhost)",
      commands: connStr,
      riskLevel: "medium",
      category: "explain",
      warnings: ["Không commit connection string có password vào git!"],
    },
    {
      title: "Kiểm tra MongoDB",
      commands: `docker ps | grep mongodb\ndocker logs mongodb --tail 20`,
      riskLevel: "low",
      category: "check",
    },
  ];

  const explanations = [
    { title: "127.0.0.1 bind", content: "Chỉ cho phép kết nối từ localhost - an toàn nhất." },
    { title: "mongo:7", content: "Image chính thức từ Docker Hub." },
  ];

  return wrapResult(commands, explanations, warnings, "mongodb-docker");
}
