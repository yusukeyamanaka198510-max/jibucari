import type { LucideIcon } from "lucide-react";
import { CheckCircle, AlertCircle, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const CONFIG: Record<SaveStatus, { icon: LucideIcon; label: string; cls: string }> = {
  idle:   { icon: Clock,       label: "未保存",    cls: "text-slate-400" },
  saving: { icon: Loader2,     label: "保存中...", cls: "text-slate-400" },
  saved:  { icon: CheckCircle, label: "保存済み",  cls: "text-green-600" },
  error:  { icon: AlertCircle, label: "保存失敗",  cls: "text-red-500" },
};

export function SaveIndicator({
  status,
  className,
}: {
  status: SaveStatus;
  className?: string;
}) {
  const { icon: Icon, label, cls } = CONFIG[status];
  return (
    <div className={cn("flex items-center gap-1.5 text-xs", className)}>
      <Icon className={cn("h-3.5 w-3.5", cls, status === "saving" && "animate-spin")} />
      <span className={cls}>{label}</span>
    </div>
  );
}
