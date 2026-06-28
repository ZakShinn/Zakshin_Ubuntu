import type { FormFieldConfig, GeneratorResult, Mode } from "../types";
import { wrapResult } from "./utils";

export interface CronInput {
  cronCommand: string;
  schedule: string;
  cronUser: string;
  enableLog: boolean;
  logPath: string;
}

export const cronFields: FormFieldConfig[] = [
  { name: "cronCommand", label: "Lệnh cần chạy", type: "text", placeholder: "/path/to/script.sh", required: true },
  {
    name: "schedule",
    label: "Lịch chạy",
    type: "select",
    options: [
      { value: "* * * * *", label: "Mỗi phút" },
      { value: "0 * * * *", label: "Mỗi giờ" },
      { value: "0 0 * * *", label: "Mỗi ngày 0h" },
      { value: "0 0 * * 0", label: "Mỗi Chủ nhật 0h" },
      { value: "0 */6 * * *", label: "Mỗi 6 giờ" },
      { value: "custom", label: "Tùy chỉnh (nhập bên dưới)" },
    ],
    defaultValue: "0 0 * * *",
  },
  { name: "customSchedule", label: "Cron expression tùy chỉnh", type: "text", placeholder: "0 2 * * *", advancedOnly: true },
  { name: "cronUser", label: "User chạy cron", type: "text", defaultValue: "root", validate: "username" },
  { name: "enableLog", label: "Ghi log", type: "checkbox", defaultValue: true },
  { name: "logPath", label: "Đường dẫn log", type: "text", defaultValue: "/var/log/my-cron.log", validate: "path" },
];

export function generateCron(input: CronInput & { customSchedule?: string }, _mode: Mode): GeneratorResult {
  const schedule =
    input.schedule === "custom"
      ? input.customSchedule || "0 0 * * *"
      : input.schedule;
  const cmd = input.cronCommand;
  const logSuffix = input.enableLog
    ? ` >> ${input.logPath || "/var/log/my-cron.log"} 2>&1`
    : "";
  const cronLine = `${schedule} ${cmd}${logSuffix}`;

  const commands: GeneratorResult["commands"] = [
    {
      title: "Cron job",
      description: `Thêm dòng sau vào crontab của ${input.cronUser || "root"}`,
      commands: `${cronLine}\n\n# Mở crontab:\n${input.cronUser === "root" ? "sudo crontab -e" : `crontab -e`}`,
      riskLevel: "medium",
      category: "execute",
    },
    {
      title: "Kiểm tra crontab",
      commands: input.cronUser === "root" ? `sudo crontab -l` : `crontab -l`,
      riskLevel: "low",
      category: "check",
    },
  ];

  if (input.enableLog) {
    commands.push({
      title: "Xem log cron",
      commands: `tail -f ${input.logPath || "/var/log/my-cron.log"}`,
      riskLevel: "low",
      category: "check",
    });
  }

  const warnings = [
    "Đảm bảo script có quyền thực thi (chmod +x).",
    "Dùng đường dẫn tuyệt đối trong cron command.",
  ];

  return wrapResult(commands, [
    { title: "Cron format", content: "phút giờ ngày tháng thứ (0-59 0-23 1-31 1-12 0-7)" },
  ], warnings, "cron-job");
}
