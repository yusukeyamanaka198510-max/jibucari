"use client";

import { useState } from "react";
import { Users, FileText, Download, Mail, MessageSquare, Sparkles } from "lucide-react";
import type { ComponentType } from "react";
import { StatDetailModal } from "./StatDetailModal";
import { AIAnalysisModal } from "./AIAnalysisModal";

type Metric = "users" | "resumes" | "pdf_download" | "pdf_email" | "interview_request";

interface StatCardData {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
  metric: Metric;
}

interface DashboardStatsProps {
  totalUsers: number;
  totalResumes: number;
  totalPdfDownloads: number;
  totalPdfEmails: number;
  totalInterviewRequests: number;
}

export function DashboardStats({
  totalUsers,
  totalResumes,
  totalPdfDownloads,
  totalPdfEmails,
  totalInterviewRequests,
}: DashboardStatsProps) {
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const [analysisOpen, setAnalysisOpen] = useState(false);

  const statCards: StatCardData[] = [
    {
      label: "総ユーザー数",
      value: totalUsers,
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      metric: "users",
    },
    {
      label: "総履歴書数",
      value: totalResumes,
      icon: FileText,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-100",
      metric: "resumes",
    },
    {
      label: "PDF書き出し",
      value: totalPdfDownloads,
      icon: Download,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      metric: "pdf_download",
    },
    {
      label: "メール転送",
      value: totalPdfEmails,
      icon: Mail,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      metric: "pdf_email",
    },
    {
      label: "面談リクエスト",
      value: totalInterviewRequests,
      icon: MessageSquare,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
      metric: "interview_request",
    },
  ];

  const handleCardClick = (metric: Metric, label: string) => {
    setSelectedMetric(metric);
    setSelectedLabel(label);
  };

  const handleClose = () => {
    setSelectedMetric(null);
    setSelectedLabel("");
  };

  return (
    <>
      {/* AI分析ボタン */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setAnalysisOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow hover:shadow-md hover:from-indigo-600 hover:to-violet-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
        >
          <Sparkles className="w-4 h-4" />
          AI で現状分析
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg, border, metric }) => (
          <button
            key={label}
            type="button"
            onClick={() => handleCardClick(metric, label)}
            className={`bg-white rounded-2xl border ${border} p-5 space-y-3 text-left cursor-pointer hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2`}
            aria-label={`${label}の詳細を見る`}
          >
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">{value.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{label}</p>
            </div>
          </button>
        ))}
      </div>

      <StatDetailModal
        metric={selectedMetric}
        label={selectedLabel}
        onClose={handleClose}
      />

      <AIAnalysisModal
        isOpen={analysisOpen}
        onClose={() => setAnalysisOpen(false)}
      />
    </>
  );
}
