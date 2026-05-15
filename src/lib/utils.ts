import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind クラスをマージするユーティリティ（Shadcn/UI標準パターン） */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** YYYY年M月 形式にフォーマット */
export function formatYearMonth(year: number, month: number): string {
  return `${year}年${month}月`;
}

/** 郵便番号をハイフン付きに整形 (1234567 → 123-4567) */
export function formatPostalCode(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 7);
  return digits.length > 3 ? `${digits.slice(0, 3)}-${digits.slice(3)}` : digits;
}

/** 電話番号を入力しやすいよう正規化（数字とハイフンのみ許可） */
export function normalizePhone(value: string): string {
  return value.replace(/[^\d-]/g, "");
}
