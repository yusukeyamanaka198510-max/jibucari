import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Resume } from "@/types";
import { formatYearMonth } from "@/lib/utils";
import { calculateAge } from "@/domain/entities/resume";

// 日本語フォント登録（Noto Sans JPを使用 — publicフォルダに配置する運用）
Font.register({
  family: "NotoSansJP",
  fonts: [
    { src: "/fonts/NotoSansJP-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/NotoSansJP-Bold.ttf", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    fontSize: 8,
    padding: "15mm 10mm",
    color: "#111",
    lineHeight: 1.5,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 6,
  },
  dateRow: {
    fontSize: 7,
    textAlign: "right",
    marginBottom: 10,
  },
  // ─── セクション ───────────────────────────────────────
  section: { marginBottom: 6 },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    backgroundColor: "#f0f4ff",
    padding: "2 4",
    marginBottom: 3,
  },
  // ─── 基本情報テーブル ──────────────────────────────────
  infoGrid: {
    flexDirection: "row",
    gap: 8,
  },
  infoBlock: { flex: 1 },
  infoRow: {
    flexDirection: "row",
    borderBottom: "0.5 solid #ccc",
    paddingVertical: 2,
    gap: 4,
  },
  infoLabel: {
    width: 50,
    color: "#555",
    fontSize: 7,
  },
  infoValue: { flex: 1 },
  // ─── 学歴・職歴テーブル ────────────────────────────────
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5 solid #ddd",
    paddingVertical: 2,
    gap: 4,
  },
  tableColDate: { width: 40, color: "#333" },
  tableColContent: { flex: 1 },
  tableColStatus: { width: 30, color: "#555" },
  // ─── テキストボックス ──────────────────────────────────
  textBox: {
    border: "0.5 solid #ccc",
    padding: "4 6",
    minHeight: 50,
    borderRadius: 2,
  },
});

const STATUS_JA: Record<string, string> = {
  graduated: "卒業",
  enrolled: "在学中",
  dropped_out: "中退",
  transferred: "転学",
  joined: "入社",
  resigned: "退職",
  current: "在職中",
};

interface Props {
  resume: Resume;
}

/**
 * JIS規格に準拠した履歴書 PDF ドキュメント。
 * @react-pdf/renderer の仕様上、Tailwind は使えないため StyleSheet を使用する。
 */
export function ResumePdfDocument({ resume }: Props) {
  const { personalInfo: pi, education, workHistory, licenses } = resume;
  const today = new Date();
  const age = calculateAge(pi.birthDate);

  return (
    <Document title={resume.title} author={`${pi.lastName} ${pi.firstName}`}>
      <Page size="A4" style={styles.page}>
        {/* タイトル */}
        <Text style={styles.title}>履　歴　書</Text>
        <Text style={styles.dateRow}>
          {today.getFullYear()}年{today.getMonth() + 1}月{today.getDate()}日 現在
        </Text>

        {/* 基本情報 */}
        <View style={styles.section}>
          <View style={styles.infoGrid}>
            <View style={[styles.infoBlock, { flex: 2 }]}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>氏名（フリガナ）</Text>
                <Text style={styles.infoValue}>
                  {pi.lastNameKana} {pi.firstNameKana}
                </Text>
              </View>
              <View style={[styles.infoRow, { paddingVertical: 4 }]}>
                <Text style={[styles.infoLabel, { alignSelf: "center" }]}>氏名</Text>
                <Text style={[styles.infoValue, { fontSize: 13, fontWeight: 700 }]}>
                  {pi.lastName}　{pi.firstName}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>生年月日</Text>
                <Text style={styles.infoValue}>
                  {pi.birthDate
                    ? `${new Date(pi.birthDate).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })} （満${age}歳）`
                    : ""}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>住所（フリガナ）</Text>
                <Text style={styles.infoValue}>{pi.addressKana}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>住所</Text>
                <Text style={styles.infoValue}>
                  〒{pi.postalCode}　{pi.prefecture}{pi.city}{pi.streetAddress}{pi.building ? `　${pi.building}` : ""}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>携帯</Text>
                <Text style={styles.infoValue}>{pi.mobilePhone}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>メール</Text>
                <Text style={styles.infoValue}>{pi.email}</Text>
              </View>
            </View>
            {/* 写真枠 */}
            <View
              style={{
                width: 80,
                height: 100,
                border: "0.5 solid #aaa",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 7, color: "#aaa" }}>写真貼付欄</Text>
            </View>
          </View>
        </View>

        {/* 学歴 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>学歴</Text>
          {education.map((e) => (
            <View key={e.id} style={styles.tableRow}>
              <Text style={styles.tableColDate}>
                {formatYearMonth(e.year, e.month)}
              </Text>
              <Text style={styles.tableColContent}>
                {e.school}
                {e.faculty ? `　${e.faculty}` : ""}
                {e.department ? `　${e.department}` : ""}
              </Text>
              <Text style={styles.tableColStatus}>{STATUS_JA[e.status] ?? ""}</Text>
            </View>
          ))}
        </View>

        {/* 職歴 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>職歴</Text>
          {workHistory.map((w) => (
            <View key={w.id} style={styles.tableRow}>
              <Text style={styles.tableColDate}>
                {formatYearMonth(w.year, w.month)}
              </Text>
              <Text style={styles.tableColContent}>
                {w.company}
                {w.department ? `　${w.department}` : ""}
                {w.position ? `　${w.position}` : ""}
              </Text>
              <Text style={styles.tableColStatus}>{STATUS_JA[w.status] ?? ""}</Text>
            </View>
          ))}
          {workHistory.length === 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.tableColContent, { color: "#aaa" }]}>なし</Text>
            </View>
          )}
          <View style={[styles.tableRow, { borderBottom: "none" }]}>
            <Text style={{ flex: 1, textAlign: "right", color: "#333" }}>以上</Text>
          </View>
        </View>

        {/* 資格・免許 */}
        {licenses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>資格・免許</Text>
            {licenses.map((l) => (
              <View key={l.id} style={styles.tableRow}>
                <Text style={styles.tableColDate}>
                  {formatYearMonth(l.year, l.month)}
                </Text>
                <Text style={styles.tableColContent}>{l.name}</Text>
                <Text style={styles.tableColStatus}>取得</Text>
              </View>
            ))}
          </View>
        )}

        {/* 志望動機 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>志望動機</Text>
          <View style={styles.textBox}>
            <Text>{resume.motivation || "　"}</Text>
          </View>
        </View>

        {/* 自己PR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>自己PR</Text>
          <View style={styles.textBox}>
            <Text>{resume.selfPR || "　"}</Text>
          </View>
        </View>

        {/* 趣味・特技 */}
        {resume.hobbies && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>趣味・特技</Text>
            <View style={[styles.textBox, { minHeight: 24 }]}>
              <Text>{resume.hobbies}</Text>
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
