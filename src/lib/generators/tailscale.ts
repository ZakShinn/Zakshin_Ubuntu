import type { FormFieldConfig, GeneratorResult, Mode } from "../types";
import { wrapResult } from "./utils";

export const tailscaleFields: FormFieldConfig[] = [
  { name: "advertiseRoutes", label: "Advertise subnet routes", type: "text", placeholder: "10.0.0.0/24", advancedOnly: true },
  { name: "acceptRoutes", label: "Accept routes từ tailnet", type: "checkbox", defaultValue: false },
];

const SOURCE = "https://tailscale.com/kb/1031/install-linux";

export function generateTailscale(
  input: { advertiseRoutes?: string; acceptRoutes?: boolean },
  _mode: Mode
): GeneratorResult {
  const commands: GeneratorResult["commands"] = [
    {
      title: "Cài Tailscale",
      commands: `curl -fsSL https://tailscale.com/install.sh | sh`,
      riskLevel: "low",
      category: "install",
      source: SOURCE,
    },
    {
      title: "Kết nối Tailscale",
      commands: `sudo tailscale up${input.acceptRoutes ? " --accept-routes" : ""}${input.advertiseRoutes ? ` --advertise-routes=${input.advertiseRoutes}` : ""}`,
      riskLevel: "medium",
      category: "execute",
      source: SOURCE,
    },
    {
      title: "Kiểm tra",
      commands: `tailscale status\ntailscale ip`,
      riskLevel: "low",
      category: "check",
    },
  ];

  return wrapResult(commands, [
    { title: "Tailscale", content: "VPN mesh - truy cập server an toàn không cần mở port public." },
  ], ["Cần tài khoản Tailscale và đăng nhập qua link khi chạy tailscale up."], "tailscale");
}
