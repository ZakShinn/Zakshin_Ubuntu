import type { FormFieldConfig, GeneratorResult, Mode } from "../types";
import { wrapResult } from "./utils";

export interface RedisInput {
  redisPassword: string;
  exposePort: string;
  dataPath: string;
  bindLocalhost: boolean;
  persistence: boolean;
}

export const redisFields: FormFieldConfig[] = [
  { name: "redisPassword", label: "Password (requirepass)", type: "password", validate: "password" },
  { name: "exposePort", label: "Port", type: "number", defaultValue: "6379", validate: "port" },
  { name: "dataPath", label: "Data path", type: "text", defaultValue: "/home/ubuntu/redis", validate: "path" },
  { name: "bindLocalhost", label: "Chỉ bind localhost", type: "checkbox", defaultValue: true },
  { name: "persistence", label: "Bật persistence (AOF)", type: "checkbox", defaultValue: true },
];

const SOURCE = "https://hub.docker.com/_/redis";

export function generateRedis(input: RedisInput, _mode: Mode): GeneratorResult {
  const portBinding = input.bindLocalhost
    ? `-p 127.0.0.1:${input.exposePort || "6379"}:6379`
    : `-p ${input.exposePort || "6379"}:6379`;

  const authCmd = input.redisPassword
    ? `redis-server --requirepass '${input.redisPassword}'${input.persistence ? " --appendonly yes" : ""}`
    : `redis-server${input.persistence ? " --appendonly yes" : ""}`;

  const commands: GeneratorResult["commands"] = [
    {
      title: "Chạy Redis Docker",
      commands: `sudo mkdir -p ${input.dataPath}\ndocker run -d \\
  --name redis \\
  --restart unless-stopped \\
  ${portBinding} \\
  -v ${input.dataPath}:/data \\
  redis:7 ${authCmd}`,
      riskLevel: input.bindLocalhost ? "low" : "high",
      category: "execute",
      source: SOURCE,
      rollback: `docker stop redis && docker rm redis`,
    },
    {
      title: "Kiểm tra Redis",
      commands: `docker exec redis redis-cli ping`,
      riskLevel: "low",
      category: "check",
    },
  ];

  const warnings = [
    "Redis không nên public nếu không có password mạnh.",
    !input.redisPassword ? "Khuyến nghị đặt requirepass!" : "",
  ].filter(Boolean) as string[];

  return wrapResult(commands, [], warnings, "redis-docker");
}
