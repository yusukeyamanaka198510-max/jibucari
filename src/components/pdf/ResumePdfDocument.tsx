import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Resume } from "@/types";
import { calculateAge } from "@/domain/entities/resume";

Font.register({
  family: "NotoSansJP",
  fonts: [
    { src: "/fonts/NotoSansJP-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/NotoSansJP-Bold.ttf", fontWeight: 700 },
  ],
});

// ─── 和暦変換ユーティリティ ───────────────────────────────────────────────
function toEraYear(year: number, month: number): string {
  const d = new Date(year, month - 1, 1);
  if (d >= new Date(2019, 4, 1))  return `令和${year - 2018}`;
  if (d >= new Date(1989, 0, 8))  return `平成${year - 1988}`;
  if (d >= new Date(1926, 0, 25)) return `昭和${year - 1925}`;
  return `大正${year - 1911}`;
}

function birthDateJa(dateStr: string): string {
  if (!dateStr) return "";
  const d  = new Date(dateStr);
  const y  = d.getFullYear();
  const m  = d.getMonth() + 1;
  const dd = d.getDate();
  let era = "昭和", eraY = y - 1925;
  if (d >= new Date(2019, 4, 1))  { era = "令和";  eraY = y - 2018; }
  else if (d >= new Date(1989, 0, 8))  { era = "平成";  eraY = y - 1988; }
  return `${era}${eraY}年${m}月${dd}日生`;
}

function todayJa(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const dd = d.getDate();
  const eraY = y >= 2019 ? `令和${y - 2018}` : y >= 1989 ? `平成${y - 1988}` : `昭和${y - 1925}`;
  return `${eraY}年${m}月${dd}日 現在`;
}

// ─── スタイル ─────────────────────────────────────────────────────────────
const BRD = "0.5 solid #555";
const LABEL_BG = "#EEF2F7";
const HDR_BG   = "#2B4C8B";

const s = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    fontSize: 7.5,
    padding: "10mm 8mm",
    color: "#111",
    lineHeight: 1.5,
  },

  // ── ヘッダー
  title: {
    fontSize: 16,
    fontWeight: 700,
    textAlign: "center",
    letterSpacing: 8,
    marginBottom: 2,
  },
  dateRow: {
    fontSize: 7,
    textAlign: "right",
    color: "#555",
    marginBottom: 5,
  },

  // ── 基本情報テーブル (borderTop + borderLeft はコンテナで指定)
  row: { flexDirection: "row" },

  // ラベルセル
  lc: {
    backgroundColor: LABEL_BG,
    borderRight: BRD,
    borderBottom: BRD,
    padding: "2 4",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 7,
    color: "#444",
    lineHeight: 1.3,
  },

  // 値セル
  vc: {
    borderRight: BRD,
    borderBottom: BRD,
    padding: "2 5",
    lineHeight: 1.5,
  },

  // ── 学歴・職歴テーブルのセル
  yrCell: {
    width: 36,
    borderRight: BRD,
    borderBottom: BRD,
    padding: "2 3",
    textAlign: "center",
    fontSize: 7,
  },
  moCell: {
    width: 18,
    borderRight: BRD,
    borderBottom: BRD,
    padding: "2 2",
    textAlign: "center",
    fontSize: 7,
  },
  entryCell: {
    flex: 1,
    borderRight: BRD,
    borderBottom: BRD,
    padding: "2 5",
  },

  // セクションヘッダー行の右カラム（青帯タイトル）
  sectionBand: {
    flex: 1,
    backgroundColor: HDR_BG,
    color: "#fff",
    fontWeight: 700,
    fontSize: 8,
    padding: "2.5 8",
    borderRight: BRD,
    borderBottom: BRD,
    textAlign: "center",
    letterSpacing: 4,
  },

  // テキストボックス（志望動機・自己PR）
  boxHeader: {
    backgroundColor: HDR_BG,
    color: "#fff",
    fontWeight: 700,
    fontSize: 8,
    padding: "2.5 8",
    borderTop: BRD,
    borderLeft: BRD,
    borderRight: BRD,
    borderBottom: BRD,
  },
  textBox: {
    borderLeft: BRD,
    borderRight: BRD,
    borderBottom: BRD,
    padding: "4 6",
    minHeight: 48,
    marginBottom: 4,
  },
});

const GENDER_JA: Record<string, string> = {
  male: "男",
  female: "女",
  other: "その他",
  prefer_not_to_say: "―",
};

const ENTRY_JA: Record<string, string> = {
  enrolled: "入学",
  transferred_in: "転入",
};
const EXIT_JA: Record<string, string> = {
  graduated: "卒業",
  dropped_out: "中退",
  transferred: "転学",
};

interface Props { resume: Resume }

