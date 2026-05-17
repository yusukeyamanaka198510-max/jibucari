"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, LogOut, FileText, ChevronRight, Save, Pencil, X, Check,
  Phone, Mail, MapPin, Calendar, BadgeCheck, Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { BirthDatePicker } from "@/components/molecules/BirthDatePicker";
import type { UserProfileData } from "@/infrastructure/supabase/profileRepository";

// ひらがな → カタカナ変換
const toKatakana = (str: string) =>
  str.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));

async function lookupPostalCode(digits: string): Promise<{ prefecture: string; city: string } | null> {
  try {
    const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${digits}`);
    const json = await res.json();
    if (json.status !== 200 || !json.results) return null;
    const r = json.results[0];
    return { prefecture: r.address1 as string, city: `${r.address2}${r.address3}` as string };
  } catch {
    return null;
  }
}

const GENDER_LABELS: Record<string, string> = {
  male: "男性", female: "女性", other: "その他 / 回答しない",
};

const PREFECTURES = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県",
  "静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県",
  "奈良県","和歌山県","鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県","福岡県","佐賀県","長崎県",
  "熊本県","大分県","宮崎県","鹿児島県","沖縄県",
];

type ProfileForm = Omit<UserProfileData, "id">;

const EMPTY_FORM: ProfileForm = {
  lastName: "", firstName: "", lastNameKana: "", firstNameKana: "",
  birthDate: "", gender: "", postalCode: "", prefecture: "",
  city: "", addressDetail: "", phone: "", email: "",
};

interface MypageClientProps {
  userId: string;
  userEmail: string;
  initialProfile: UserProfileData | null;
}

export function MypageClient({ userId, userEmail, initialProfile }: MypageClientProps) {
  const router = useRouter();
  const { signOut, isLoading: isSigningOut } = useAuthStore();
  const { saveProfile, isSaving } = useProfileStore();

  const [isEditing, setIsEditing] = useState(!initialProfile);
  const [profile, setProfile] = useState<ProfileForm>(
    initialProfile ? { ...initialProfile } : { ...EMPTY_FORM, email: userEmail }
  );
  const [saved, setSaved] = useState(!!initialProfile);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLooking, setIsLooking] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const lastKanaRef = useRef("");

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleChange = (key: keyof ProfileForm, value: string) => {
    setProfile((p) => ({ ...p, [key]: value }));
  };

  const handlePostalCode = async (raw: string) => {
    const digits = raw.replace(/-/g, "");
    const formatted = digits.length > 3 ? `${digits.slice(0, 3)}-${digits.slice(3, 7)}` : digits;
    setProfile((p) => ({ ...p, postalCode: formatted }));
    setLookupError(null);
    setLookupDone(false);
    if (digits.length === 7) {
      setIsLooking(true);
      const result = await lookupPostalCode(digits);
      setIsLooking(false);
      if (result) {
        setProfile((p) => ({ ...p, prefecture: result.prefecture, city: result.city }));
        setLookupDone(true);
      } else {
        setLookupError("住所が見つかりませんでした");
      }
    }
  };

  const makeKanaHandlers = (kanaKey: "lastNameKana" | "firstNameKana") => {
    const isKanaOnly = (str: string) => /^[ぁ-ゖァ-ヶーｦ-ﾟ\s]+$/.test(str);
    return {
      onCompositionUpdate: (e: React.CompositionEvent<HTMLInputElement>) => {
        if (isKanaOnly(e.data)) lastKanaRef.current = toKatakana(e.data);
      },
      onCompositionEnd: () => {
        if (lastKanaRef.current) {
          setProfile((p) => ({ ...p, [kanaKey]: p[kanaKey] || lastKanaRef.current }));
          lastKanaRef.current = "";
        }
      },
    };
  };

  const handleSave = async () => {
    try {
      await saveProfile(userId, profile);
      setSaved(true);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      alert("保存に失敗しました。もう一度お試しください。");
    }
  };

  const hasAnyData = saved && Object.values(profile).some((v) => v !== "");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-black text-xl bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            ジブキャリ
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-slate-400">{userEmail}</span>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">ログアウト</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* ページタイトル */}
        <div>
          <h1 className="text-2xl font-black text-slate-900">マイページ</h1>
          <p className="text-sm text-slate-500 mt-1">登録情報を確認・編集できます</p>
        </div>

        {/* 保存完了バナー */}
        {saveSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm font-medium">
            <Check className="h-4 w-4 flex-shrink-0" />
            プロフィールを保存しました。各書類作成ページで自動入力できます。
          </div>
        )}

        {/* プロフィールカード */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-500" />
              <h2 className="font-bold text-slate-900">基本プロフィール</h2>
              {saved && (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                  <BadgeCheck className="h-3 w-3" /> 登録済み
                </span>
              )}
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                <Pencil className="h-4 w-4" /> 編集
              </button>
            )}
          </div>

          <div className="p-6 space-y-6">
            {/* 氏名 */}
            <Section label="氏名">
              {isEditing ? (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="姓" value={profile.lastName} onChange={(v) => handleChange("lastName", v)} placeholder="山田" extraProps={makeKanaHandlers("lastNameKana")} />
                  <Field label="名" value={profile.firstName} onChange={(v) => handleChange("firstName", v)} placeholder="太郎" extraProps={makeKanaHandlers("firstNameKana")} />
                  <Field label="せい（カナ）" value={profile.lastNameKana} onChange={(v) => handleChange("lastNameKana", v)} placeholder="ヤマダ" hint="漢字入力で自動入力" />
                  <Field label="めい（カナ）" value={profile.firstNameKana} onChange={(v) => handleChange("firstNameKana", v)} placeholder="タロウ" hint="漢字入力で自動入力" />
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">{profile.lastName} {profile.firstName}</p>
                  <p className="text-sm text-slate-400">{profile.lastNameKana} {profile.firstNameKana}</p>
                </div>
              )}
            </Section>

            {/* 生年月日・性別 */}
            <Section label="生年月日 / 性別">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">生年月日</label>
                    <BirthDatePicker value={profile.birthDate} onChange={(v) => handleChange("birthDate", v)} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">性別</label>
                    <select
                      value={profile.gender}
                      onChange={(e) => handleChange("gender", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      <option value="">選択してください</option>
                      <option value="male">男性</option>
                      <option value="female">女性</option>
                      <option value="other">その他 / 回答しない</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 text-sm text-slate-700">
                  <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-slate-300" />{profile.birthDate || "—"}</span>
                  <span>{GENDER_LABELS[profile.gender] || "—"}</span>
                </div>
              )}
            </Section>

            {/* 住所 */}
            <Section label="住所">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">郵便番号</label>
                    <div className="flex items-center gap-3 flex-wrap">
                      <input
                        value={profile.postalCode}
                        onChange={(e) => handlePostalCode(e.target.value)}
                        placeholder="123-4567"
                        maxLength={8}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-slate-300"
                      />
                      {isLooking && <span className="flex items-center gap-1 text-xs text-indigo-500"><Loader2 className="h-3.5 w-3.5 animate-spin" />検索中...</span>}
                      {lookupDone && !isLooking && <span className="flex items-center gap-1 text-xs text-emerald-600"><MapPin className="h-3.5 w-3.5" />自動入力しました</span>}
                      {lookupError && <span className="text-xs text-red-500">{lookupError}</span>}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">7桁入力で都道府県・市区町村を自動入力</p>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">都道府県</label>
                    <select
                      value={profile.prefecture}
                      onChange={(e) => handleChange("prefecture", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      <option value="">選択してください</option>
                      {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <Field label="市区町村" value={profile.city} onChange={(v) => handleChange("city", v)} placeholder="渋谷区" />
                  <Field label="番地・建物名" value={profile.addressDetail} onChange={(v) => handleChange("addressDetail", v)} placeholder="1-1-1 ○○マンション101号室" />
                </div>
              ) : (
                <p className="flex items-start gap-1.5 text-sm text-slate-700">
                  <MapPin className="h-4 w-4 text-slate-300 mt-0.5 flex-shrink-0" />
                  <span>
                    {profile.postalCode && `〒${profile.postalCode} `}
                    {profile.prefecture}{profile.city}{profile.addressDetail || "—"}
                  </span>
                </p>
              )}
            </Section>

            {/* 連絡先 */}
            <Section label="連絡先">
              {isEditing ? (
                <div className="space-y-3">
                  <Field label="電話番号" value={profile.phone} onChange={(v) => handleChange("phone", v)} placeholder="090-1234-5678" />
                  <Field label="メールアドレス" value={profile.email} onChange={(v) => handleChange("email", v)} placeholder="you@example.com" />
                </div>
              ) : (
                <div className="space-y-1 text-sm text-slate-700">
                  <p className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-slate-300" />{profile.phone || "—"}</p>
                  <p className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-slate-300" />{profile.email || "—"}</p>
                </div>
              )}
            </Section>

            {/* 保存ボタン */}
            {isEditing && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "保存中..." : "保存する"}
                </button>
                {saved && (
                  <button
                    onClick={() => {
                      setProfile(initialProfile ? { ...initialProfile } : { ...EMPTY_FORM });
                      setIsEditing(false);
                    }}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-semibold px-4 py-2.5 rounded-xl border border-slate-200 transition-colors"
                  >
                    <X className="h-4 w-4" /> キャンセル
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 書類管理リンク */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-violet-500" /> 書類管理
            </h2>
          </div>
          <div className="divide-y divide-slate-50">
            {[
              { href: "/resume/new", label: "履歴書を作成", color: "text-indigo-600" },
              { href: "/cv/new", label: "職務経歴書を作成", color: "text-violet-600" },
              { href: "/cover-letter/new", label: "送付状・退職届を作成", color: "text-sky-600" },
              { href: "/skill-sheet/new", label: "スキルシートを作成", color: "text-emerald-600" },
              { href: "/dashboard", label: "作成した書類一覧", color: "text-slate-700" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <span className={`text-sm font-semibold ${item.color}`}>{item.label}</span>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </Link>
            ))}
          </div>
        </div>

        {/* スカウト告知 */}
        {hasAnyData && (
          <div className="relative overflow-hidden rounded-2xl p-6 text-white"
            style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" }}>
            <div className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <p className="text-lg font-black mb-1">🎯 スカウトの準備ができています</p>
            <p className="text-indigo-200 text-sm">
              登録情報をジブキャリのスタッフが確認し、あなたのキャリアに合った求人をご提案する場合があります。
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

/* ── 再利用コンポーネント ── */
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      {children}
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text", hint, extraProps,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
  extraProps?: Record<string, unknown>;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-slate-300"
        {...(extraProps as React.InputHTMLAttributes<HTMLInputElement>)}
      />
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}
