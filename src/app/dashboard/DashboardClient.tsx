"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  FileText,
  PlusCircle,
  Pencil,
  Trash2,
  Download,
  LogOut,
  Clock,
  Printer,
  Mail,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useResumeStore } from "@/store/resumeStore";
import { usePdfDownload } from "@/hooks/usePdfDownload";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import type { Resume } from "@/types";

const FORMAT_LABELS: Record<string, string> = {
  jis: "JIS規格",
  career_change: "転職用",
  new_graduate: "新卒用",
  part_time: "アルバイト用",
  ai_draft: "AI生成",
};

interface ResumeCardProps {
  resume: Resume;
  onDelete: (id: string) => void;
}

function ResumeCard({ resume, onDelete }: ResumeCardProps) {
  const loadResume = useResumeStore((s) => s.loadResume);
  const { download, isGenerating } = usePdfDownload(resume);

  const handlePrint = async () => {
    const { pdf } = await import("@react-pdf/renderer");
    const { createElement } = await import("react");
    const { ResumePdfDocument } = await import("@/components/pdf/ResumePdfDocument");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = await (pdf as any)(createElement(ResumePdfDocument, { resume })).toBlob();
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) win.onload = () => { win.print(); URL.revokeObjectURL(url); };
  };

  const handleEmail = () => {
    const name = `${resume.personalInfo?.lastName ?? ""}${resume.personalInfo?.firstName ?? ""}`;
    const subject = encodeURIComponent(`履歴書（${name}）`);
    const body = encodeURIComponent(`お世話になっております。\n\n${name}の履歴書をお送りします。\nPDFを別途添付いたします。\n\nよろしくお願いいたします。`);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_self");
  };

  return (
    <article className="rounded-xl border bg-card p-5 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-5 w-5 text-primary shrink-0" />
          <h3 className="font-semibold truncate">{resume.title}</h3>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {FORMAT_LABELS[resume.format] ?? resume.format}
        </Badge>
      </div>

      <div className="text-sm text-muted-foreground space-y-1">
        <p>
          {resume.personalInfo.lastName} {resume.personalInfo.firstName}
        </p>
        <p className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {format(new Date(resume.updatedAt), "yyyy年M月d日 HH:mm", { locale: ja })} 更新
        </p>
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          asChild
          onClick={() => loadResume(resume)}
          className="flex-1 gap-1.5"
        >
          <Link href={`/resume/${resume.id}`}>
            <Pencil className="h-4 w-4" />
            編集
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={download}
          isLoading={isGenerating}
          aria-label="PDFダウンロード"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          aria-label="印刷"
        >
          <Printer className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleEmail}
          aria-label="メール転送"
        >
          <Mail className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(resume.id)}
          aria-label="削除"
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}

function AiDraftCard({ draft, onDelete }: { draft: Resume; onDelete: (id: string) => void }) {
  const setMotivation = useResumeStore((s) => s.setMotivation);
  const setSelfPR = useResumeStore((s) => s.setSelfPR);
  const router = useRouter();

  const text = draft.motivation || draft.selfPR;

  const handleApply = (target: "motivation" | "selfPR") => {
    if (target === "motivation") setMotivation(text);
    else setSelfPR(text);
    router.push("/resume/new?step=5");
  };

  return (
    <article className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-4 w-4 text-indigo-500 shrink-0" />
          <p className="text-sm font-semibold text-slate-800 truncate">{draft.title}</p>
        </div>
        <Badge variant="secondary" className="shrink-0 text-indigo-600 bg-indigo-100 border-0">AI生成</Badge>
      </div>
      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{text}</p>
      <div className="flex gap-2 flex-wrap pt-1">
        <Button variant="outline" size="sm" onClick={() => handleApply("motivation")} className="text-xs gap-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
          <ArrowRight className="h-3 w-3" />志望動機に引用
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleApply("selfPR")} className="text-xs gap-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
          <ArrowRight className="h-3 w-3" />自己PRに引用
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(draft.id)} className="text-muted-foreground hover:text-destructive ml-auto">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </article>
  );
}

interface DashboardClientProps {
  initialResumes: Resume[];
  userEmail: string;
}

/**
 * ダッシュボードのインタラクティブ部分。
 * Server Component から初期データを受け取り、削除・ログアウト操作を担う。
 */
export function DashboardClient({ initialResumes, userEmail }: DashboardClientProps) {
  const router = useRouter();
  const { signOut, isLoading: isSigningOut } = useAuthStore();
  const deleteSaved = useResumeStore((s) => s.deleteSaved);
  const [resumes, setResumes] = useState<Resume[]>(
    initialResumes.filter((r) => r.format !== "ai_draft")
  );
  const [aiDrafts, setAiDrafts] = useState<Resume[]>(
    initialResumes.filter((r) => r.format === "ai_draft")
  );

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この履歴書を削除しますか？この操作は元に戻せません。")) return;

    try {
      await fetch(`/api/resume/${id}`, { method: "DELETE" });
      deleteSaved(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      setAiDrafts((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("削除に失敗しました。");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="border-b">
        <div className="container max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-bold">ジブキャリ</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-muted-foreground">
              {userEmail}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              isLoading={isSigningOut}
              className="gap-1.5"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">ログアウト</span>
            </Button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">マイ履歴書</h1>
            <p className="text-sm text-muted-foreground mt-1">
              作成した書類を管理できます
            </p>
          </div>
          <Button asChild>
            <Link href="/resume/new" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              新規作成
            </Link>
          </Button>
        </div>

        {resumes.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/30 py-20 text-center space-y-4">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <p className="font-medium">履歴書がまだありません</p>
              <p className="text-sm text-muted-foreground">
                「新規作成」から最初の履歴書を作りましょう
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/resume/new">
                <PlusCircle className="h-4 w-4 mr-2" />
                最初の履歴書を作成
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {aiDrafts.length > 0 && (
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-bold">AI生成テキスト</h2>
              <span className="text-sm text-muted-foreground">（{aiDrafts.length}件）</span>
            </div>
            <p className="text-xs text-slate-500">AIサポートで生成・保存したテキストです。履歴書の志望動機・自己PRに引用できます。</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiDrafts.map((draft) => (
                <AiDraftCard key={draft.id} draft={draft} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
