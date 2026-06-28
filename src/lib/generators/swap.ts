import type { FormFieldConfig, GeneratorResult, Mode } from "../types";
import { wrapResult } from "./utils";

export interface SwapInput {
  swapSize: string;
  swappiness: string;
  persist: boolean;
}

export const swapFields: FormFieldConfig[] = [
  {
    name: "swapSize",
    label: "Dung lượng swap",
    type: "select",
    options: [
      { value: "1G", label: "1 GB" },
      { value: "2G", label: "2 GB" },
      { value: "4G", label: "4 GB" },
      { value: "8G", label: "8 GB" },
    ],
    defaultValue: "2G",
  },
  { name: "swappiness", label: "Swappiness (0-100)", type: "number", defaultValue: "10" },
  { name: "persist", label: "Bật vĩnh viễn (fstab)", type: "checkbox", defaultValue: true },
];

export function generateSwap(input: SwapInput, _mode: Mode): GeneratorResult {
  const size = input.swapSize || "2G";
  const swappiness = input.swappiness || "10";

  const commands: GeneratorResult["commands"] = [
    {
      title: "Kiểm tra swap hiện tại",
      commands: `free -h\nswapon --show`,
      riskLevel: "low",
      category: "check",
    },
    {
      title: `Tạo swap file ${size}`,
      commands: `sudo fallocate -l ${size} /swapfile\nsudo chmod 600 /swapfile\nsudo mkswap /swapfile\nsudo swapon /swapfile`,
      riskLevel: "medium",
      rollback: `sudo swapoff /swapfile\nsudo rm /swapfile`,
      category: "execute",
    },
  ];

  if (input.persist) {
    commands.push({
      title: "Lưu swap vĩnh viễn",
      commands: `echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab`,
      riskLevel: "medium",
      category: "save",
    });
  }

  commands.push({
    title: "Tối ưu swappiness",
    commands: `echo 'vm.swappiness=${swappiness}' | sudo tee /etc/sysctl.d/99-swappiness.conf\nsudo sysctl -p /etc/sysctl.d/99-swappiness.conf`,
    riskLevel: "low",
    category: "execute",
  });

  commands.push({
    title: "Kiểm tra sau cấu hình",
    commands: `free -h\nswapon --show`,
    riskLevel: "low",
    category: "check",
  });

  const warnings = [
    "Kiểm tra /swapfile chưa tồn tại trước khi tạo.",
    "Swappiness thấp (10) phù hợp server, cao hơn cho desktop.",
  ];

  return wrapResult(commands, [
    { title: "swappiness", content: "Giá trị thấp = ưu tiên RAM, chỉ swap khi cần." },
  ], warnings, "swap-setup");
}
