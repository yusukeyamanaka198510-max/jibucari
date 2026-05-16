import {
  Document, Page, Text, View, Image, StyleSheet, Font,
} from "@react-pdf/renderer";
import type { Resume } from "@/types";
import { calculateAge } from "@/domain/entities/resume";

Font.register({
  family: "NotoSansJP",
  fonts: [
    { src: "/fonts/NotoSansJP-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/NotoSansJP-Bold.ttf",    fontWeight: 700 },
  ],
});

// ─── 和暦 ────────────────────────────────────────────────────────────────────
function eraYear(year: number, month: number): string {
  const d = new Date(year, month - 1, 1);
  if (d >= new Date(2019, 4, 1))  return `令和${year - 2018}`;
  if (d >= new Date(1989, 0, 8))  return `平成${year - 1988}`;
  if (d >= new Date(1926, 0, 25)) return `昭和${year - 1925}`;
  return `大正${year - 1911}`;
}

function birthJa(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const y = d.getFullYear(), m = d.getMonth() + 1, dd = d.getDate();
  let era = "昭和", eraY = y - 1925;
  if (d >= new Date(2019, 4, 1)) { era = "令和";  eraY = y - 2018; }
  else if (d >= new Date(1989, 0, 8)) { era = "平成"; eraY = y - 1988; }
  return `${era}${eraY}年${m}月${dd}日生`;
}

function todayJa(): string {
  const d = new Date();
  const y = d.getFullYear(), m = d.getMonth() + 1, dd = d.getDate();
  const era = y >= 2019 ? `令和${y - 2018}` : y >= 1989 ? `平成${y - 1988}` : `昭和${y - 1925}`;
  return `${era}年${m}月${dd}日 現在`;
}

// ─── スタイル ─────────────────────────────────────────────────────────────────
// セル間の二重罫線を避けるため、コンテナに borderTop+borderLeft を持たせ、
// 各セルは borderRight+borderBottom のみ持つ構造にしている。
const B   = "0.5 solid #444";   // 罫線
const LBG = "#F0F0F0";          // ラベルセル背景（薄グレー）
const SBG = "#E8E8E8";          // セクション区切り行背景

const s = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    fontSize: 8,
    padding: "12mm 10mm 10mm",
    color: "#111",
    lineHeight: 1.45,
  },

  // ヘッダー
  title: {
    fontSize: 18,
    fontWeight: 700,
    textAlign: "center",
    letterSpacing: 10,
    marginBottom: 3,
  },
  dateRow: {
    fontSize: 7,
    textAlign: "right",
    color: "#555",
    marginBottom: 5,
  },

  // 汎用行
  row: { flexDirection: "row" },

  // ─── 基本情報テーブルのセル ───────────────────────────────
  // ラベルセル（薄グレー背景、中央寄せ）
  lc: {
    backgroundColor: LBG,
    borderRight: B, borderBottom: B,
    padding: "2 3",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 7,
    color: "#333",
    lineHeight: 1.3,
  },
  // 値セル（白背景）
  vc: {
    borderRight: B, borderBottom: B,
    padding: "2 4",
  },

  // ─── 学歴・職歴テーブルのセル ────────────────────────────
  yr: {  // 年セル
    width: 34,
    borderRight: B, borderBottom: B,
    padding: "2 2",
    textAlign: "center",
    fontSize: 7.5,
  },
  mo: {  // 月セル
    width: 16,
    borderRight: B, borderBottom: B,
    padding: "2 1",
    textAlign: "center",
    fontSize: 7.5,
  },
  ec: {  // 内容セル
    flex: 1,
    borderRight: B, borderBottom: B,
    padding: "2 5",
  },
  // セクション区切り行（「学　歴」「職　歴」表示）
  divRow: {
    backgroundColor: SBG,
    borderRight: B, borderBottom: B,
    flex: 1,
    padding: "2 5",
    textAlign: "center",
    fontWeight: 700,
    fontSize: 8,
    letterSpacing: 4,
  },

  // ─── 志望動機・自己PRのテキストボックス ──────────────────
  boxTitle: {
    backgroundColor: LBG,
    borderRight: B, borderBottom: B,
    borderLeft: B,
    padding: "2 5",
    fontWeight: 700,
    fontSize: 7.5,
  },
  box: {
    borderRight: B, borderBottom: B,
    borderLeft: B,
    padding: "4 5",
    minHeight: 50,
    marginBottom: 4,
  },
});

const GENDER: Record<string, string> = {
  male: "男", female: "女", other: "その他", prefer_not_to_say: "―",
};
const ENTRY: Record<string, string> = { enrolled: "入学", transferred_in: "転入" };
const EXIT:  Record<string, string> = { graduated: "卒業", dropped_out: "中退", transferred: "転学" };

