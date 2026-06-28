"use client";

import { notFound } from "next/navigation";
import { ToolLayout } from "@/components/ToolLayout";
import { toolsById } from "@/lib/tools";

interface ToolPageClientProps {
  toolId: string;
}

export function ToolPageClient({ toolId }: ToolPageClientProps) {
  const tool = toolsById[toolId];
  if (!tool) notFound();
  return <ToolLayout tool={tool} />;
}
