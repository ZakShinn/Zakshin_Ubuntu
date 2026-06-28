import type { FormFieldConfig, GeneratorResult, Mode } from "../types";
import { wrapResult } from "./utils";

export const rsyncFields: FormFieldConfig[] = [
  { name: "sourcePath", label: "Đường dẫn nguồn", type: "text", placeholder: "/home/ubuntu/app", validate: "path", required: true },
  { name: "destHost", label: "Host đích", type: "text", placeholder: "backup-server.com", required: true },
  { name: "destPath", label: "Đường dẫn đích", type: "text", placeholder: "/backup/app", validate: "path" },
  { name: "destUser", label: "User SSH đích", type: "text", defaultValue: "ubuntu", validate: "username" },
  { name: "excludeDirs", label: "Thư mục loại trừ", type: "text", placeholder: "node_modules,.git", defaultValue: "node_modules,.git" },
];

export function generateRsyncBackup(
  input: { sourcePath?: string; destHost?: string; destPath?: string; destUser?: string; excludeDirs?: string },
  _mode: Mode
): GeneratorResult {
  const excludes = (input.excludeDirs || "node_modules,.git")
    .split(",")
    .map((e) => `--exclude='${e.trim()}'`)
    .join(" ");

  const commands: GeneratorResult["commands"] = [
    {
      title: "Backup bằng rsync",
      commands: `rsync -avz --delete ${excludes} -e ssh ${input.sourcePath}/ ${input.destUser || "ubuntu"}@${input.destHost}:${input.destPath}/`,
      riskLevel: "medium",
      category: "execute",
      warnings: ["--delete xóa file ở đích không có ở nguồn. Test trước!"],
    },
    {
      title: "Kiểm tra kết nối SSH",
      commands: `ssh ${input.destUser || "ubuntu"}@${input.destHost} "ls -la ${input.destPath}"`,
      riskLevel: "low",
      category: "check",
    },
  ];

  return wrapResult(commands, [], ["Cần SSH key tới server đích."], "rsync-backup");
}

export const rsyncRestoreFields: FormFieldConfig[] = [
  { name: "sourceHost", label: "Host nguồn backup", type: "text", required: true },
  { name: "sourcePath", label: "Đường dẫn backup", type: "text", validate: "path", required: true },
  { name: "destPath", label: "Đường dẫn restore", type: "text", validate: "path", required: true },
  { name: "sourceUser", label: "User SSH", type: "text", defaultValue: "ubuntu" },
];

export function generateRsyncRestore(
  input: { sourceHost?: string; sourcePath?: string; destPath?: string; sourceUser?: string },
  _mode: Mode
): GeneratorResult {
  const commands: GeneratorResult["commands"] = [
    {
      title: "Restore từ backup",
      commands: `rsync -avz -e ssh ${input.sourceUser || "ubuntu"}@${input.sourceHost}:${input.sourcePath}/ ${input.destPath}/`,
      riskLevel: "high",
      category: "execute",
      warnings: ["Ghi đè dữ liệu hiện tại! Backup trước khi restore."],
    },
    {
      title: "Kiểm tra",
      commands: `ls -la ${input.destPath}`,
      riskLevel: "low",
      category: "check",
    },
  ];

  return wrapResult(commands, [], ["Restore ghi đè file hiện có."], "rsync-restore");
}
