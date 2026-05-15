"use client";

import { useState, useEffect } from "react";
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

function parseValue(value: string) {
  if (!value) return { year: "", month: "", day: "" };
  const [y, m, d] = value.split("-");
  return {
    year: y ?? "",
    month: m ? String(parseInt(m, 10)) : "",
    day: d ? String(parseInt(d, 10)) : "",
  };
}

export function BirthDatePicker({ value, onChange }: BirthDatePickerProps) {
  const parsed = parseValue(value);
  const [year, setYear] = useState(parsed.year);
  const [month, setMonth] = useState(parsed.month);
  const [day, setDay] = useState(parsed.day);

  // 外部から value が変わった場合に同期
  useEffect(() => {
    const p = parseValue(value);
    setYear(p.year);
    setMonth(p.month);
    setDay(p.day);
  }, [value]);

  const numYear = parseInt(year, 10);
  const numMonth = parseInt(month, 10);
  const maxDay = numYear && numMonth ? daysInMonth(numYear, numMonth) : 31;
  const DAYS = Array.from({ length: maxDay }, (_, i) => i + 1);

  const emit = (y: string, m: string, d: string) => {
    if (y && m && d) {
      const mm = String(parseInt(m, 10)).padStart(2, "0");
      const dd = String(parseInt(d, 10)).padStart(2, "0");
      onChange(`${y}-${mm}-${dd}`);
    }
  };

  const handleYear = (v: string) => {
    setYear(v);
    emit(v, month, day);
  };
  const handleMonth = (v: string) => {
    setMonth(v);
    // 月変更で日が範囲外になる場合はリセット
    const maxD = daysInMonth(parseInt(year, 10) || 2000, parseInt(v, 10));
    const safeDay = parseInt(day, 10) > maxD ? "" : day;
    setDay(safeDay);
    emit(year, v, safeDay);
  };
  const handleDay = (v: string) => {
    setDay(v);
    emit(year, month, v);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select value={year} onValueChange={handleYear}>
        <SelectTrigger className="w-28">
          <SelectValue placeholder="年" />
        </SelectTrigger>
        <SelectContent>
          {YEARS.map((y) => (
            <SelectItem key={y} value={String(y)}>{y}年</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={month} onValueChange={handleMonth}>
        <SelectTrigger className="w-20">
          <SelectValue placeholder="月" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m) => (
            <SelectItem key={m} value={String(m)}>{m}月</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={day} onValueChange={handleDay}>
        <SelectTrigger className="w-20">
          <SelectValue placeholder="日" />
        </SelectTrigger>
        <SelectContent>
          {DAYS.map((d) => (
            <SelectItem key={d} value={String(d)}>{d}日</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
