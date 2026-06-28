import type { FormFieldConfig, GeneratorResult, Mode } from "../types";
import { wrapResult } from "./utils";

export const gitDeployFields: FormFieldConfig[] = [
  { name: "repoUrl", label: "Git repository URL", type: "text", placeholder: "git@github.com:user/repo.git", required: true },
  { name: "deployPath", label: "Đường dẫn deploy", type: "text", defaultValue: "/home/ubuntu/app", validate: "path" },
  { name: "branch", label: "Branch", type: "text", defaultValue: "main" },
  { name: "runAfterDeploy", label: "Lệnh sau deploy", type: "text", placeholder: "npm install && npm run build && pm2 restart app" },
];

export function generateGitDeploy(
  input: { repoUrl?: string; deployPath?: string; branch?: string; runAfterDeploy?: string },
  _mode: Mode
): GeneratorResult {
  const path = input.deployPath || "/home/ubuntu/app";
  const branch = input.branch || "main";

  const commands: GeneratorResult["commands"] = [
    {
      title: "Clone hoặc pull repo",
      commands: `[ -d "${path}/.git" ] && cd ${path} && git pull origin ${branch} || git clone -b ${branch} ${input.repoUrl} ${path}`,
      riskLevel: "low",
      category: "execute",
    },
  ];

  if (input.runAfterDeploy) {
    commands.push({
      title: "Chạy sau deploy",
      commands: `cd ${path}\n${input.runAfterDeploy}`,
      riskLevel: "medium",
      category: "execute",
    });
  }

  commands.push({
    title: "Kiểm tra",
    commands: `cd ${path} && git log -1 --oneline && git status`,
    riskLevel: "low",
    category: "check",
  });

  return wrapResult(commands, [], ["Cần SSH key hoặc token để clone private repo."], "git-deploy");
}