export function ResumePdfDocument({ resume }: Props) {
  const { personalInfo: pi, education, workHistory, licenses } = resume;
  const age = calculateAge(pi.birthDate);

  return (
    <Document title={resume.title} author={`${pi.lastName} ${pi.firstName}`}>
      <Page size="A4" style={s.page}>

        {/* ── タイトル ───────────────────────────────── */}
        <Text style={s.title}>履　歴　書</Text>
        <Text style={s.dateRow}>{todayJa()}</Text>

        {/* ── 基本情報 ────────────────────────────────
             左: 個人情報グリッド   右: 写真
        ─────────────────────────────────────────── */}
        <View style={{ flexDirection: "row", borderTop: BRD, borderLeft: BRD, marginBottom: 5 }}>
          {/* 左側グリッド */}
          <View style={{ flex: 1 }}>
            {/* ふりがな */}
            <View style={s.row}>
              <View style={[s.lc, { width: 55 }]}><Text>ふりがな</Text></View>
              <View style={[s.vc, { flex: 1, fontSize: 7 }]}>
                <Text>{pi.lastNameKana}　{pi.firstNameKana}</Text>
              </View>
            </View>
            {/* 氏名 */}
            <View style={s.row}>
              <View style={[s.lc, { width: 55 }]}><Text>氏　名</Text></View>
              <View style={[s.vc, { flex: 1, paddingVertical: 4 }]}>
                <Text style={{ fontSize: 13, fontWeight: 700 }}>
                  {pi.lastName}　{pi.firstName}
                </Text>
              </View>
            </View>
            {/* 生年月日・性別 */}
            <View style={s.row}>
              <View style={[s.lc, { width: 55 }]}><Text>生年月日</Text></View>
              <View style={[s.vc, { width: 110 }]}>
                <Text>{birthDateJa(pi.birthDate)}</Text>
                {age > 0 && <Text style={{ fontSize: 6.5, color: "#555" }}>（満{age}歳）</Text>}
              </View>
              <View style={[s.lc, { width: 30 }]}><Text>性別</Text></View>
              <View style={[s.vc, { flex: 1 }]}>
                <Text>{GENDER_JA[pi.gender] ?? ""}</Text>
              </View>
            </View>
            {/* 住所ふりがな */}
            <View style={s.row}>
              <View style={[s.lc, { width: 55 }]}><Text>住所ふりがな</Text></View>
              <View style={[s.vc, { flex: 1, fontSize: 7 }]}>
                <Text>{pi.addressKana}</Text>
              </View>
            </View>
            {/* 現住所 */}
            <View style={s.row}>
              <View style={[s.lc, { width: 55 }]}><Text>現住所</Text></View>
              <View style={[s.vc, { flex: 1 }]}>
                <Text>
                  〒{pi.postalCode}　{pi.prefecture}{pi.city}{pi.streetAddress}
                  {pi.building ? `　${pi.building}` : ""}
                </Text>
              </View>
            </View>
            {/* 電話・メール */}
            <View style={s.row}>
              <View style={[s.lc, { width: 55 }]}><Text>携帯電話</Text></View>
              <View style={[s.vc, { width: 100 }]}><Text>{pi.mobilePhone}</Text></View>
              <View style={[s.lc, { width: 40 }]}><Text>メール</Text></View>
              <View style={[s.vc, { flex: 1, fontSize: 7 }]}><Text>{pi.email}</Text></View>
            </View>
          </View>

          {/* 写真欄 */}
          <View
            style={{
              width: 90,
              borderLeft: BRD,
              borderBottom: BRD,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f8f8f8",
            }}
          >
            {pi.photoUrl ? (
              <Image src={pi.photoUrl} style={{ width: 86, height: 110, objectFit: "cover" }} />
            ) : (
              <View style={{ alignItems: "center", gap: 3 }}>
                <Text style={{ fontSize: 7, color: "#bbb", textAlign: "center", lineHeight: 1.6 }}>
                  写真貼付欄
                </Text>
                <Text style={{ fontSize: 6, color: "#ccc", textAlign: "center" }}>縦4cm×横3cm</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── 学歴 ────────────────────────────────────
             「年」「月」カラム + 内容カラム（青帯見出し）
        ─────────────────────────────────────────── */}
        {education.length > 0 && (
          <View style={{ borderTop: BRD, borderLeft: BRD, marginBottom: 5 }}>
            {/* セクション見出し行 */}
            <View style={s.row}>
              <View style={[s.lc, { width: 36, fontSize: 6.5 }]}><Text>年</Text></View>
              <View style={[s.lc, { width: 18, fontSize: 6.5 }]}><Text>月</Text></View>
              <View style={s.sectionBand}><Text>学　歴</Text></View>
            </View>

            {education.map((e) => (
              <View key={e.id}>
                <View style={s.row}>
                  <View style={s.yrCell}><Text>{toEraYear(e.entryYear, e.entryMonth)}</Text></View>
                  <View style={s.moCell}><Text>{e.entryMonth}</Text></View>
                  <View style={s.entryCell}>
                    <Text>
                      {e.school}
                      {e.faculty ? `　${e.faculty}` : ""}
                      {e.department ? `　${e.department}` : ""}
                      　{ENTRY_JA[e.entryType] ?? "入学"}
                    </Text>
                  </View>
                </View>
                {e.exitYear != null && (
                  <View style={s.row}>
                    <View style={s.yrCell}>
                      <Text>{toEraYear(e.exitYear, e.exitMonth ?? 3)}</Text>
                    </View>
                    <View style={s.moCell}><Text>{e.exitMonth ?? 3}</Text></View>
                    <View style={s.entryCell}>
                      <Text>
                        {e.school}　{EXIT_JA[e.exitType ?? "graduated"] ?? "卒業"}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ── 職歴 ─────────────────────────────────── */}
        <View style={{ borderTop: BRD, borderLeft: BRD, marginBottom: 5 }}>
          <View style={s.row}>
            <View style={[s.lc, { width: 36, fontSize: 6.5 }]}><Text>年</Text></View>
            <View style={[s.lc, { width: 18, fontSize: 6.5 }]}><Text>月</Text></View>
            <View style={s.sectionBand}><Text>職　歴</Text></View>
          </View>

          {workHistory.length === 0 && (
            <View style={s.row}>
              <View style={s.yrCell}><Text> </Text></View>
              <View style={s.moCell}><Text> </Text></View>
              <View style={[s.entryCell, { color: "#aaa" }]}><Text>なし</Text></View>
            </View>
          )}

          {workHistory.map((w) => (
            <View key={w.id}>
              <View style={s.row}>
                <View style={s.yrCell}><Text>{toEraYear(w.entryYear, w.entryMonth)}</Text></View>
                <View style={s.moCell}><Text>{w.entryMonth}</Text></View>
                <View style={s.entryCell}>
                  <Text>
                    {w.company}
                    {w.department ? `　${w.department}` : ""}
                    {w.position ? `　${w.position}` : ""}
                    　入社
                  </Text>
                </View>
              </View>
              {(w.isCurrent || w.exitYear != null) && (
                <View style={s.row}>
                  <View style={s.yrCell}>
                    <Text>{w.isCurrent ? "" : toEraYear(w.exitYear!, w.exitMonth ?? 3)}</Text>
                  </View>
                  <View style={s.moCell}>
                    <Text>{w.isCurrent ? "" : String(w.exitMonth ?? 3)}</Text>
                  </View>
                  <View style={s.entryCell}>
                    <Text>{w.isCurrent ? "現在に至る" : "同社　退職"}</Text>
                  </View>
                </View>
              )}
            </View>
          ))}

          {/* 以上 */}
          <View style={s.row}>
            <View style={[s.yrCell, { borderRight: "none" }]}><Text> </Text></View>
            <View style={[s.moCell, { borderRight: "none" }]}><Text> </Text></View>
            <View style={[s.entryCell, { textAlign: "right" }]}><Text>以上</Text></View>
          </View>
        </View>

        {/* ── 免許・資格 ──────────────────────────────── */}
        {licenses.length > 0 && (
          <View style={{ borderTop: BRD, borderLeft: BRD, marginBottom: 5 }}>
            <View style={s.row}>
              <View style={[s.lc, { width: 36, fontSize: 6.5 }]}><Text>年</Text></View>
              <View style={[s.lc, { width: 18, fontSize: 6.5 }]}><Text>月</Text></View>
              <View style={s.sectionBand}><Text>免許・資格</Text></View>
            </View>
            {licenses.map((l) => (
              <View key={l.id} style={s.row}>
                <View style={s.yrCell}><Text>{toEraYear(l.year, l.month)}</Text></View>
                <View style={s.moCell}><Text>{l.month}</Text></View>
                <View style={s.entryCell}><Text>{l.name}　取得</Text></View>
              </View>
            ))}
          </View>
        )}

        {/* ── 志望動機 ─────────────────────────────────── */}
        <View style={s.boxHeader}><Text>志望動機</Text></View>
        <View style={s.textBox}><Text>{resume.motivation || "　"}</Text></View>

        {/* ── 自己PR ──────────────────────────────────── */}
        <View style={s.boxHeader}><Text>自己ＰＲ</Text></View>
        <View style={s.textBox}><Text>{resume.selfPR || "　"}</Text></View>

        {/* ── 趣味・特技 ──────────────────────────────── */}
        {resume.hobbies && (
          <>
            <View style={s.boxHeader}><Text>趣味・特技</Text></View>
            <View style={[s.textBox, { minHeight: 28 }]}><Text>{resume.hobbies}</Text></View>
          </>
        )}

      </Page>
    </Document>
  );
}
