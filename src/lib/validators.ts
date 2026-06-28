export function validatePort(port: string | number): string | null {
  const n = typeof port === "string" ? parseInt(port, 10) : port;
  if (isNaN(n) || n < 1 || n > 65535) {
    return "Port phải từ 1 đến 65535";
  }
  return null;
}

export function validatePorts(ports: string): string | null {
  if (!ports.trim()) return null;
  const parts = ports.split(/[,\s]+/).filter(Boolean);
  for (const p of parts) {
    const err = validatePort(p);
    if (err) return `Port "${p}": ${err}`;
  }
  return null;
}

const IPV4_REGEX =
  /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
const CIDR_REGEX =
  /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$/;
const IPV6_REGEX =
  /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,7}:$|^(?:[0-9a-fA-F]{1,4}:){0,6}::(?:[0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}$/;

export function validateIP(ip: string): string | null {
  const trimmed = ip.trim();
  if (trimmed === "all" || trimmed === "any") return null;
  if (IPV4_REGEX.test(trimmed) || CIDR_REGEX.test(trimmed) || IPV6_REGEX.test(trimmed)) {
    return null;
  }
  return "IP không hợp lệ (IPv4, IPv6 hoặc CIDR)";
}

export function validateIPs(ips: string): string | null {
  if (!ips.trim()) return null;
  const parts = ips.split(/[,\s\n]+/).filter(Boolean);
  for (const ip of parts) {
    const err = validateIP(ip);
    if (err) return err;
  }
  return null;
}

const DOMAIN_REGEX =
  /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

export function validateDomain(domain: string): string | null {
  if (!domain.trim()) return "Domain không được để trống";
  if (!DOMAIN_REGEX.test(domain.trim())) {
    return "Domain không hợp lệ";
  }
  return null;
}

const USERNAME_REGEX = /^[a-z_][a-z0-9_-]{0,31}$/;

export function validateUsername(username: string): string | null {
  if (!username.trim()) return "Username không được để trống";
  if (!USERNAME_REGEX.test(username.trim())) {
    return "Username chỉ chứa chữ thường, số, _ và -";
  }
  if (/[;&|`$(){}[\]<>]/.test(username)) {
    return "Username chứa ký tự nguy hiểm";
  }
  return null;
}

export function validatePath(path: string): string | null {
  if (!path.trim()) return "Đường dẫn không được để trống";
  if (!path.startsWith("/")) return "Đường dẫn phải bắt đầu bằng /";
  if (/[;&|`$]/.test(path)) return "Đường dẫn chứa ký tự nguy hiểm";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return null;
  if (password.length < 8) return "Mật khẩu nên có ít nhất 8 ký tự";
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Mật khẩu yếu: nên có chữ hoa, chữ thường và số";
  }
  return null;
}

export function sanitizeInput(value: string): string {
  return value.replace(/[;&|`$]/g, "");
}

export function parsePorts(ports: string): number[] {
  return ports
    .split(/[,\s]+/)
    .filter(Boolean)
    .map((p) => parseInt(p, 10))
    .filter((p) => !isNaN(p) && p >= 1 && p <= 65535);
}

export function parseIPs(ips: string): string[] {
  return ips
    .split(/[,\s\n]+/)
    .map((ip) => ip.trim())
    .filter(Boolean);
}

export function getFieldError(
  type: string | undefined,
  value: string
): string | null {
  if (!type || !value) return null;
  switch (type) {
    case "port":
      return validatePorts(value);
    case "ip":
      return validateIPs(value);
    case "domain":
      return validateDomain(value);
    case "username":
      return validateUsername(value);
    case "path":
      return validatePath(value);
    case "password":
      return validatePassword(value);
    default:
      return null;
  }
}
