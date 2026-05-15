"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { useAgeCalculator } from "@/hooks/useAgeCalculator";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
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

async function lookupPostalCode(code: string): Promise<{ address: string; kana: string } | null> {
  const digits = code.replace(/-/g, "");
  if (digits.length !== 7) return null;
  try {
    const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${digits}`);
    const json = await res.json();
    if (json.status !== 200 || !json.results) return null;
    const r = json.results[0];
    return {
      address: `${r.address1}${r.address2}${r.address3}`,
      kana: `${r.kana1}${r.kana2}${r.kana3}`,
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
  const [lookupError, setLookupError] = useState<string | null>(null);

  if (!info) return null;

  const field = (key: keyof typeof info) =>
    (value: string) => updatePersonalInfo({ [key]: value });

  const handlePostalCode = async (raw: string) => {
    const formatted = formatPostalCode(raw);
    updatePersonalInfo({ postalCode: formatted });
    setLookupError(null);

    const digits = raw.replace(/-/g, "");
    if (digits.length === 7) {
      setIsLooking(true);
      const result = await lookupPostalCode(digits);
      setIsLooking(false);
      if (result) {
        updatePersonalInfo({ address: result.address, addressKana: result.kana });
      } else {
        setLookupError("住所が見つかりませんでした");
      }
    }
  };

  return (
    <section className={cn("space-y-6", className)} aria-labelledby="personal-info-heading">
      <h2 id="personal-info-heading" className="text-lg font-semibold border-b pb-2">
        基本情報
      </h2>

      {/* 氏名 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField id="lastName" label="姓" required>
          <Input
            id="lastName"
            value={info.lastName}
            onChange={(e) => field("lastName")(e.target.value)}
            placeholder="山田"
            autoComplete="family-name"
          />
        </FormField>
        <FormField id="firstName" label="名" required>
          <Input
            id="firstName"
            value={info.firstName}
            onChange={(e) => field("firstName")(e.target.value)}
            placeholder="太郎"
            autoComplete="given-name"
          />
        </FormField>
        <FormField id="lastNameKana" label="姓（フリガナ）" required>
          <Input
            id="lastNameKana"
            value={info.lastNameKana}
            onChange={(e) => field("lastNameKana")(e.target.value)}
            placeholder="ヤマダ"
          />
        </FormField>
        <FormField id="firstNameKana" label="名（フリガナ）" required>
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
        <FormField
          id="birthDate"
          label="生年月日"
          required
          hint={info.birthDate ? `満 ${age} 歳` : undefined}
        >
          <Input
            id="birthDate"
            type="date"
            value={info.birthDate}
            onChange={(e) => field("birthDate")(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
          />
        </FormField>

        <FormField id="gender" label="性別">
          <Select
            value={info.gender}
            onValueChange={(v) => updatePersonalInfo({ gender: v as Gender })}
          >
            <SelectTrigger id="gender">
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      {/* 住所 */}
      <div className="space-y-4">
        <FormField id="postalCode" label="郵便番号" required>
          <div className="flex items-center gap-2">
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
              <span className="flex items-center gap-1 text-xs text-indigo-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                検索中...
              </span>
            )}
            {!isLooking && info.address && !lookupError && (
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <MapPin className="h-3.5 w-3.5" />
                住所を自動入力しました
              </span>
            )}
            {lookupError && (
              <span className="text-xs text-red-500">{lookupError}</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">7桁入力で住所を自動入力</p>
        </FormField>

        <FormField id="address" label="住所" required>
          <Input
            id="address"
            value={info.address}
            onChange={(e) => field("address")(e.target.value)}
            placeholder="東京都渋谷区〇〇 1-2-3"
            autoComplete="street-address"
          />
        </FormField>

        <FormField id="addressKana" label="住所（フリガナ）">
          <Input
            id="addressKana"
            value={info.addressKana}
            onChange={(e) => field("addressKana")(e.target.value)}
            placeholder="トウキョウトシブヤク〇〇 1-2-3"
          />
        </FormField>
      </div>

      {/* 連絡先 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField id="phone" label="電話番号">
          <Input
            id="phone"
            type="tel"
            value={info.phone}
            onChange={(e) =>
              updatePersonalInfo({ phone: normalizePhone(e.target.value) })
            }
            placeholder="03-1234-5678"
            autoComplete="tel"
          />
        </FormField>

        <FormField id="mobilePhone" label="携帯電話番号">
          <Input
            id="mobilePhone"
            type="tel"
            value={info.mobilePhone}
            onChange={(e) =>
              updatePersonalInfo({ mobilePhone: normalizePhone(e.target.value) })
            }
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
            className="col-span-full"
          />
        </FormField>
      </div>
    </section>
  );
}
