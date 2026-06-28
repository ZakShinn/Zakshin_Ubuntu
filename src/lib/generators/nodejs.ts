import type { FormFieldConfig, GeneratorResult, Mode } from "../types";
import { wrapResult } from "./utils";

export interface NodejsInput {
  nodeVersion: string;
  projectPath: string;
  runScript: string;
  pm2AppName: string;
  autoStart: boolean;
  buildFirst: boolean;
}

export const nodejsFields: FormFieldConfig[] = [
  {
    name: "nodeVersion",
    label: "Phiên bản Node.js",
    type: "select",
    options: [
      { value: "22", label: "Node.js 22 LTS" },
      { value: "20", label: "Node.js 20 LTS" },
      { value: "18", label: "Node.js 18" },
    ],
    defaultValue: "22",
  },
  { name: "projectPath", label: "Đường dẫn project", type: "text", placeholder: "/home/ubuntu/app", validate: "path" },
  { name: "runScript", label: "Script chạy", type: "select", options: [
    { value: "start", label: "npm start" },
    { value: "dev", label: "npm run dev" },
    { value: "build", label: "npm run build && npm start" },
  ], defaultValue: "start" },
  { name: "pm2AppName", label: "Tên app PM2", type: "text", placeholder: "my-app", required: true },
  { name: "buildFirst", label: "Chạy npm install + build trước", type: "checkbox", defaultValue: true },
  { name: "autoStart", label: "Auto start khi reboot (pm2 startup)", type: "checkbox", defaultValue: true },
];

const SOURCE = "https://github.com/nodesource/distributions";

export function generateNodejs(input: NodejsInput, _mode: Mode): GeneratorResult {
  const ver = input.nodeVersion || "22";
  const path = input.projectPath || "/home/ubuntu/app";
  const appName = input.pm2AppName || "my-app";

  const commands: GeneratorResult["commands"] = [
    {
      title: "Cài Node.js",
      commands: `curl -fsSL https://deb.nodesource.com/setup_${ver}.x | sudo -E bash -\nsudo apt install -y nodejs\nnode -v\nnpm -v`,
      riskLevel: "low",
      category: "install",
      source: SOURCE,
    },
    {
      title: "Cài PM2",
      commands: `sudo npm install -g pm2`,
      riskLevel: "low",
      category: "install",
    },
  ];

  if (input.buildFirst && path) {
    commands.push({
      title: "Build app",
      commands: `cd ${path}\nnpm install\nnpm run build`,
      riskLevel: "low",
      category: "execute",
    });
  }

  const pm2Cmd =
    input.runScript === "dev"
      ? `pm2 start npm --name "${appName}" -- run dev`
      : input.runScript === "build"
        ? `pm2 start npm --name "${appName}" -- start`
        : `pm2 start npm --name "${appName}" -- start`;

  commands.push({
    title: "Chạy app với PM2",
    commands: `cd ${path}\n${pm2Cmd}\npm2 save`,
    riskLevel: "low",
    category: "execute",
  });

  if (input.autoStart) {
    commands.push({
      title: "Cấu hình auto start",
      commands: `pm2 startup\n# Chạy lệnh sudo mà PM2 in ra\npm2 save`,
      riskLevel: "low",
      category: "execute",
    });
  }

  commands.push({
    title: "Kiểm tra PM2",
    commands: `pm2 status\npm2 logs ${appName} --lines 20`,
    riskLevel: "low",
    category: "check",
  });

  const explanations = [
    { title: "NodeSource", content: "Repo chính thức cho Node.js trên Ubuntu." },
    { title: "PM2", content: "Process manager, tự restart khi crash." },
  ];

  return wrapResult(commands, explanations, [], `nodejs-${appName}`);
}
