"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, LogOut, FileText, ChevronRight, Save, Pencil, X, Check,
  Phone, Mail, MapPin, Calendar, BadgeCheck, Loader2, GraduationCap,
  BriefcaseBusiness, PlusCircle, Trash2,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { BirthDatePicker } from "@/components/molecules/BirthDatePicker";
import type { UserProfileData } from "@/infrastructure/supabase/profileRepository";
import type { EducationEntry, EducationEntryType, EducationExitType, WorkEntry } from "@/types";

// カタカナ → ひらがな変換
const toHiragana = (str: string) =>
  str.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

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

const YEARS = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

type ProfileForm = Omit<UserProfileData, "id"> & {
  education: EducationEntry[];
  workHistory: WorkEntry[];
};

const EMPTY_FORM: ProfileForm = {
  lastName: "", firstName: "", lastNameKana: "", firstNameKana: "",
  birthDate: "", gender: "", postalCode: "", prefecture: "",
  city: "", streetAddress: "", building: "", phone: "", email: "",
  education: [],
  workHistory: [],
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
    initialProfile
      ? { ...initialProfile, education: initialProfile.education ?? [], workHistory: initialProfile.workHistory ?? [] }
      : { ...EMPTY_FORM, email: userEmail }
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

  const handleChange = (key: keyof Omit<ProfileForm, "education" | "workHistory">, value: string) => {
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
        if (isKanaOnly(e.data)) lastKanaRef.current = toHiragana(e.data);
      },
      onCompositionEnd: () => {
        if (lastKanaRef.current) {
          setProfile((p) => ({ ...p, [kanaKey]: p[kanaKey] || lastKanaRef.current }));
          lastKanaRef.current = "";
        }
      },
    };
  };

  // ─── 学歴 操作 ────────────────────────────────────────────────────────────
  const addEducation = () => {
    const now = new Date();
    const entry: EducationEntry = {
      id: uuidv4(),
      school: "",
      entryYear: now.getFullYear(),
      entryMonth: 4,
      entryType: "enrolled",
    };
    setProfile((p) => ({ ...p, education: [...p.education, entry] }));
  };

  const updateEducation = (id: string, patch: Partial<EducationEntry>) => {
    setProfile((p) => ({
      ...p,
      education: p.education.map((e) => e.id === id ? { ...e, ...patch } : e),
    }));
  };

  const removeEducation = (id: string) => {
    setProfile((p) => ({ ...p, education: p.education.filter((e) => e.id !== id) }));
  };

  // ─── 職歴 操作 ────────────────────────────────────────────────────────────
  const addWork = () => {
    const now = new Date();
    const entry: WorkEntry = {
      id: uuidv4(),
      company: "",
      entryYear: now.getFullYear(),
      entryMonth: 4,
      isCurrent: false,
    };
    setProfile((p) => ({ ...p, workHistory: [...p.workHistory, entry] }));
  };

  const updateWork = (id: string, patch: Partial<WorkEntry>) => {
    setProfile((p) => ({
      ...p,
      workHistory: p.workHistory.map((e) => e.id === id ? { ...e, ...patch } : e),
    }));
  };

  const removeWork = (id: string) => {
    setProfile((p) => ({ ...p, workHistory: p.workHistory.filter((e) => e.id !== id) }));
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

  const hasAnyData = saved && Object.values(profile).some((v) =>
    Array.isArray(v) ? v.length > 0 : v !== ""
  );

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
                  <Field label="せい（ふりがな）" value={profile.lastNameKana} onChange={(v) => handleChange("lastNameKana", v)} placeholder="やまだ" hint="漢字入力で自動入力" />
                  <Field label="めい（ふりがな）" value={profile.firstNameKana} onChange={(v) => handleChange("firstNameKana", v)} placeholder="たろう" hint="漢字入力で自動入力" />
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
                  <Field label="番地" value={profile.streetAddress} onChange={(v) => handleChange("streetAddress", v)} placeholder="1-2-3" />
                  <Field label="建物名・部屋番号" value={profile.building} onChange={(v) => handleChange("building", v)} placeholder="○○マンション101号室" />
                </div>
              ) : (
                <p className="flex items-start gap-1.5 text-sm text-slate-700">
                  <MapPin className="h-4 w-4 text-slate-300 mt-0.5 flex-shrink-0" />
                  <span>
                    {profile.postalCode && `〒${profile.postalCode} `}
                    {profile.prefecture}{profile.city}{profile.streetAddress}{profile.building ? ` ${profile.building}` : (!profile.streetAddress ? "—" : "")}
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

            {/* 保存ボタン（基本情報のみ編集モードで表示） */}
            {isEditing && (
              <div className="flex gap-3 pt-2 border-t border-slate-100">
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
                      setProfile(initialProfile
                        ? { ...initialProfile, education: initialProfile.education ?? [], workHistory: initialProfile.workHistory ?? [] }
                        : { ...EMPTY_FORM }
                      );
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

        {/* 学歴カード */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-violet-500" />
              <h2 className="font-bold text-slate-900">学歴</h2>
              <span className="text-xs text-slate-400">（小学校〜大学）</span>
            </div>
            <button
              onClick={addEducation}
              className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 font-semibold"
            >
              <PlusCircle className="h-4 w-4" /> 追加
            </button>
          </div>

          <div className="p-6 space-y-4">
            {profile.education.length === 0 ? (
              <button
                onClick={addEducation}
                className="w-full flex items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-violet-300 hover:text-violet-500 transition-colors text-sm"
              >
                <PlusCircle className="h-4 w-4" /> 学歴を追加する
              </button>
            ) : (
              <>
                {profile.education.map((entry, index) => (
                  <EducationEntryEditor
                    key={entry.id}
                    entry={entry}
                    index={index}
                    onChange={(patch) => updateEducation(entry.id, patch)}
                    onRemove={() => removeEducation(entry.id)}
                  />
                ))}
                <button
                  onClick={addEducation}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-violet-300 hover:text-violet-500 transition-colors text-sm font-medium"
                >
                  <PlusCircle className="h-4 w-4" /> 学歴を追加
                </button>
              </>
            )}

            {profile.education.length > 0 && (
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "保存中..." : "保存する"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 職歴カード */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BriefcaseBusiness className="h-5 w-5 text-sky-500" />
              <h2 className="font-bold text-slate-900">職歴</h2>
            </div>
            <button
              onClick={addWork}
              className="flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-700 font-semibold"
            >
              <PlusCircle className="h-4 w-4" /> 追加
            </button>
          </div>

          <div className="p-6 space-y-4">
            {profile.workHistory.length === 0 ? (
              <button
                onClick={addWork}
                className="w-full flex items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-sky-300 hover:text-sky-500 transition-colors text-sm"
              >
                <PlusCircle className="h-4 w-4" /> 職歴を追加する
              </button>
            ) : (
              <>
                {profile.workHistory.map((entry, index) => (
                  <WorkEntryEditor
                    key={entry.id}
                    entry={entry}
                    index={index}
                    onChange={(patch) => updateWork(entry.id, patch)}
                    onRemove={() => removeWork(entry.id)}
                  />
                ))}
                <button
                  onClick={addWork}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-sky-300 hover:text-sky-500 transition-colors text-sm font-medium"
                >
                  <PlusCircle className="h-4 w-4" /> 職歴を追加
                </button>
              </>
            )}

            {profile.workHistory.length > 0 && (
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "保存中..." : "保存する"}
                </button>
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

/* ── 学歴エントリ エディター ── */
function EducationEntryEditor({
  entry, index, onChange, onRemove,
}: {
  entry: EducationEntry;
  index: number;
  onChange: (patch: Partial<EducationEntry>) => void;
  onRemove: () => void;
}) {
  const ENTRY_OPTIONS: { value: EducationEntryType; label: string }[] = [
    { value: "enrolled", label: "入学" },
    { value: "transferred_in", label: "転入" },
  ];
  const EXIT_OPTIONS: { value: EducationExitType; label: string }[] = [
    { value: "graduated",    label: "卒業" },
    { value: "transferred",  label: "転学" },
    { value: "study_abroad", label: "留学" },
    { value: "dropped_out",  label: "中退" },
  ];

  return (
    <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-violet-600">学歴 {index + 1}</span>
        <button onClick={onRemove} className="text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs text-slate-400 mb-1">学校名 <span className="text-red-400">*</span></label>
          <input
            value={entry.school}
            onChange={(e) => onChange({ school: e.target.value })}
            placeholder="○○高等学校"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 placeholder:text-slate-300"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">学部・学科</label>
          <input
            value={entry.faculty ?? ""}
            onChange={(e) => onChange({ faculty: e.target.value })}
            placeholder="経済学部（大学の場合）"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 placeholder:text-slate-300"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">学科</label>
          <input
            value={entry.department ?? ""}
            onChange={(e) => onChange({ department: e.target.value })}
            placeholder="経済学科"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 placeholder:text-slate-300"
          />
        </div>
      </div>

      {/* 入学 */}
      <div className="rounded-lg bg-white border border-slate-100 p-3 space-y-2">
        <p className="text-xs font-semibold text-slate-500">入学</p>
        <div className="flex flex-wrap items-center gap-2">
          <YMSelect years label="年" value={entry.entryYear} onChange={(v) => onChange({ entryYear: v })} />
          <YMSelect months label="月" value={entry.entryMonth} onChange={(v) => onChange({ entryMonth: v })} />
          <select
            value={entry.entryType}
            onChange={(e) => onChange({ entryType: e.target.value as EducationEntryType })}
            className="rounded-lg border border-slate-200 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          >
            {ENTRY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* 卒業 */}
      <div className="rounded-lg bg-white border border-slate-100 p-3 space-y-2">
        <p className="text-xs font-semibold text-slate-500">卒業 / 修了</p>
        <div className="flex flex-wrap items-center gap-2">
          <YMSelect years label="年" value={entry.exitYear ?? entry.entryYear} onChange={(v) => onChange({ exitYear: v })} />
          <YMSelect months label="月" value={entry.exitMonth ?? entry.entryMonth} onChange={(v) => onChange({ exitMonth: v })} />
          <select
            value={entry.exitType ?? "graduated"}
            onChange={(e) => onChange({ exitType: e.target.value as EducationExitType })}
            className="rounded-lg border border-slate-200 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          >
            {EXIT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

/* ── 職歴エントリ エディター ── */
function WorkEntryEditor({
  entry, index, onChange, onRemove,
}: {
  entry: WorkEntry;
  index: number;
  onChange: (patch: Partial<WorkEntry>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-sky-600">職歴 {index + 1}</span>
        <button onClick={onRemove} className="text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs text-slate-400 mb-1">会社名 <span className="text-red-400">*</span></label>
          <input
            value={entry.company}
            onChange={(e) => onChange({ company: e.target.value })}
            placeholder="株式会社○○"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 placeholder:text-slate-300"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">部署</label>
          <input
            value={entry.department ?? ""}
            onChange={(e) => onChange({ department: e.target.value })}
            placeholder="開発部"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 placeholder:text-slate-300"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">役職・職種</label>
          <input
            value={entry.position ?? ""}
            onChange={(e) => onChange({ position: e.target.value })}
            placeholder="Webエンジニア"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 placeholder:text-slate-300"
          />
        </div>
      </div>

      {/* 入社 */}
      <div className="rounded-lg bg-white border border-slate-100 p-3 space-y-2">
        <p className="text-xs font-semibold text-slate-500">入社</p>
        <div className="flex flex-wrap items-center gap-2">
          <YMSelect years label="年" value={entry.entryYear} onChange={(v) => onChange({ entryYear: v })} />
          <YMSelect months label="月" value={entry.entryMonth} onChange={(v) => onChange({ entryMonth: v })} />
        </div>
      </div>

      {/* 退社 */}
      <div className="rounded-lg bg-white border border-slate-100 p-3 space-y-2">
        <p className="text-xs font-semibold text-slate-500">退社</p>
        <div className="flex flex-wrap items-center gap-2">
          {!entry.isCurrent && (
            <>
              <YMSelect years label="年" value={entry.exitYear ?? entry.entryYear} onChange={(v) => onChange({ exitYear: v, isCurrent: false })} />
              <YMSelect months label="月" value={entry.exitMonth ?? entry.entryMonth} onChange={(v) => onChange({ exitMonth: v, isCurrent: false })} />
            </>
          )}
          <button
            type="button"
            onClick={() => onChange({ isCurrent: !entry.isCurrent, exitYear: undefined, exitMonth: undefined })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
              entry.isCurrent
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            在職中（現在に至る）
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1">業務内容</label>
        <textarea
          value={entry.description ?? ""}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="担当業務・実績を記載してください"
          rows={3}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 placeholder:text-slate-300 resize-none"
        />
      </div>
    </div>
  );
}

/* ── 年月セレクト ── */
function YMSelect({
  label, value, onChange, years, months,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  years?: boolean;
  months?: boolean;
}) {
  const options = years ? YEARS : months ? MONTHS : [];
  return (
    <div className="flex items-center gap-1">
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-lg border border-slate-200 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span className="text-xs text-slate-400">{label}</span>
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
