"use client";

import { cn } from "@/lib/utils";

/**
 * owl.png (2816×1536) からCSSスプライトで各キャラを切り出して表示するコンポーネント。
 *
 * variant:
 *   guide       - 中央メインフクロウ（ベスト＋学帽・Career Guide）
 *   interviewer - 左上フクロウ（スーツ・クリップボードで面接中）
 *   workshop    - 右上フクロウ（黒板前でプレゼン中）
 *   freelancer  - 左下フクロウ（コンピュータ作業中）
 *   congrats    - 下中央フクロウ（HIRED! サッシュで祝福）
 *   vacation    - 右下フクロウ（ハワイアンシャツでバカンス）
 */

// 元画像のサイズ
const IMG_W = 2816;
const IMG_H = 1536;

// キャラ別のトリミング位置 [x, y, w, h] (px)
const CROPS: Record<string, [number, number, number, number]> = {
  guide:       [880,   40,  860, 1300],
  interviewer: [20,    20,  620,  760],
  workshop:    [1700,  10, 1100,  840],
  freelancer:  [20,   760,  660,  750],
  congrats:    [1100, 820,  560,  700],
  vacation:    [1720, 800, 1070,  720],
};

// 表示高さ (px) の既定値
const DEFAULT_H: Record<string, number> = {
  guide:       180,
  interviewer: 130,
  workshop:    120,
  freelancer:  110,
  congrats:    130,
  vacation:    120,
};

export type OwlVariant = keyof typeof CROPS;

interface OwlCharacterProps {
  variant: OwlVariant;
  /** 表示高さ（px）。省略時は variant ごとの既定値 */
  height?: number;
  className?: string;
}

export function OwlCharacter({ variant, height, className }: OwlCharacterProps) {
  const crop = CROPS[variant];
  if (!crop) return null;

  const [cx, cy, cw, ch] = crop;
  const displayH = height ?? DEFAULT_H[variant] ?? 140;
  const scale    = displayH / ch;
  const displayW = Math.round(cw * scale);
  const bgW      = Math.round(IMG_W * scale);
  const bgH      = Math.round(IMG_H * scale);
  const bgX      = Math.round(-cx * scale);
  const bgY      = Math.round(-cy * scale);

  return (
    <div
      aria-hidden="true"
      className={cn("shrink-0 select-none", className)}
      style={{
        width:              displayW,
        height:             displayH,
        backgroundImage:    "url('/images/owl.png')",
        backgroundSize:     `${bgW}px ${bgH}px`,
        backgroundPosition: `${bgX}px ${bgY}px`,
        backgroundRepeat:   "no-repeat",
      }}
    />
  );
}
