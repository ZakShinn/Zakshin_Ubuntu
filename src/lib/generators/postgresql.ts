import type { FormFieldConfig, GeneratorResult, Mode } from "../types";
import { wrapResult } from "./utils";

export interface PostgresqlInput {
  dbName: string;
  dbUser: string;
  dbPassword: string;
  exposePort: string;
  dataPath: string;
  bindLocalhost: boolean;
  pgVersion: string;
}

export const postgresqlFields: FormFieldConfig[] = [
  { name: "dbName", label: "Database name", type: "text", defaultValue: "mydb", required: true },
  { name: "dbUser", label: "Username", type: "text", defaultValue: "dbuser", required: true },
  { name: "dbPassword", label: "Password", type: "password", validate: "password", required: true },
  { name: "exposePort", label: "Port", type: "number", defaultValue: "5432", validate: "port" },
  { name: "dataPath", label: "Data path", type: "text", defaultValue: "/home/ubuntu/postgresql", validate: "path" },
  { name: "bindLocalhost", label: "Chỉ bind localhost", type: "checkbox", defaultValue: true },
  { name: "pgVersion", label: "PostgreSQL version", type: "select", options: [
    { value: "16", label: "PostgreSQL 16" },
    { value: "15", label: "PostgreSQL 15" },
  ], defaultValue: "16" },
];

const SOURCE = "https://hub.docker.com/_/postgres";

export function generatePostgresql(input: PostgresqlInput, _mode: Mode): GeneratorResult {
  const portBinding = input.bindLocalhost
    ? `-p 127.0.0.1:${input.exposePort || "5432"}:5432`
    : `-p ${input.exposePort || "5432"}:5432`;

  const warnings = input.bindLocalhost
    ? ["Bind localhost - an toàn cho production."]
    : ["CẢNH BÁO: PostgreSQL public - dùng firewall whitelist!"];

  const commands: GeneratorResult["commands"] = [
    {
      title: "Chạy PostgreSQL Docker",
      commands: `sudo mkdir -p ${input.dataPath}\ndocker run -d \\
  --name postgresql \\
  --restart unless-stopped \\
  ${portBinding} \\
  -v ${input.dataPath}:/var/lib/postgresql/data \\
  -e POSTGRES_DB=${input.dbName} \\
  -e POSTGRES_USER=${input.dbUser} \\
  -e POSTGRES_PASSWORD='${input.dbPassword}' \\
  postgres:${input.pgVersion || "16"}`,
      riskLevel: input.bindLocalhost ? "low" : "high",
      category: "execute",
      source: SOURCE,
      rollback: `docker stop postgresql && docker rm postgresql`,
    },
    {
      title: "Kiểm tra",
      commands: `docker ps | grep postgresql\ndocker exec postgresql pg_isready`,
      riskLevel: "low",
      category: "check",
    },
  ];

  return wrapResult(commands, [], warnings, "postgresql-docker");
}
