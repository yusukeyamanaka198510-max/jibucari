"use client";

import { useState, useRef } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { useAgeCalculator } from "@/hooks/useAgeCalculator";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { BirthDatePicker } from "@/components/molecules/BirthDatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import { cn } from "@/lib/utils";
import { formatPostalCode, normalizePhone } from "@/lib/utils";
import { Loader2, MapPin } from "lucide-react";
import type { Gender } from "@/types";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "男性" },
  { value: "female", label: "女性" },
  { value: "other", label: "その他" },
  { value: "prefer_not_to_say", label: "回答しない" },
];

// ひらがな → カタカナ変換
const toKatakana = (str: string) =>
  str.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));

async function lookupPostalCode(digits: string): Promise<{ prefecture: string; city: string; kana: string } | null> {
  try {
    const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${digits}`);
    const json = await res.json();
    if (json.status !== 200 || !json.results) return null;
    const r = json.results[0];
    return {
      prefecture: r.address1 as string,
      city: `${r.address2}${r.address3}` as string,
      kana: `${r.kana1}${r.kana2}${r.kana3}` as string,
    };
  } catch {
    return null;
  }
}

export function PersonalInfoSection({ className }: { className?: string }) {
  const info = useResumeStore((s) => s.current?.personalInfo);
  const updatePersonalInfo = useResumeStore((s) => s.updatePersonalInfo);
  const { age } = useAgeCalculator(info?.birthDate ?? "");

  const [isLooking, setIsLooking] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  // 郵便番号から取得したフリガナ（都道府県＋市区町村まで）
  // 既存の addressKana から数字前のカナ部分を初期値として使う
  const [zipKana, setZipKana] = useState(
    () => info?.addressKana.match(/^[^\d]*/)?.[0] ?? ""
  );
  const isComposingBuildingRef = useRef(false);

  // IME composition でフリガナを自動取得
  const lastKanaRef = useRef("");

  if (!info) return null;

  const field = (key: keyof typeof info) =>
    (value: string) => updatePersonalInfo({ [key]: value });

  // IME入力中の「かな」だけを拾う（漢字変換後は無視）
  const isKanaOnly = (str: string) => /^[ぁ-ゖァ-ヶーｦ-ﾟ\s]+$/.test(str);

  const makeKanaHandlers = (kanaKey: "lastNameKana" | "firstNameKana") => ({
    onCompositionUpdate: (e: React.CompositionEvent<HTMLInputElement>) => {
      if (isKanaOnly(e.data)) lastKanaRef.current = toKatakana(e.data);
    },
    onCompositionEnd: () => {
      if (lastKanaRef.current) {
        // フリガナが空の場合のみ自動セット（上書き防止）
        const cur = info[kanaKey];
        if (!cur) updatePersonalInfo({ [kanaKey]: lastKanaRef.current });
        lastKanaRef.current = "";
      }
    },
  });

  const handlePostalCode = async (raw: string) => {
    const formatted = formatPostalCode(raw);
    updatePersonalInfo({ postalCode: formatted });
    setLookupError(null);
    setLookupDone(false);
    const digits = raw.replace(/-/g, "");
    if (digits.length === 7) {
      setIsLooking(true);
      const result = await lookupPostalCode(digits);
      setIsLooking(false);
      if (result) {
        setZipKana(result.kana);
        updatePersonalInfo({ prefecture: result.prefecture, city: result.city, addressKana: result.kana });
        setLookupDone(true);
      } else {
        setLookupError("住所が見つかりませんでした");
      }
    }
  };

  return (
    <section className={cn("space-y-6", className)} aria-labelledby="personal-info-heading">
      <h2 id="personal-info-heading" className="text-lg font-semibold border-b pb-2">基本情報</h2>

      {/* 氏名 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField id="lastName" label="姓" required>
          <Input
            id="lastName"
            value={info.lastName}
            onChange={(e) => field("lastName")(e.target.value)}
            placeholder="山田"
            autoComplete="family-name"
            {...makeKanaHandlers("lastNameKana")}
          />
        </FormField>
        <FormField id="firstName" label="名" required>
          <Input
            id="firstName"
            value={info.firstName}
            onChange={(e) => field("firstName")(e.target.value)}
            placeholder="太郎"
            autoComplete="given-name"
            {...makeKanaHandlers("firstNameKana")}
          />
        </FormField>
        <FormField id="lastNameKana" label="姓（フリガナ）" required hint="漢字入力で自動入力されます">
          <Input
            id="lastNameKana"
            value={info.lastNameKana}
            onChange={(e) => field("lastNameKana")(e.target.value)}
            placeholder="ヤマダ"
          />
        </FormField>
        <FormField id="firstNameKana" label="名（フリガナ）" required hint="漢字入力で自動入力されます">
          <Input
            id="firstNameKana"
            value={info.firstNameKana}
            onChange={(e) => field("firstNameKana")(e.target.value)}
            placeholder="タロウ"
          />
        </FormField>
      </div>

      {/* 生年月日・性別 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField id="birthDate" label="生年月日" required hint={info.birthDate ? `満 ${age} 歳` : undefined}>
          <BirthDatePicker
            value={info.birthDate}
            onChange={(v) => updatePersonalInfo({ birthDate: v })}
          />
        </FormField>
        <FormField id="gender" label="性別">
          <Select value={info.gender} onValueChange={(v) => updatePersonalInfo({ gender: v as Gender })}>
            <SelectTrigger id="gender"><SelectValue placeholder="選択してください" /></SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      {/* 住所 */}
      <div className="space-y-4">
        <FormField id="postalCode" label="郵便番号" required>
          <div className="flex items-center gap-3 flex-wrap">
            <Input
              id="postalCode"
              value={info.postalCode}
              onChange={(e) => handlePostalCode(e.target.value)}
              placeholder="123-4567"
              maxLength={8}
              autoComplete="postal-code"
              className="max-w-36"
            />
            {isLooking && (
              <span className="flex items-center gap-1.5 text-xs text-indigo-500 font-medium">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />住所を検索中...
              </span>
            )}
            {lookupDone && !isLooking && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <MapPin className="h-3.5 w-3.5" />住所を自動入力しました
              </span>
            )}
            {lookupError && <span className="text-xs text-red-500">{lookupError}</span>}
          </div>
          <p className="text-xs text-slate-400 mt-1">半角数字7桁を入力すると都道府県・市区町村を自動入力</p>
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField id="prefecture" label="都道府県" required>
            <Input id="prefecture" value={info.prefecture} onChange={(e) => field("prefecture")(e.target.value)} placeholder="東京都" />
          </FormField>
          <FormField id="city" label="市区町村" required>
            <Input id="city" value={info.city} onChange={(e) => field("city")(e.target.value)} placeholder="渋谷区〇〇" />
          </FormField>
        </div>

        <FormField id="streetAddress" label="番地" required>
          <Input
            id="streetAddress"
            value={info.streetAddress}
            onChange={(e) => {
              const val = e.target.value;
              // zipKana + 新しい番地で住所フリガナを再構築（上書き）
              updatePersonalInfo({ streetAddress: val, addressKana: zipKana + val });
            }}
            placeholder="1-2-3"
          />
        </FormField>

        <FormField id="building" label="建物名・部屋番号">
          <Input
            id="building"
            value={info.building}
            onChange={(e) => updatePersonalInfo({ building: e.target.value })}
            placeholder="〇〇マンション 101号室"
            onCompositionStart={() => { isComposingBuildingRef.current = true; }}
            onCompositionUpdate={(e) => { lastKanaRef.current = toKatakana(e.data); }}
            onCompositionEnd={() => {
              isComposingBuildingRef.current = false;
              if (lastKanaRef.current) {
                updatePersonalInfo({ addressKana: (info.addressKana + " " + lastKanaRef.current).trim() });
                lastKanaRef.current = "";
              }
            }}
          />
          <p className="text-xs text-slate-400 mt-1">建物名・部屋番号のフリガナは下の欄に直接追記できます</p>
        </FormField>

        <FormField id="addressKana" label="住所（フリガナ）">
          <Input id="addressKana" value={info.addressKana} onChange={(e) => field("addressKana")(e.target.value)} placeholder="トウキョウトシブヤク〇〇" />
        </FormField>
      </div>

      {/* 連絡先 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField id="mobilePhone" label="携帯電話番号">
          <Input
            id="mobilePhone"
            type="tel"
            value={info.mobilePhone}
            onChange={(e) => updatePersonalInfo({ mobilePhone: normalizePhone(e.target.value) })}
            placeholder="090-1234-5678"
            autoComplete="tel"
          />
        </FormField>
        <FormField id="email" label="メールアドレス" required>
          <Input
            id="email"
            type="email"
            value={info.email}
            onChange={(e) => field("email")(e.target.value)}
            placeholder="taro.yamada@example.com"
            autoComplete="email"
          />
        </FormField>
      </div>
    </section>
  );
}
