import type { FormFieldConfig, GeneratorResult, Mode } from "../types";
import { wrapResult } from "./utils";

export const wireguardFields: FormFieldConfig[] = [
  { name: "wgInterface", label: "Interface name", type: "text", defaultValue: "wg0" },
  { name: "serverIP", label: "Server VPN IP (CIDR)", type: "text", defaultValue: "10.8.0.1/24", required: true },
  { name: "listenPort", label: "Listen port", type: "number", defaultValue: "51820", validate: "port" },
  { name: "clientIP", label: "Client VPN IP", type: "text", defaultValue: "10.8.0.2/32" },
];

const SOURCE = "https://www.wireguard.com/quickstart/";

export function generateWireguard(
  input: { wgInterface?: string; serverIP?: string; listenPort?: string; clientIP?: string },
  _mode: Mode
): GeneratorResult {
  const iface = input.wgInterface || "wg0";

  const commands: GeneratorResult["commands"] = [
    {
      title: "Cài WireGuard",
      commands: `sudo apt update\nsudo apt install -y wireguard`,
      riskLevel: "low",
      category: "install",
      source: SOURCE,
    },
    {
      title: "Tạo key server",
      commands: `wg genkey | sudo tee /etc/wireguard/server_private.key | wg pubkey | sudo tee /etc/wireguard/server_public.key\nsudo chmod 600 /etc/wireguard/server_private.key`,
      riskLevel: "low",
      category: "execute",
    },
    {
      title: "Tạo key client",
      commands: `wg genkey | tee client_private.key | wg pubkey > client_public.key`,
      riskLevel: "low",
      category: "execute",
    },
    {
      title: `Config ${iface} (mẫu)`,
      description: "Chỉnh /etc/wireguard/wg0.conf - thay PRIVATE_KEY và CLIENT_PUBLIC_KEY",
      commands: `[Interface]
Address = ${input.serverIP || "10.8.0.1/24"}
ListenPort = ${input.listenPort || "51820"}
PrivateKey = <SERVER_PRIVATE_KEY>

[Peer]
PublicKey = <CLIENT_PUBLIC_KEY>
AllowedIPs = ${input.clientIP || "10.8.0.2/32"}`,
      riskLevel: "medium",
      category: "execute",
      source: SOURCE,
    },
    {
      title: "Bật WireGuard",
      commands: `sudo systemctl enable wg-quick@${iface}\nsudo systemctl start wg-quick@${iface}\nsudo wg show`,
      riskLevel: "medium",
      category: "execute",
    },
    {
      title: "Mở firewall port UDP",
      commands: `sudo ufw allow ${input.listenPort || "51820"}/udp`,
      riskLevel: "low",
      category: "execute",
    },
  ];

  return wrapResult(commands, [
    { title: "WireGuard", content: "VPN nhanh, hiện đại. Cần config client riêng." },
  ], ["Lưu private key an toàn. Mở port UDP trên firewall."], "wireguard");
}
