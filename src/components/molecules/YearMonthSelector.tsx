import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import { cn } from "@/lib/utils";

interface YearMonthSelectorProps {
  year: number;
  month: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  /** 選択可能な最小年（デフォルト: 1950） */
  minYear?: number;
  /** 選択可能な最大年（デフォルト: 今年） */
  maxYear?: number;
  className?: string;
  disabled?: boolean;
}

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

/**
 * 年・月を個別セレクトで選択する Molecule。
 * 学歴・職歴エントリの入学/卒業年月入力に使用する。
 */
export function YearMonthSelector({
  year,
  month,
  onYearChange,
  onMonthChange,
  minYear = 1950,
  maxYear = new Date().getFullYear(),
  className,
  disabled,
}: YearMonthSelectorProps) {
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i
  );

  return (
    <div className={cn("flex gap-2", className)}>
      <Select
        value={String(year)}
        onValueChange={(v) => onYearChange(Number(v))}
        disabled={disabled}
      >
        <SelectTrigger className="w-28" aria-label="年">
          <SelectValue placeholder="年" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}年
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(month)}
        onValueChange={(v) => onMonthChange(Number(v))}
        disabled={disabled}
      >
        <SelectTrigger className="w-20" aria-label="月">
          <SelectValue placeholder="月" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m) => (
            <SelectItem key={m} value={String(m)}>
              {m}月
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
