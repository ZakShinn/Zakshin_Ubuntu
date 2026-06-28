import { ToolPageClient } from "./ToolPageClient";
import { toolsById } from "@/lib/tools";

interface ToolPageProps {
  params: Promise<{ toolId: string }>;
}

export function generateStaticParams() {
  return Object.keys(toolsById).map((toolId) => ({ toolId }));
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { toolId } = await params;
  return <ToolPageClient toolId={toolId} />;
}
