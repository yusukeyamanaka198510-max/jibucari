"use client";

import { useEffect, useRef, useState, createElement } from "react";
import { pdf } from "@react-pdf/renderer";
import { useResumeStore } from "@/store/resumeStore";
import { useAutoSave } from "@/hooks/useAutoSave";
import { usePdfDownload } from "@/hooks/usePdfDownload";
import { PersonalInfoSection } from "@/components/organisms/PersonalInfoSection";
import { EducationSection } from "@/components/organisms/EducationSection";
import { WorkHistorySection } from "@/components/organisms/WorkHistorySection";
import { LicenseSection } from "@/components/organisms/LicenseSection";
import { MotivationSection } from "@/components/organisms/MotivationSection";
import { AutoSaveIndicator } from "@/components/molecules/AutoSaveIndicator";
import { PdfPreviewModal } from "@/components/pdf/PdfPreviewModal";
import { ResumePdfDocument } from "@/components/pdf/ResumePdfDocument";
import { Button } from "@/components/atoms/Button";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, Download, Eye, Check,
  Camera, Mail, Trash2, CalendarDays, X, CheckCircle2, Train, Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResumeFormat } from "@/types";
import { ProfileSyncBar } from "@/components/molecules/ProfileSyncBar";
import { useProfileStore } from "@/store/profileStore";

interface ResumeFormLayoutProps {
  format?: ResumeFormat;
  resumeId?: string;
}

const FORMAT_LABELS: Record<ResumeFormat, string> = {
  jis: "JIS規格 履歴書",
  career_change: "転職履歴書",
  new_graduate: "新卒履歴書",
  part_time: "アルバイト履歴書",
  no_photo: "写真なし履歴書",
};

type StepDef = { id: number; label: string; short: string };

function buildSteps(format: ResumeFormat): StepDef[] {
  const base: StepDef[] = [
    { id: 1, label: "基本情報", short: "基本" },
    { id: 2, label: "学歴",     short: "学歴" },
  ];

  // Step 3: 職歴ラベルをフォーマットで変える
  const workLabel = format === "part_time" ? "アルバイト歴" : format === "new_graduate" ? "インターン・バイト" : "職歴";
  base.push({ id: 3, label: workLabel, short: "職歴" });

  base.push({ id: 4, label: "免許・資格", short: "資格" });

  // Step 5: PRラベル
  const prLabel =
    format === "career_change" ? "転職理由・志望動機" :
    format === "new_graduate"  ? "自己PR・学生時代" :
    format === "part_time"     ? "志望動機・PR" :
    "志望動機・PR";
  base.push({ id: 5, label: prLabel, short: "PR" });

  // Step 6: フォーマット依存
  if (format === "no_photo") {
    // 写真なし → Step 6 をスキップ、そのまま確認へ
  } else if (format === "part_time") {
    base.push({ id: 6, label: "希望勤務条件", short: "勤務" });
  } else {
    base.push({ id: 6, label: "証明写真", short: "写真" });
  }

  base.push({ id: base.length + 1, label: "確認・DL", short: "確認" });
  return base;
}

