import { CheckCircle, AlertCircle, Loader2, Clock } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  idle: { icon: Clock, label: "未保存", className: "text-muted-foreground" },
  saving: { icon: Loader2, label: "保存中...", className: "text-muted-foreground animate-spin" },
  saved: { icon: CheckCircle, label: "保存済み", className: "text-green-600" },
  error: { icon: AlertCircle, label: "保存失敗", className: "text-destructive" },
} as const;

/**
 * 自動保存のステータスをアイコンとテキストで表示する Molecule。
 */
export function AutoSaveIndicator({ className }: { className?: string }) {
  const status = useResumeStore((s) => s.autoSaveStatus);
  const { icon: Icon, label, className: statusClass } = STATUS_CONFIG[status];

  return (
    <div className={cn("flex items-center gap-1.5 text-xs", statusClass, className)}>
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </div>
  );
}
