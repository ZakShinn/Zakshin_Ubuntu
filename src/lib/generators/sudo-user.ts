import type { FormFieldConfig, GeneratorResult, Mode } from "../types";
import { wrapResult } from "./utils";

export interface SudoUserInput {
  username: string;
  addSudo: boolean;
  createSshKey: boolean;
  copyRootKey: boolean;
  disableRootSsh: boolean;
}

export const sudoUserFields: FormFieldConfig[] = [
  { name: "username", label: "Tên user", type: "text", placeholder: "hainghia", validate: "username", required: true },
  { name: "addSudo", label: "Thêm vào nhóm sudo", type: "checkbox", defaultValue: true },
  { name: "createSshKey", label: "Hướng dẫn tạo SSH key (trên máy local)", type: "checkbox", defaultValue: false },
  { name: "copyRootKey", label: "Copy SSH key từ root", type: "checkbox", defaultValue: true },
  { name: "disableRootSsh", label: "Khóa root SSH (sau khi test user mới)", type: "checkbox", defaultValue: false },
];

export function generateSudoUser(input: SudoUserInput, _mode: Mode): GeneratorResult {
  const user = input.username.trim();
  const warnings: string[] = [
    "Test login user mới trước khi khóa root.",
    "Không khóa root nếu chưa chắc user mới có quyền sudo và SSH key.",
  ];

  const commands: GeneratorResult["commands"] = [
    {
      title: `Tạo user ${user}`,
      commands: `sudo adduser ${user}`,
      riskLevel: "low",
      category: "execute",
    },
  ];

  if (input.addSudo) {
    commands.push({
      title: "Thêm quyền sudo",
      commands: `sudo usermod -aG sudo ${user}`,
      riskLevel: "low",
      category: "execute",
    });
  }

  if (input.copyRootKey) {
    commands.push({
      title: "Copy SSH key từ root",
      commands: `sudo mkdir -p /home/${user}/.ssh\nsudo cp /root/.ssh/authorized_keys /home/${user}/.ssh/\nsudo chown -R ${user}:${user} /home/${user}/.ssh\nsudo chmod 700 /home/${user}/.ssh\nsudo chmod 600 /home/${user}/.ssh/authorized_keys`,
      riskLevel: "low",
      category: "execute",
    });
  }

  if (input.createSshKey) {
    commands.push({
      title: "Tạo SSH key (chạy trên máy LOCAL)",
      commands: `ssh-keygen -t ed25519 -C "${user}@vps"\nssh-copy-id ${user}@your-server-ip`,
      riskLevel: "low",
      category: "execute",
    });
  }

  if (input.disableRootSsh) {
    commands.push({
      title: "Khóa root SSH",
      commands: `sudo sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config\nsudo systemctl restart ssh`,
      riskLevel: "high",
      rollback: `sudo sed -i 's/^PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config\nsudo systemctl restart ssh`,
      category: "execute",
      warnings: ["Chỉ chạy sau khi test user mới thành công!"],
    });
  }

  commands.push({
    title: "Kiểm tra user và sudo",
    commands: `id ${user}\nsudo -l -U ${user}`,
    riskLevel: "low",
    category: "check",
  });

  const explanations = [
    { title: "adduser", content: "Tạo user mới với home directory." },
    { title: "usermod -aG sudo", content: "Thêm user vào nhóm sudo để chạy lệnh quản trị." },
  ];

  return wrapResult(commands, explanations, warnings, "sudo-user");
}
