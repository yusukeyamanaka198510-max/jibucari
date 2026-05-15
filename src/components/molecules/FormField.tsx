import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/atoms/Label";

interface FormFieldProps {
  /** フォームコントロールと紐付けるID */
  id: string;
  label: string;
  required?: boolean;
  /** バリデーションエラーメッセージ */
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * ラベル + 入力欄 + エラーメッセージ を束ねる Molecule。
 * 各入力 Atom と組み合わせて一貫したフォームレイアウトを実現する。
 */
export function FormField({
  id,
  label,
  required,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
