import {
  Document, Page, Text, View, Image, StyleSheet, Font,
} from "@react-pdf/renderer";
import type { Resume, EducationEntry, WorkEntry, LicenseEntry } from "@/types";
import { calculateAge } from "@/domain/entities/resume";

// ─── フォント登録 ──────────────────────────────────────────────────────────────
Font.register({
  family: "NotoSansJP",
  fonts: [
    { src: "/fonts/NotoSansJP-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/NotoSansJP-Bold.ttf",    fontWeight: 700 },
  ],
});

// ─── デザイントークン ──────────────────────────────────────────────────────────
const FONT     = "NotoSansJP";
const B        = "0.8 solid #333";   // 通常罫線
const B_OUTER  = "1.2 solid #222";   // 外枠
const LABEL_BG = "#fff";
const TXT      = "#111";
const SUB      = "#555";

// ─── ユーティリティ ────────────────────────────────────────────────────────────
function todayJa(): string {
  const d = new Date();
  return `${d.getFullYear()}年 ${d.getMonth() + 1}月 ${d.getDate()}日 現在`;
}

function birthJa(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getFullYear()}年　${d.getMonth() + 1}月　${d.getDate()}日生`;
}

const ENTRY_LABEL: Record<string, string> = { enrolled: "入学", transferred_in: "転入学" };
const EXIT_LABEL:  Record<string, string> = {
  graduated: "卒業", dropped_out: "中途退学", transferred: "転学",
  study_abroad: "留学",
};

function eduEntryText(e: EducationEntry): string {
  return [e.school, e.faculty, e.department].filter(Boolean).join(" ") +
    "　" + (ENTRY_LABEL[e.entryType] ?? "入学");
}
function eduExitText(e: EducationEntry): string {
  return [e.school, e.faculty, e.department].filter(Boolean).join(" ") +
    "　" + (EXIT_LABEL[e.exitType ?? "graduated"] ?? "卒業");
}

function licensesToText(ls: LicenseEntry[]): string {
  return ls.map((l) => l.name).join("　");
}

function workToText(ws: WorkEntry[]): string {
  return ws.map((w) => {
    const parts = [w.company, w.department, w.position].filter(Boolean).join(" ");
    const to = w.isCurrent ? "現在" : w.exitYear ? `${w.exitYear}年` : "";
    return `${parts}（${w.entryYear}年〜${to}）`;
  }).join("\n");
}

// 長文フォントサイズ自動縮小
function adaptFs(text: string, base = 9, threshold = 110, min = 7): number {
  if (!text || text.length <= threshold) return base;
  return Math.max(min, Math.round(base * (threshold / text.length) * 10) / 10);
}

// ─── スタイル ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily:    FONT,
    fontSize:      9,
    color:         TXT,
    lineHeight:    1.5,
    paddingTop:    "14mm",
    paddingBottom: "11mm",
    paddingLeft:   "13mm",
    paddingRight:  "13mm",
    backgroundColor: "#fff",
  },

  // ── ヘッダー ──
  headerRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 5 },
  headerTitle: { fontSize: 17, fontWeight: 700 },
  headerDate:  { flex: 1, textAlign: "right", fontSize: 8, color: SUB },

  // ── 汎用 ──
  row: { flexDirection: "row" },

  // ── 個人情報ブロック ──
  // 外枠はコンテナに borderTop / borderLeft のみ持たせ、
  // 各セルは borderRight / borderBottom を担う（二重線防止）
  piContainer: {
    flexDirection: "row",
    borderTop:  B_OUTER,
    borderLeft: B_OUTER,
  },
  piLeft:  { flex: 7 },
  piRight: {
    flex:        3,
    borderLeft:  B,
    borderRight: B_OUTER,
    borderBottom: B_OUTER,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },

  // 個人情報内セル
  piLabel: {
    width: 50,
    backgroundColor: LABEL_BG,
    borderRight:  B,
    borderBottom: B,
    padding: "2 3",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 8,
    color: "#333",
    lineHeight: 1.3,
  },
  piLabelLast: {
    width: 50,
    backgroundColor: LABEL_BG,
    borderRight:  B,
    borderBottom: B_OUTER,
    padding: "2 3",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 8,
    color: "#333",
    lineHeight: 1.3,
  },
  piValue: {
    flex: 1,
    borderRight:  B_OUTER,
    borderBottom: B,
    padding: "2.5 4",
    justifyContent: "center",
  },
  piValueLast: {
    flex: 1,
    borderRight:  B_OUTER,
    borderBottom: B_OUTER,
    padding: "2.5 4",
    justifyContent: "center",
  },

  // ── 写真 ──
  photoPlaceholder: { fontSize: 7, color: "#bbb", textAlign: "center", lineHeight: 2 },

  // ── Email 行 ──
  emailRow: {
    flexDirection: "row",
    borderLeft:   B_OUTER,
    borderRight:  B_OUTER,
    borderBottom: B,
  },
  emailLabel: {
    width: 50,
    backgroundColor: LABEL_BG,
    borderRight: B,
    padding: "2.5 3",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 8,
    color: "#333",
  },
  emailValue: {
    flex: 1,
    padding: "2.5 4",
    fontSize: 8.5,
    justifyContent: "center",
  },

  // ── 学歴テーブル ──
  eduContainer: {
    borderTop:  B,
    borderLeft: B_OUTER,
    marginTop: 0,
  },
  eduHdrYear:  { width: 48, backgroundColor: LABEL_BG, borderRight: B, borderBottom: B, padding: "2 2", textAlign: "center", fontSize: 8.5, fontWeight: 700 },
  eduHdrMonth: { width: 28, backgroundColor: LABEL_BG, borderRight: B, borderBottom: B, padding: "2 2", textAlign: "center", fontSize: 8.5, fontWeight: 700 },
  eduHdrBody:  { flex: 1,   backgroundColor: LABEL_BG, borderRight: B_OUTER, borderBottom: B, padding: "2 5", textAlign: "center", fontSize: 8.5, fontWeight: 700 },
  eduYear:  { width: 48, borderRight: B, borderBottom: B, padding: "2 2", textAlign: "center", fontSize: 9 },
  eduMonth: { width: 28, borderRight: B, borderBottom: B, padding: "2 2", textAlign: "center", fontSize: 9 },
  eduBody:  { flex: 1,   borderRight: B_OUTER, borderBottom: B, padding: "2 5", fontSize: 9 },

  // ── 詳細テーブル ──
  detailContainer: {
    borderTop:  B,
    borderLeft: B_OUTER,
  },
  detailLabel: {
    width: 50,
    backgroundColor: LABEL_BG,
    borderRight:  B,
    borderBottom: B,
    padding: "3 2",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 8,
    lineHeight: 1.4,
    color: "#333",
  },
  detailValue: {
    flex: 1,
    borderRight:  B_OUTER,
    borderBottom: B,
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
  if (url) {
    return (
      <Image src={url} style={{ width: 90, height: 120, objectFit: "contain" }} />
    );
  }
  return (
    <View style={{ width: 90, height: 120, borderWidth: 0.5, borderColor: "#ccc", alignItems: "center", justifyContent: "center" }}>
      <Text style={s.photoPlaceholder}>証明写真{"\n"}縦4cm×横3cm</Text>
    </View>
  );
}

function PersonalInformationSection({ resume }: { resume: Resume }) {
  const pi  = resume.personalInfo;
  const age = calculateAge(pi.birthDate);
  const address = [
    pi.postalCode ? `〒${pi.postalCode}` : "",
    pi.prefecture, pi.city, pi.streetAddress, pi.building,
  ].filter(Boolean).join(" ");

  return (
    <View style={s.piContainer}>
      {/* 左：個人情報グリッド */}
      <View style={s.piLeft}>

        {/* ふりがな */}
        <View style={s.row}>
          <View style={s.piLabel}><Text>ふりがな</Text></View>
          <View style={[s.piValue, { fontSize: 8.5 }]}>
            <Text>{pi.lastNameKana}　{pi.firstNameKana}</Text>
          </View>
        </View>

        {/* 名前（生年月日を右寄せで同セル内に含める） */}
        <View style={s.row}>
          <View style={s.piLabel}><Text>名前</Text></View>
          <View style={[s.piValue, { paddingTop: 4, paddingBottom: 4 }]}>
            <Text style={{ fontSize: 15, fontWeight: 700 }}>
              {pi.lastName}　{pi.firstName}
            </Text>
            {pi.birthDate && (
              <Text style={{ fontSize: 8, color: SUB, textAlign: "right", marginTop: 2 }}>
                {birthJa(pi.birthDate)}
                {age > 0 ? `（満 ${age} 歳）` : ""}
              </Text>
            )}
          </View>
        </View>

        {/* 住所ふりがな */}
        <View style={s.row}>
          <View style={s.piLabel}><Text>ふりがな</Text></View>
          <View style={[s.piValue, { fontSize: 8 }]}>
            <Text>{pi.addressKana}</Text>
          </View>
        </View>

        {/* 現住所 */}
        <View style={s.row}>
          <View style={s.piLabelLast}><Text>現住所</Text></View>
          <View style={[s.piValueLast, { fontSize: 8.5 }]}>
            <Text>{address}</Text>
          </View>
        </View>

      </View>

      {/* 右：写真 */}
      <View style={s.piRight}>
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
      {/* ヘッダー */}
      <View style={s.row}>
        <View style={s.eduHdrYear}><Text>年</Text></View>
        <View style={s.eduHdrMonth}><Text>月</Text></View>
        <View style={s.eduHdrBody}><Text>学歴</Text></View>
      </View>
      {/* 各学歴 */}
      {education.filter((e) => e.school?.trim()).map((e) => (
        <View key={e.id}>
          <View style={s.row}>
            <View style={s.eduYear}><Text>{e.entryYear}</Text></View>
            <View style={s.eduMonth}><Text>{e.entryMonth}</Text></View>
            <View style={s.eduBody}><Text>{eduEntryText(e)}</Text></View>
          </View>
          {e.exitYear != null && (
            <View style={s.row}>
              <View style={s.eduYear}><Text>{e.exitYear}</Text></View>
              <View style={s.eduMonth}><Text>{e.exitMonth ?? 3}</Text></View>
              <View style={s.eduBody}><Text>{eduExitText(e)}</Text></View>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

function DetailRow({
  label, value = "", minHeight = 36,
}: {
  label: string; value?: string; minHeight?: number;
}) {
  const fs = adaptFs(value);
  return (
    <View style={s.row} wrap={false}>
      <View style={[s.detailLabel, { minHeight }]}>
        <Text style={{ textAlign: "center" }}>{label}</Text>
      </View>
      <View style={[s.detailValue, { minHeight }]}>
        <Text style={{ fontSize: fs, lineHeight: 1.55 }}>{value}</Text>
      </View>
    </View>
  );
}

function EntrySheetDetailTable({ resume }: { resume: Resume }) {
  return (
    <View style={s.detailContainer}>
      <DetailRow label={"ゼミ・\n研究テーマ"} value=""                         minHeight={58} />
      <DetailRow label={"クラブ・\nサークル"}  value=""                         minHeight={52} />
      <DetailRow label={"保有資格"}            value={licensesToText(resume.licenses)} minHeight={28} />
      <DetailRow label={"アルバイト\n経験"}    value={workToText(resume.workHistory)}  minHeight={52} />
      <DetailRow label={"自己PR"}             value={resume.selfPR}             minHeight={84} />
      <DetailRow label={"志望動機"}            value={resume.motivation}         minHeight={92} />
    </View>
  );
}

// ─── メインエクスポート ────────────────────────────────────────────────────────
export function ResumePdfDocument({ resume }: { resume: Resume }) {
  return (
    <Document
      title={resume.title}
      author={`${resume.personalInfo.lastName} ${resume.personalInfo.firstName}`}
    >
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