export function ResumeFormLayout({ format = "jis", resumeId }: ResumeFormLayoutProps) {
  const initNew = useResumeStore((s) => s.initNew);
  const current = useResumeStore((s) => s.current);
  const saved   = useResumeStore((s) => s.saved);
  const [step, setStep]             = useState(1);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailSent, setEmailSent]   = useState(false);

  const { download, isGenerating } = usePdfDownload(current);
  const activeFormat = (current?.format ?? format) as ResumeFormat;
  const STEPS = buildSteps(activeFormat);
  const lastStep = STEPS[STEPS.length - 1]?.id ?? STEPS.length;

  useEffect(() => {
    if (resumeId) {
      const existing = saved.find((r) => r.id === resumeId);
      if (existing) {
        useResumeStore.getState().loadResume(existing);
        return;
      }
    }
    // 新規作成時は常に指定フォーマットで初期化（前回の残留データを上書き）
    initNew(format);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useAutoSave();

  const { saveProfile, profile: savedProfile } = useProfileStore();

  const handleSaveProfile = async (userId: string) => {
    if (!current) return;
    const pi = current.personalInfo;
    await saveProfile(userId, {
      lastName: pi.lastName,
      firstName: pi.firstName,
      lastNameKana: pi.lastNameKana,
      firstNameKana: pi.firstNameKana,
      birthDate: pi.birthDate,
      gender: pi.gender,
      postalCode: pi.postalCode,
      prefecture: pi.prefecture,
      city: pi.city,
      addressDetail: [pi.streetAddress, pi.building].filter(Boolean).join(" "),
      phone: pi.mobilePhone,
      email: pi.email,
    });
  };

  const handlePasteProfile = () => {
    if (!savedProfile) return;
    useResumeStore.getState().updatePersonalInfo({
      lastName: savedProfile.lastName,
      firstName: savedProfile.firstName,
      lastNameKana: savedProfile.lastNameKana,
      firstNameKana: savedProfile.firstNameKana,
      birthDate: savedProfile.birthDate,
      postalCode: savedProfile.postalCode,
      prefecture: savedProfile.prefecture,
      city: savedProfile.city,
      streetAddress: savedProfile.addressDetail,
      mobilePhone: savedProfile.phone,
      email: savedProfile.email,
    });
  };

  if (!current) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // メール送信（API経由）
  const handleSendEmail = async () => {
    if (!current.personalInfo.email) {
      alert("基本情報にメールアドレスを入力してください。");
      return;
    }
    setIsEmailSending(true);
    setEmailSent(false);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const element = createElement(ResumePdfDocument, { resume: current }) as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await (pdf as any)(element).toBlob();
      const arrayBuffer = await blob.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      const base64 = btoa(uint8.reduce((acc, b) => acc + String.fromCharCode(b), ""));
      const name = `${current.personalInfo.lastName}${current.personalInfo.firstName}`;

      const res = await fetch("/api/email/send-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: base64, email: current.personalInfo.email, name }),
      });

      if (res.ok) {
        setEmailSent(true);
      } else {
        const { error } = await res.json();
        alert(`メール送信に失敗しました: ${error ?? "不明なエラー"}`);
      }
    } catch {
      alert("メール送信中にエラーが発生しました。");
    } finally {
      setIsEmailSending(false);
    }
  };

  const progress = Math.round(((step - 1) / (STEPS.length - 1)) * 100);

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        {/* ── スティッキーヘッダー ── */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/resume/new"
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                テンプレート
              </Link>
              <span className="text-slate-200 select-none">|</span>
              <span className="font-bold text-sm text-slate-700 truncate">
                {FORMAT_LABELS[current.format as ResumeFormat] ?? "履歴書"}
              </span>
            </div>
            <AutoSaveIndicator className="hidden sm:flex" />
          </div>
          <div className="h-1 bg-slate-100">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        {/* ── ステップインジケーター ── */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <ol className="flex items-center gap-1 sm:gap-2">
              {STEPS.map((s, i) => {
                const isDone   = step > s.id;
                const isActive = step === s.id;
                return (
                  <li key={s.id} className="flex items-center flex-1 min-w-0">
                    <button
                      onClick={() => isDone && setStep(s.id)}
                      disabled={!isDone}
                      className={cn(
                        "flex flex-col items-center gap-0.5 flex-1 min-w-0 group transition-opacity",
                        isDone ? "cursor-pointer" : "cursor-default"
                      )}
                    >
                      <span
                        className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                          isDone
                            ? "bg-indigo-600 text-white"
                            : isActive
                            ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                            : "bg-slate-100 text-slate-400"
                        )}
                      >
                        {isDone ? <Check className="h-3.5 w-3.5" /> : s.id}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] sm:text-xs font-medium truncate w-full text-center",
                          isActive ? "text-indigo-600" : isDone ? "text-slate-500" : "text-slate-400"
                        )}
                      >
                        <span className="hidden sm:inline">{s.label}</span>
                        <span className="sm:hidden">{s.short}</span>
                      </span>
                    </button>
                    {i < STEPS.length - 1 && (
                      <div
                        className={cn(
                          "h-px flex-shrink-0 w-3 sm:w-6 mx-0.5 transition-colors",
                          step > s.id ? "bg-indigo-400" : "bg-slate-200"
                        )}
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* ── フォーム本体 ── */}
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="mb-6">
              <p className="text-xs text-indigo-600 font-semibold tracking-widest uppercase mb-1">
                Step {step} / {STEPS.length}
              </p>
              <h2 className="text-xl font-black text-slate-900">
                {STEPS[step - 1]?.label}
              </h2>
            </div>

            <div className="space-y-6">
              {step === 1 && (
                <>
                  <ProfileSyncBar onSave={handleSaveProfile} onPaste={handlePasteProfile} />
                  <PersonalInfoSection />
                </>
              )}
              {step === 2 && <EducationSection format={activeFormat} />}
              {step === 3 && <WorkHistorySection format={activeFormat} />}
              {step === 4 && <LicenseSection />}
              {step === 5 && <MotivationSection format={activeFormat} />}
              {step === 6 && activeFormat === "part_time" && <ShiftSection />}
              {step === 6 && activeFormat !== "part_time" && activeFormat !== "no_photo" && <PhotoStep />}
              {step === lastStep && (
                <ReviewStep
                  onPreview={() => setIsPreviewing(true)}
                  onDownload={download}
                  isGenerating={isGenerating}
                  onEmailSend={handleSendEmail}
                  isEmailSending={isEmailSending}
                  emailSent={emailSent}
                />
              )}
            </div>
          </div>

          {/* ── ナビゲーションボタン ── */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              前へ
            </Button>

            <AutoSaveIndicator className="sm:hidden" />

            {step < STEPS.length ? (
              <Button
                onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
                className="gap-2"
              >
                次へ
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={download} isLoading={isGenerating} className="gap-2">
                <Download className="h-4 w-4" />
                PDFダウンロード
              </Button>
            )}
          </div>
        </main>
      </div>

      <PdfPreviewModal
        resume={current}
        isOpen={isPreviewing}
        onClose={() => setIsPreviewing(false)}
      />
    </>
  );
}

/* ── Step 6 (part_time): 希望勤務条件 ───────────────────────────────── */
function ShiftSection() {
  const commute       = useResumeStore((s) => s.current?.commute ?? "");
  const desiredSalary = useResumeStore((s) => s.current?.desiredSalary ?? "");
  const setCommute       = useResumeStore((s) => s.setCommute);
  const setDesiredSalary = useResumeStore((s) => s.setDesiredSalary);

  const COMMUTE_OPTIONS = ["徒歩", "自転車", "バイク", "自動車", "電車", "バス", "その他"];

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        勤務条件の希望を記載してください。採用担当者がシフト調整の参考にします。
      </p>

      {/* 通勤手段・時間 */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Train className="h-4 w-4 text-emerald-500" />
          通勤手段・通勤時間
        </label>
        <div className="flex flex-wrap gap-2">
          {COMMUTE_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setCommute(commute === opt ? "" : opt)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all",
                commute === opt
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 text-slate-500 hover:border-slate-300"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={commute}
          onChange={(e) => setCommute(e.target.value)}
          placeholder="例：自転車（15分）、電車（30分・乗換1回）"
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {/* 希望時給・給与 */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Banknote className="h-4 w-4 text-emerald-500" />
          希望時給・給与
        </label>
        <input
          type="text"
          value={desiredSalary}
          onChange={(e) => setDesiredSalary(e.target.value)}
          placeholder="例：時給1,100円以上、もしくは応相談"
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      <p className="text-xs text-slate-400">
        ※ 希望シフトは前のステップ「志望動機・PR」内の「希望シフト・勤務可能日」欄にも記載できます。
      </p>
    </div>
  );
}

/* ── Step 6: 証明写真 ────────────────────────────────────────────── */
async function detectFace(file: File): Promise<boolean> {
  if (!("FaceDetector" in window)) return true;
  try {
    const bitmap = await createImageBitmap(file);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const detector = new (window as any).FaceDetector({ fastMode: true });
    const faces = await detector.detect(bitmap);
    return faces.length > 0;
  } catch {
    return true;
  }
}

function PhotoStep() {
  const photoUrl = useResumeStore((s) => s.current?.personalInfo.photoUrl ?? "");
  const updatePersonalInfo = useResumeStore((s) => s.updatePersonalInfo);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [faceWarning, setFaceWarning] = useState(false);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFaceWarning(false);
    const hasFace = await detectFace(file);
    if (!hasFace) setFaceWarning(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      updatePersonalInfo({ photoUrl: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">
        縦4cm×横3cm程度の証明写真を推奨します。JPEG・PNG形式に対応しています。
      </p>

      {faceWarning && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 flex items-start gap-2">
          <span className="text-lg leading-none">⚠️</span>
          <span>顔が検出されませんでした。正面から撮影した証明写真をご使用ください。このまま続けることもできます。</span>
        </div>
      )}

      <div className="flex items-start gap-6">
        <div
          className="relative w-28 h-36 flex-shrink-0 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {photoUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl} alt="証明写真" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Camera className="h-8 w-8" />
              <span className="text-xs font-medium text-center leading-tight">タップして<br />追加</span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-medium px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
            >
              {photoUrl ? "写真を変更" : "写真を選択"}
            </button>
            {photoUrl && (
              <button
                onClick={() => updatePersonalInfo({ photoUrl: "" })}
                className="text-sm font-medium px-4 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                削除
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            写真はPDFに印刷されます。省略することも可能です。
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoChange}
      />
    </div>
  );
}

/* ── Step 7: 確認・ダウンロード ─────────────────────────────────── */

const CONSULTATION_TOPICS = [
  { value: "job_hunting",   label: "就職活動の進め方" },
  { value: "resume_review", label: "履歴書・職務経歴書の添削" },
  { value: "interview_prep",label: "面接対策" },
  { value: "career_change", label: "転職・キャリアチェンジ" },
  { value: "industry_advice",label: "業界・職種の相談" },
  { value: "other",         label: "その他" },
];

function ReviewStep({
  onPreview,
  onDownload,
  isGenerating,
  onEmailSend,
  isEmailSending,
  emailSent,
}: {
  onPreview: () => void;
  onDownload: () => void;
  isGenerating: boolean;
  onEmailSend: () => Promise<void>;
  isEmailSending: boolean;
  emailSent: boolean;
}) {
  const info = useResumeStore((s) => s.current?.personalInfo);
  const name = info ? `${info.lastName}${info.firstName}` : "";

  const [consultOpen, setConsultOpen]   = useState(false);
  const [date1, setDate1]               = useState({ date: "", hour: "10" });
  const [date2, setDate2]               = useState({ date: "", hour: "10" });
  const [date3, setDate3]               = useState({ date: "", hour: "10" });
  const [topic, setTopic]               = useState("job_hunting");
  const [isSending, setIsSending]       = useState(false);
  const [sendSuccess, setSendSuccess]   = useState(false);
  const [sendError, setSendError]       = useState("");

  const fmtDate = (d: { date: string; hour: string }) =>
    d.date ? `${d.date} ${d.hour}:00` : "";

  const handleConsultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date1) { setSendError("第一希望日を入力してください。"); return; }
    setIsSending(true);
    setSendError("");
    try {
      const res = await fetch("/api/email/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: info?.email ?? "",
          phone: info?.mobilePhone ?? "",
          date1: fmtDate(date1),
          date2: fmtDate(date2),
          date3: fmtDate(date3),
          topic,
        }),
      });
      if (res.ok) {
        setSendSuccess(true);
      } else {
        const { error } = await res.json();
        setSendError(error ?? "送信に失敗しました。");
      }
    } catch {
      setSendError("通信エラーが発生しました。");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* 完了メッセージ */}
      <div className="text-center space-y-2">
        <div className="text-5xl">🎉</div>
        <h3 className="text-xl font-black text-slate-900">入力完了！</h3>
        <p className="text-slate-500 text-sm">内容を確認して、PDFを保存・送信しましょう。</p>
      </div>

      {/* プレビュー */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={onPreview} className="gap-2">
          <Eye className="h-4 w-4" />
          プレビューで確認
        </Button>
      </div>

      {/* 書類を保存・送る */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-700">書類を保存・送る</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={onDownload}
            isLoading={isGenerating}
            variant="outline"
            className="gap-2 flex-1"
          >
            <Download className="h-4 w-4" />
            PDFをダウンロード
          </Button>
          <Button
            onClick={onEmailSend}
            isLoading={isEmailSending}
            disabled={emailSent}
            className="gap-2 flex-1"
          >
            {emailSent ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                送信済み
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                メールで受け取る
              </>
            )}
          </Button>
        </div>
        {emailSent && (
          <p className="text-xs text-emerald-600 font-medium">
            ✓ {info?.email} にPDFを送信しました
          </p>
        )}
        <p className="text-xs text-slate-400">
          「メールで受け取る」は基本情報に入力したメールアドレス宛にPDFを送信します。
        </p>
      </div>

      {/* ─────────── ジブキャリ面談依頼 ─────────── */}
      <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-indigo-800">ジブキャリスタッフに無料面談依頼</p>
            <p className="text-xs text-indigo-600 mt-0.5">
              就活・転職のプロが無料で相談に乗ります
            </p>
          </div>
          <CalendarDays className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
        </div>

        {!consultOpen && !sendSuccess && (
          <Button
            onClick={() => setConsultOpen(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
          >
            <CalendarDays className="h-4 w-4" />
            面談を申し込む
          </Button>
        )}

        {/* 面談フォーム */}
        {consultOpen && !sendSuccess && (
          <form onSubmit={handleConsultSubmit} className="space-y-4 pt-1">
            {/* 相談内容 */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                相談内容 <span className="text-red-500">*</span>
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              >
                {CONSULTATION_TOPICS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* 希望日 */}
            <p className="text-xs text-slate-400">初回面談は30分〜1時間程度を予定しています。</p>
            <div className="space-y-2">
              {[
                { label: "第一希望日", val: date1, set: setDate1, required: true },
                { label: "第二希望日", val: date2, set: setDate2, required: false },
                { label: "第三希望日", val: date3, set: setDate3, required: false },
              ].map(({ label, val, set, required }) => (
                <div key={label} className="space-y-0.5">
                  <label className="text-xs font-semibold text-slate-700">
                    {label}
                    {required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={val.date}
                      onChange={(e) => set((prev) => ({ ...prev, date: e.target.value }))}
                      required={required}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    />
                    <select
                      value={val.hour}
                      onChange={(e) => set((prev) => ({ ...prev, hour: e.target.value }))}
                      className="w-24 rounded-lg border border-slate-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    >
                      {Array.from({ length: 13 }, (_, i) => i + 9).map((h) => (
                        <option key={h} value={String(h)}>{h}:00</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {sendError && (
              <p className="text-xs text-red-500">{sendError}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setConsultOpen(false); setSendError(""); }}
                className="flex-1 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
              >
                <X className="h-3.5 w-3.5" />
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-1"
              >
                {isSending ? (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <CalendarDays className="h-3.5 w-3.5" />
                    送信する
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* 送信成功 */}
        {sendSuccess && (
          <div className="flex flex-col items-center gap-2 py-3 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <p className="text-sm font-bold text-slate-800">面談依頼を送信しました！</p>
            <p className="text-xs text-slate-500">担当スタッフより日程のご連絡をいたします。</p>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 text-center">
        ダウンロード後も編集・再ダウンロードできます
      </p>
    </div>
  );
}