export function ResumePdfDocument({ resume }: { resume: Resume }) {
  const { personalInfo: pi, education, workHistory, licenses } = resume;
  const age = calculateAge(pi.birthDate);

  return (
    <Document title={resume.title} author={`${pi.lastName} ${pi.firstName}`}>
      <Page size="A4" style={s.page}>

        {/* ────────────────── タイトル ────────────────── */}
        <Text style={s.title}>履　歴　書</Text>
        <Text style={s.dateRow}>{todayJa()}</Text>

        {/* ────────────────── 基本情報 ────────────────── */}
        {/*
          構造：
            コンテナ（borderTop+borderLeft）
              左側フレックス（個人情報グリッド）
              右側（写真欄、borderLeft+borderBottom+borderRight）
        */}
        <View style={{ flexDirection: "row", borderTop: B, borderLeft: B, marginBottom: 5 }}>

          {/* 左：個人情報グリッド */}
          <View style={{ flex: 1 }}>

            {/* ふりがな */}
            <View style={s.row}>
              <View style={[s.lc, { width: 52 }]}><Text>ふりがな</Text></View>
              <View style={[s.vc, { flex: 1, fontSize: 7 }]}>
                <Text>{pi.lastNameKana}　{pi.firstNameKana}</Text>
              </View>
            </View>

            {/* 氏名 */}
            <View style={s.row}>
              <View style={[s.lc, { width: 52 }]}><Text>氏　名</Text></View>
              <View style={[s.vc, { flex: 1, paddingVertical: 5 }]}>
                <Text style={{ fontSize: 14, fontWeight: 700 }}>
                  {pi.lastName}　{pi.firstName}
                </Text>
              </View>
            </View>

            {/* 生年月日・性別 */}
            <View style={s.row}>
              <View style={[s.lc, { width: 52 }]}><Text>生年月日</Text></View>
              <View style={[s.vc, { width: 108 }]}>
                <Text>{birthJa(pi.birthDate)}</Text>
                {age > 0 && (
                  <Text style={{ fontSize: 6.5, color: "#555" }}>（満{age}歳）</Text>
                )}
              </View>
              <View style={[s.lc, { width: 28 }]}><Text>性別</Text></View>
              <View style={[s.vc, { flex: 1 }]}>
                <Text>{GENDER[pi.gender] ?? ""}</Text>
              </View>
            </View>

            {/* 住所ふりがな */}
            <View style={s.row}>
              <View style={[s.lc, { width: 52 }]}><Text>住所ふりがな</Text></View>
              <View style={[s.vc, { flex: 1, fontSize: 7 }]}>
                <Text>{pi.addressKana}</Text>
              </View>
            </View>

            {/* 現住所 */}
            <View style={s.row}>
              <View style={[s.lc, { width: 52 }]}><Text>現住所</Text></View>
              <View style={[s.vc, { flex: 1 }]}>
                <Text>〒{pi.postalCode}　{pi.prefecture}{pi.city}{pi.streetAddress}{pi.building ? `　${pi.building}` : ""}</Text>
              </View>
            </View>

            {/* 電話・メール */}
            <View style={s.row}>
              <View style={[s.lc, { width: 52 }]}><Text>携帯電話</Text></View>
              <View style={[s.vc, { width: 98 }]}><Text>{pi.mobilePhone}</Text></View>
              <View style={[s.lc, { width: 36 }]}><Text>メール</Text></View>
              <View style={[s.vc, { flex: 1, fontSize: 7 }]}><Text>{pi.email}</Text></View>
            </View>

          </View>

          {/* 右：写真欄 */}
          <View style={{
            width: 86,
            borderLeft: B,
            borderBottom: B,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fafafa",
          }}>
            {pi.photoUrl ? (
              <Image src={pi.photoUrl} style={{ width: 82, height: 108, objectFit: "cover" }} />
            ) : (
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 7, color: "#bbb", textAlign: "center", lineHeight: 1.8 }}>写真貼付欄</Text>
                <Text style={{ fontSize: 6, color: "#ccc", textAlign: "center" }}>縦4cm×横3cm</Text>
              </View>
            )}
          </View>

        </View>

        {/* ────────────────── 学歴・職歴（合算テーブル）────────────────── */}
        <View style={{ borderTop: B, borderLeft: B, marginBottom: 5 }}>

          {/* 列見出し */}
          <View style={s.row}>
            <View style={[s.lc, { width: 34 }]}><Text>年</Text></View>
            <View style={[s.lc, { width: 16 }]}><Text>月</Text></View>
            <View style={[s.lc, { flex: 1, textAlign: "center", letterSpacing: 4 }]}>
              <Text>学　歴　　　　職　歴</Text>
            </View>
          </View>

          {/* 学歴 */}
          {education.length > 0 && (
            <>
              {/* 「学　歴」区切り */}
              <View style={s.row}>
                <View style={[s.yr, { backgroundColor: SBG }]}><Text> </Text></View>
                <View style={[s.mo, { backgroundColor: SBG }]}><Text> </Text></View>
                <View style={s.divRow}><Text>学　　　歴</Text></View>
              </View>

              {education.map((e) => (
                <View key={e.id}>
                  <View style={s.row}>
                    <View style={s.yr}><Text>{eraYear(e.entryYear, e.entryMonth)}</Text></View>
                    <View style={s.mo}><Text>{e.entryMonth}</Text></View>
                    <View style={s.ec}>
                      <Text>
                        {e.school}
                        {e.faculty ? `　${e.faculty}` : ""}
                        {e.department ? `　${e.department}` : ""}
                        　{ENTRY[e.entryType] ?? "入学"}
                      </Text>
                    </View>
                  </View>
                  {e.exitYear != null && (
                    <View style={s.row}>
                      <View style={s.yr}><Text>{eraYear(e.exitYear, e.exitMonth ?? 3)}</Text></View>
                      <View style={s.mo}><Text>{e.exitMonth ?? 3}</Text></View>
                      <View style={s.ec}>
                        <Text>{e.school}　{EXIT[e.exitType ?? "graduated"] ?? "卒業"}</Text>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </>
          )}

          {/* 職歴 */}
          {/* 「職　歴」区切り */}
          <View style={s.row}>
            <View style={[s.yr, { backgroundColor: SBG }]}><Text> </Text></View>
            <View style={[s.mo, { backgroundColor: SBG }]}><Text> </Text></View>
            <View style={s.divRow}><Text>職　　　歴</Text></View>
          </View>

          {workHistory.length === 0 && (
            <View style={s.row}>
              <View style={s.yr}><Text> </Text></View>
              <View style={s.mo}><Text> </Text></View>
              <View style={[s.ec, { color: "#999" }]}><Text>なし</Text></View>
            </View>
          )}

          {workHistory.map((w) => (
            <View key={w.id}>
              <View style={s.row}>
                <View style={s.yr}><Text>{eraYear(w.entryYear, w.entryMonth)}</Text></View>
                <View style={s.mo}><Text>{w.entryMonth}</Text></View>
                <View style={s.ec}>
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
                  <View style={s.yr}>
                    <Text>{w.isCurrent ? "" : eraYear(w.exitYear!, w.exitMonth ?? 3)}</Text>
                  </View>
                  <View style={s.mo}>
                    <Text>{w.isCurrent ? "" : String(w.exitMonth ?? 3)}</Text>
                  </View>
                  <View style={s.ec}>
                    <Text>{w.isCurrent ? "現在に至る" : "同社　退職"}</Text>
                  </View>
                </View>
              )}
            </View>
          ))}

          {/* 以上 */}
          <View style={s.row}>
            <View style={[s.yr, { borderRight: "none" }]}><Text> </Text></View>
            <View style={[s.mo, { borderRight: "none" }]}><Text> </Text></View>
            <View style={[s.ec, { textAlign: "right" }]}><Text>以　上</Text></View>
          </View>

        </View>

        {/* ────────────────── 免許・資格 ────────────────── */}
        {licenses.length > 0 && (
          <View style={{ borderTop: B, borderLeft: B, marginBottom: 5 }}>
            <View style={s.row}>
              <View style={[s.lc, { width: 34 }]}><Text>年</Text></View>
              <View style={[s.lc, { width: 16 }]}><Text>月</Text></View>
              <View style={[s.lc, { flex: 1, textAlign: "center" }]}><Text>免許・資格</Text></View>
            </View>
            {licenses.map((l) => (
              <View key={l.id} style={s.row}>
                <View style={s.yr}><Text>{eraYear(l.year, l.month)}</Text></View>
                <View style={s.mo}><Text>{l.month}</Text></View>
                <View style={s.ec}><Text>{l.name}　取得</Text></View>
              </View>
            ))}
          </View>
        )}

        {/* ────────────────── 志望動機 ────────────────── */}
        <View style={{ borderTop: B, marginBottom: 5 }}>
          <View style={s.boxTitle}><Text>志望動機</Text></View>
          <View style={[s.box, { borderTop: "none" }]}>
            <Text>{resume.motivation || "　"}</Text>
          </View>
        </View>

        {/* ────────────────── 自己PR ────────────────── */}
        <View style={{ borderTop: B, marginBottom: 5 }}>
          <View style={s.boxTitle}><Text>自己ＰＲ</Text></View>
          <View style={[s.box, { borderTop: "none" }]}>
            <Text>{resume.selfPR || "　"}</Text>
          </View>
        </View>

        {/* ────────────────── 趣味・特技 ────────────────── */}
        {resume.hobbies && (
          <View style={{ borderTop: B }}>
            <View style={s.boxTitle}><Text>趣味・特技</Text></View>
            <View style={[s.box, { borderTop: "none", minHeight: 28 }]}>
              <Text>{resume.hobbies}</Text>
            </View>
          </View>
        )}

      </Page>
    </Document>
  );
}
