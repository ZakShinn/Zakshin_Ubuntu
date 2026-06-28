import type { GeneratedCommand, GeneratorResult } from "../types";

export function buildScript(
  commands: GeneratedCommand[],
  scriptName: string
): string {
  const lines: string[] = [
    "#!/bin/bash",
    "set -e",
    "",
    `echo "Bắt đầu cấu hình: ${scriptName}..."`,
    "",
  ];

  for (const cmd of commands) {
    if (cmd.category === "warning" || cmd.category === "explain") continue;
    lines.push(`# ${cmd.title}`);
    if (cmd.description) {
      lines.push(`# ${cmd.description}`);
    }
    lines.push(cmd.commands);
    lines.push("");
  }

  const checks = commands.filter((c) => c.category === "check");
  if (checks.length > 0) {
    lines.push('echo "Hoàn tất. Kiểm tra trạng thái:"');
    for (const check of checks) {
      lines.push(check.commands);
    }
  } else {
    lines.push('echo "Hoàn tất cấu hình."');
  }

  return lines.join("\n");
}

export function wrapResult(
  commands: GeneratedCommand[],
  explanations: { title: string; content: string }[],
  warnings: string[],
  scriptName: string
): GeneratorResult {
  return { commands, explanations, warnings, scriptName };
}

export function protoFlag(proto: string): string {
  if (proto === "tcp") return "-p tcp";
  if (proto === "udp") return "-p udp";
  return "";
}

export function ufwProto(proto: string): string {
  if (proto === "tcp") return "/tcp";
  if (proto === "udp") return "/udp";
  return "";
}
