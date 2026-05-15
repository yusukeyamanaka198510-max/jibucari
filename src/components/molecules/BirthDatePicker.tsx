"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";

interface BirthDatePickerProps {
  value: string; // ISO: YYYY-MM-DD or ""
  onChange: (value: string) => void;
}

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1929 }, (_, i) => currentYear - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export function BirthDatePicker({ value, onChange }: BirthDatePickerProps) {
  const parts = value ? value.split("-") : ["", "", ""];
  const year = parts[0] ?? "";
  const month = parts[1] ? String(parseInt(parts[1], 10)) : "";
  const day = parts[2] ? String(parseInt(parts[2], 10)) : "";

  const numYear = parseInt(year, 10);
  const numMonth = parseInt(month, 10);
  const maxDay = numYear && numMonth ? daysInMonth(numYear, numMonth) : 31;
  const DAYS = Array.from({ length: maxDay }, (_, i) => i + 1);

  const emit = (y: string, m: string, d: string) => {
    if (!y || !m || !d) { onChange(""); return; }
    const mm = String(parseInt(m, 10)).padStart(2, "0");
    const dd = String(parseInt(d, 10)).padStart(2, "0");
    onChange(`${y}-${mm}-${dd}`);
  };

  return (
    <div className="flex items-center gap-2">
      {/* 年 */}
      <Select
        value={year}
        onValueChange={(v) => emit(v, month, day)}
      >
        <SelectTrigger className="w-28">
          <SelectValue placeholder="年" />
        </SelectTrigger>
        <SelectContent>
          {YEARS.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}年
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 月 */}
      <Select
        value={month}
        onValueChange={(v) => emit(year, v, day)}
      >
        <SelectTrigger className="w-20">
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

      {/* 日 */}
      <Select
        value={day}
        onValueChange={(v) => emit(year, month, v)}
      >
        <SelectTrigger className="w-20">
          <SelectValue placeholder="日" />
        </SelectTrigger>
        <SelectContent>
          {DAYS.map((d) => (
            <SelectItem key={d} value={String(d)}>
              {d}日
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
