import {
  Document, Page, Text, View, Image, StyleSheet, Font,
} from "@react-pdf/renderer";
import type { Resume, EducationEntry, WorkEntry, LicenseEntry } from "@/types";
import { calculateAge } from "@/domain/entities/resume";

// ─── フォント登録 ──────────────────────────────────────────────────────────────
// ブラウザ: /fonts/... (HTTP fetch)
// サーバー: Font.register をルートで上書きするか file:// URL を使う
Font.register({
  family: "NotoSansJP",
  fonts: [
    { src: "/fonts/NotoSansJP-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/NotoSansJP-Bold.ttf",    fontWeight: 700 },
  ],
});

// ─── デザイントークン ──────────────────────────────────────────────────────────
const FONT      = "NotoSansJP";
const B_OUTER   = "1.2 solid #222";   // 外枠
const B_INNER   = "0.75 solid #444";  // 内罫線
const LABEL_BG  = "#E6E6E6";
const TEXT_DARK = "#111";
const TEXT_SUB  = "#555";

// ─── 日付・年齢ユーティリティ ──────────────────────────────────────────────────
function todayJa(): string {
  const d = new Date();
  return `${d.getFullYear()}年 ${d.getMonth() + 1}月 ${d.getDate()}日 現在`;
}

function birthJa(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getFullYear()}年 ${d.getMonth() + 1}月 ${d.getDate()}日生`;
}

function fmtYear(year: number): string {
  return String(year);
}

// ─── 学歴テキスト生成 ──────────────────────────────────────────────────────────
const ENTRY_LABEL: Record<string, string> = { enrolled: "入学", transferred_in: "転入学" };
const EXIT_LABEL:  Record<string, string> = {
  graduated: "卒業", dropped_out: "中途退学", transferred: "転学",
  study_abroad: "留学", "": "卒業",
};

function eduEntryText(e: EducationEntry): string {
  return [e.school, e.faculty, e.department].filter(Boolean).join(" ") +
    "　" + (ENTRY_LABEL[e.entryType] ?? "入学");
}
function eduExitText(e: EducationEntry): string {
  return [e.school, e.faculty].filter(Boolean).join(" ") +
    "　" + (EXIT_LABEL[e.exitType ?? "graduated"]);
}

// ─── licenses → テキスト ───────────────────────────────────────────────────────
function licensesToText(licenses: LicenseEntry[]): string {
  return licenses.map((l) => l.name).join("　");
}

// ─── workHistory → アルバイト経験テキスト ─────────────────────────────────────
function workToText(work: WorkEntry[]): string {
  return work.map((w) => {
    const parts = [w.company, w.department, w.position].filter(Boolean).join(" ");
    const period = w.isCurrent
      ? `${w.entryYear}年〜現在`
      : w.exitYear
        ? `${w.entryYear}年〜${w.exitYear}年`
        : `${w.entryYear}年〜`;
    return `${parts}（${period}）`;
  }).join("\n");
}

// ─── 長文フォントサイズ調整 ────────────────────────────────────────────────────
function adaptFontSize(text: string, base = 9, threshold = 120, min = 7): number {
  if (!text || text.length <= threshold) return base;
  const ratio = threshold / text.length;
  return Math.max(min, Math.round(base * ratio * 10) / 10);
}

// ─── スタイル ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily:  FONT,
    fontSize:    9,
    color:       TEXT_DARK,
    lineHeight:  1.5,
    paddingTop:    "14mm",
    paddingBottom: "12mm",
    paddingLeft:   "13mm",
    paddingRight:  "13mm",
    backgroundColor: "#fff",
  },

  // ── ヘッダー ──
  headerRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 5 },
  headerTitle: { fontSize: 17, fontWeight: 700, color: TEXT_DARK },
  headerDate:  { flex: 1, textAlign: "right", fontSize: 8, color: TEXT_SUB },

  // ── 汎用行 ──
  row: { flexDirection: "row" },

  // ── 個人情報ブロック（左70% / 右30%）──
  personalLeft:  { flex: 7, borderTop: B_OUTER, borderLeft: B_OUTER },
  personalRight: { flex: 3, borderTop: B_OUTER, borderLeft: B_INNER, borderRight: B_OUTER, borderBottom: B_OUTER },

  // ── 個人情報内セル ──
  piLabelCell: {
    backgroundColor: LABEL_BG,
    borderRight: B_INNER, borderBottom: B_INNER,
    width: 52, padding: "2 3",
    justifyContent: "center", alignItems: "center",
    fontSize: 8, color: "#333", lineHeight: 1.3,
  },
  piValueCell: {
    flex: 1,
    borderRight: B_OUTER, borderBottom: B_INNER,
    padding: "2.5 4",
    justifyContent: "center",
  },
  piValueCellLast: {
    flex: 1,
    borderRight: B_OUTER, borderBottom: B_OUTER,
    padding: "2.5 4",
    justifyContent: "center",
  },

  // ── 写真欄 ──
  photoArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  photoPlaceholder: { fontSize: 7, color: "#aaa", textAlign: "center", lineHeight: 2 },

  // ── Email行 ──
  emailRow: {
    flexDirection: "row",
    borderTop: B_INNER, borderLeft: B_OUTER, borderRight: B_OUTER, borderBottom: B_INNER,
  },
  emailLabel: {
    backgroundColor: LABEL_BG,
    width: 52, padding: "2 3",
    justifyContent: "center", alignItems: "center",
    borderRight: B_INNER,
    fontSize: 8, color: "#333",
  },
  emailValue: { flex: 1, padding: "2.5 4", justifyContent: "center", fontSize: 8.5 },

  // ── 学歴テーブル ──
  eduContainer: {
    borderTop: B_INNER, borderLeft: B_OUTER,
    marginTop: 0,
  },
  eduHeaderYear:    { width: 48, backgroundColor: LABEL_BG, borderRight: B_INNER, borderBottom: B_INNER, padding: "2 2", textAlign: "center", fontSize: 8, fontWeight: 700 },
  eduHeaderMonth:   { width: 28, backgroundColor: LABEL_BG, borderRight: B_INNER, borderBottom: B_INNER, padding: "2 2", textAlign: "center", fontSize: 8, fontWeight: 700 },
  eduHeaderContent: { flex: 1,   backgroundColor: LABEL_BG, borderRight: B_OUTER, borderBottom: B_INNER, padding: "2 5", textAlign: "center", fontSize: 8, fontWeight: 700 },
  eduYear:    { width: 48, borderRight: B_INNER, borderBottom: B_INNER, padding: "2 2", textAlign: "center", fontSize: 9 },
  eduMonth:   { width: 28, borderRight: B_INNER, borderBottom: B_INNER, padding: "2 2", textAlign: "center", fontSize: 9 },
  eduContent: { flex: 1,   borderRight: B_OUTER, borderBottom: B_INNER, padding: "2 5", fontSize: 9 },

  // ── 詳細テーブル ──
  detailContainer: { borderTop: B_INNER, borderLeft: B_OUTER },
  detailLabel: {
    width: 52,
    backgroundColor: LABEL_BG,
    borderRight: B_INNER, borderBottom: B_INNER,
    padding: "3 2",
    alignItems: "center", justifyContent: "center",
    fontSize: 8, lineHeight: 1.4,
  },
  detailValue: {
    flex: 1,
    borderRight: B_OUTER, borderBottom: B_INNER,
    padding: "3 5",
  },
});

// ─── サブコンポーネント ────────────────────────────────────────────────────────

function EntrySheetHeader({ date }: { date: string }) {
  return (
    <View style={s.headerRow}>
      <Text style={s.headerTitle}>エントリーシート</Text>
      <Text style={s.headerDate}>{date}</Text>
    </View>
  );
}

function ProfilePhoto({ url }: { url?: string }) {
  return (
    <View style={s.photoArea}>
      {url ? (
        <Image
          src={url}
          style={{ width: 90, height: 120, objectFit: "contain" }}
        />
      ) : (
        <View style={{ width: 90, height: 120, borderWidth: 0.5, borderColor: "#ccc", alignItems: "center", justifyContent: "center" }}>
          <Text style={s.photoPlaceholder}>証明写真{"\n"}縦4cm×横3cm</Text>
        </View>
      )}
    </View>
  );
}

function PersonalInformationSection({ resume }: { resume: Resume }) {
  const pi = resume.personalInfo;
  const age = calculateAge(pi.birthDate);
  const address = [
    pi.postalCode ? `〒${pi.postalCode}` : "",
    pi.prefecture, pi.city, pi.streetAddress, pi.building,
  ].filter(Boolean).join(" ");

  return (
    <View style={s.row}>
      {/* 左：個人情報グリッド */}
      <View style={s.personalLeft}>
        {/* ふりがな */}
        <View style={s.row}>
          <View style={s.piLabelCell}><Text>ふりがな</Text></View>
          <View style={[s.piValueCell, { fontSize: 8 }]}>
            <Text>{pi.lastNameKana}　{pi.firstNameKana}</Text>
          </View>
        </View>
        {/* 氏名 */}
        <View style={s.row}>
          <View style={s.piLabelCell}><Text>氏名</Text></View>
          <View style={[s.piValueCell, { paddingVertical: 5 }]}>
            <Text style={{ fontSize: 15, fontWeight: 700 }}>{pi.lastName}　{pi.firstName}</Text>
          </View>
        </View>
        {/* 生年月日 */}
        <View style={s.row}>
          <View style={s.piLabelCell}><Text>生年月日</Text></View>
          <View style={s.piValueCell}>
            <Text>{birthJa(pi.birthDate)}</Text>
            {age > 0 && (
              <Text style={{ fontSize: 7.5, color: TEXT_SUB }}>（満{age}歳）</Text>
            )}
          </View>
        </View>
        {/* 住所ふりがな */}
        <View style={s.row}>
          <View style={s.piLabelCell}><Text>住所{"\n"}ふりがな</Text></View>
          <View style={[s.piValueCell, { fontSize: 8 }]}>
            <Text>{pi.addressKana}</Text>
          </View>
        </View>
        {/* 現住所 */}
        <View style={s.row}>
          <View style={[s.piLabelCell, { borderBottom: B_OUTER }]}><Text>現住所</Text></View>
          <View style={[s.piValueCellLast]}>
            <Text style={{ fontSize: 8.5 }}>{address}</Text>
          </View>
        </View>
      </View>

      {/* 右：写真 */}
      <View style={s.personalRight}>
        <ProfilePhoto url={pi.photoUrl} />
      </View>
    </View>
  );
}

function EmailRow({ email }: { email: string }) {
  return (
    <View style={s.emailRow}>
      <View style={s.emailLabel}><Text>Email</Text></View>
      <View style={s.emailValue}><Text>{email}</Text></View>
    </View>
  );
}

function EducationTable({ education }: { education: EducationEntry[] }) {
  return (
    <View style={s.eduContainer}>
      {/* ヘッダー行 */}
      <View style={s.row}>
        <View style={s.eduHeaderYear}><Text>年</Text></View>
        <View style={s.eduHeaderMonth}><Text>月</Text></View>
        <View style={s.eduHeaderContent}><Text>学　歴</Text></View>
      </View>
      {/* 学歴データ行 */}
      {education.filter((e) => e.school?.trim()).map((e) => (
        <View key={e.id}>
          {/* 入学行 */}
          <View style={s.row}>
            <View style={s.eduYear}><Text>{fmtYear(e.entryYear)}</Text></View>
            <View style={s.eduMonth}><Text>{e.entryMonth}</Text></View>
            <View style={s.eduContent}><Text>{eduEntryText(e)}</Text></View>
          </View>
          {/* 卒業/退学行 */}
          {e.exitYear != null && (
            <View style={s.row}>
              <View style={s.eduYear}><Text>{fmtYear(e.exitYear)}</Text></View>
              <View style={s.eduMonth}><Text>{e.exitMonth ?? 3}</Text></View>
              <View style={s.eduContent}><Text>{eduExitText(e)}</Text></View>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

function DetailRow({
  label, value, minHeight = 36,
}: {
  label: string; value?: string; minHeight?: number;
}) {
  const text = value ?? "";
  const fs = adaptFontSize(text);
  return (
    <View style={s.row} wrap={false}>
      <View style={[s.detailLabel, { minHeight }]}>
        <Text style={{ textAlign: "center" }}>{label}</Text>
      </View>
      <View style={[s.detailValue, { minHeight }]}>
        <Text style={{ fontSize: fs, lineHeight: 1.5 }}>{text}</Text>
      </View>
    </View>
  );
}

function EntrySheetDetailTable({ resume }: { resume: Resume }) {
  const qualifications = licensesToText(resume.licenses);
  const workExp = workToText(resume.workHistory);

  return (
    <View style={s.detailContainer}>
      <DetailRow label={"ゼミ・\n研究テーマ"} value=""          minHeight={52} />
      <DetailRow label={"クラブ・\nサークル"}  value=""          minHeight={48} />
      <DetailRow label={"保有資格"}            value={qualifications} minHeight={28} />
      <DetailRow label={"趣味・特技"}          value={resume.hobbies} minHeight={28} />
      <DetailRow label={"アルバイト\n経験"}    value={workExp}   minHeight={52} />
      <DetailRow label={"自己PR"}             value={resume.selfPR}  minHeight={80} />
      <DetailRow label={"志望動機"}            value={resume.motivation} minHeight={88} />
    </View>
  );
}

// ─── メインエクスポート ────────────────────────────────────────────────────────
export function ResumePdfDocument({ resume }: { resume: Resume }) {
  return (
    <Document title={resume.title} author={`${resume.personalInfo.lastName} ${resume.personalInfo.firstName}`}>
      <Page size="A4" style={s.page}>
        <EntrySheetHeader date={todayJa()} />
        <PersonalInformationSection resume={resume} />
        <EmailRow email={resume.personalInfo.email} />
        <EducationTable education={resume.education} />
        <EntrySheetDetailTable resume={resume} />
      </Page>
    </Document>
  );
}
