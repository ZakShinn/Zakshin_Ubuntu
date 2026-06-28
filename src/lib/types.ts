export type RiskLevel = "low" | "medium" | "high";

export type CommandCategory =
  | "install"
  | "execute"
  | "check"
  | "save"
  | "rollback"
  | "explain"
  | "warning";

export interface GeneratedCommand {
  title: string;
  description?: string;
  commands: string;
  riskLevel: RiskLevel;
  rollback?: string;
  checks?: string;
  warnings?: string[];
  category: CommandCategory;
  source?: string;
}

export interface GeneratorResult {
  commands: GeneratedCommand[];
  explanations: { title: string; content: string }[];
  warnings: string[];
  scriptName: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  keywords: string[];
  source?: string;
}

export type ToolCategory =
  | "firewall"
  | "security"
  | "docker"
  | "web"
  | "database"
  | "system"
  | "network"
  | "backup";

export interface ServerProfile {
  id: string;
  name: string;
  description: string;
  tools: string[];
}

export interface HistoryEntry {
  id: string;
  name: string;
  toolId: string;
  inputs: Record<string, unknown>;
  timestamp: number;
}

export type Mode = "safe" | "advanced";

export interface FormFieldConfig {
  name: string;
  label: string;
  type:
    | "text"
    | "number"
    | "password"
    | "select"
    | "checkbox"
    | "textarea"
    | "multiline-ips"
    | "ports";
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string | boolean | number;
  helpText?: string;
  required?: boolean;
  advancedOnly?: boolean;
  validate?: "port" | "ip" | "domain" | "username" | "path" | "password";
}
