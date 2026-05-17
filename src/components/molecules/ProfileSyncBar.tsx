"use client";

import { useEffect, useState } from "react";
import { CloudUpload, ClipboardPaste, Loader2, Check } from "lucide-react";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/browserClient";
import { useProfileStore } from "@/store/profileStore";

interface ProfileSyncBarProps {
  /** フォームの個人情報 → プロフィール形式に変換して保存する */
  onSave: (userId: string) => Promise<void>;
  /** プロフィールをフォームに反映する */
  onPaste: () => void;
}

export function ProfileSyncBar({ onSave, onPaste }: ProfileSyncBarProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { hasProfile, isLoading: profileLoading, loadProfile } = useProfileStore();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setAuthChecked(true); return; }

    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      setAuthChecked(true);
      if (uid) loadProfile(uid);
    });
  }, [loadProfile]);

  if (!authChecked || !userId) return null;

  const handleSave = async () => {
    try {
      await onSave(userId);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      alert("保存に失敗しました。ログインしているか確認してください。");
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap mb-2">
      <button
        type="button"
        onClick={handleSave}
        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-full transition-colors"
      >
        {saveSuccess ? (
          <><Check className="h-3.5 w-3.5 text-emerald-500" /> 保存しました</>
        ) : (
          <><CloudUpload className="h-3.5 w-3.5" /> 個人情報を保存</>
        )}
      </button>

      {(profileLoading || hasProfile) && (
        <button
          type="button"
          onClick={onPaste}
          disabled={profileLoading}
          className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
        >
          {profileLoading
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> 読み込み中</>
            : <><ClipboardPaste className="h-3.5 w-3.5" /> 保存済み情報を入力</>
          }
        </button>
      )}
    </div>
  );
}
