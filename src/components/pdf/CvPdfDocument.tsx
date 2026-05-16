import {
  Document, Page, Text, View, StyleSheet, Font,
} from "@react-pdf/renderer";
import type { CV } from "@/types/cv";

Font.register({
  family: "NotoSansJP",
  fonts: [
    { src: "/fonts/NotoSansJP-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/NotoSansJP-Bold.ttf",    fontWeight: 700 },
  ],
});

function eraYear(year: number, month: number): string {
  const d = new Date(year, month - 1, 1);
  if (d >= new Date(2019, 4, 1))  return `令和${year - 2018}`;
  if (d >= new Date(1989, 0, 8))  return `平成${year - 1988}`;
  return `昭和${year - 1925}`;
}

function todayJa(): string {
  const d = new Date();
  const y = d.getFullYear();
  const era = y >= 2019 ? `令和${y - 2018}` : y >= 1989 ? `平成${y - 1988}` : `昭和${y - 1925}`;
  return `${era}年${d.getMonth() + 1}月${d.getDate()}日 作成`;
}

const B   = "0.5 solid #444";
const LBG = "#F0F0F0";
const SBG = "#E8E8E8";

const s = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    fontSize: 8,
    padding: "12mm 12mm 10mm",
    color: "#111",
    lineHeight: 1.5,
  },
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
    marginBottom: 6,
  },
  sectionTitle: {
    backgroundColor: SBG,
    borderTop: B, borderLeft: B, borderRight: B, borderBottom: B,
    padding: "3 6",
    fontWeight: 700,
    fontSize: 8,
    letterSpacing: 2,
    marginTop: 5,
  },
  sectionBody: {
    borderLeft: B, borderRight: B, borderBottom: B,
    padding: "5 6",
    minHeight: 24,
  },
  row: { flexDirection: "row" },
  lc: {
    backgroundColor: LBG,
    borderRight: B, borderBottom: B,
    padding: "2 4",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 7,
    color: "#333",
  },
  vc: {
    borderRight: B, borderBottom: B,
    padding: "2 5",
  },
});

export function CvPdfDocument({ cv }: { cv: CV }) {
  return (
    <Document title={cv.title} author={`${cv.lastName} ${cv.firstName}`}>
      <Page size="A4" style={s.page}>

        {/* タイトル */}
        <Text style={s.title}>職　務　経　歴　書</Text>
        <Text style={s.dateRow}>{todayJa()}</Text>

        {/* 基本情報 */}
        <View style={{ borderTop: B, borderLeft: B }}>
          <View style={s.row}>
            <View style={[s.lc, { width: 52 }]}><Text>氏名</Text></View>
            <View style={[s.vc, { flex: 1 }]}>
              <Text style={{ fontSize: 11, fontWeight: 700 }}>{cv.lastName}　{cv.firstName}</Text>
              <Text style={{ fontSize: 6.5, color: "#666", marginTop: 1 }}>{cv.lastNameKana}　{cv.firstNameKana}</Text>
            </View>
            <View style={[s.lc, { width: 36 }]}><Text>メール</Text></View>
            <View style={[s.vc, { flex: 1, fontSize: 7 }]}><Text>{cv.email}</Text></View>
          </View>
          <View style={s.row}>
            <View style={[s.lc, { width: 52 }]}><Text>電話</Text></View>
            <View style={[s.vc, { width: 100 }]}><Text>{cv.mobilePhone}</Text></View>
            <View style={[s.lc, { width: 36 }]}><Text>住所</Text></View>
            <View style={[s.vc, { flex: 1, fontSize: 7 }]}><Text>{cv.address}</Text></View>
          </View>
        </View>

        {/* 職務概要 */}
        {cv.summary ? (
          <>
            <View style={s.sectionTitle}><Text>職　務　概　要</Text></View>
            <View style={s.sectionBody}><Text>{cv.summary}</Text></View>
          </>
        ) : null}

        {/* 職務経歴 */}
        {cv.workHistory.length > 0 ? (
          <>
            <View style={s.sectionTitle}><Text>職　務　経　歴</Text></View>
            {cv.workHistory.map((w, i) => (
              <View key={w.id} style={{
                borderLeft: B, borderRight: B, borderBottom: B,
                padding: "5 6",
                ...(i > 0 ? { borderTop: "0.5 dashed #bbb" } : {}),
              }}>
                {/* 会社名・期間 */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                  <Text style={{ fontWeight: 700, fontSize: 9 }}>
                    {w.company}{w.department ? `　${w.department}` : ""}{w.position ? `　${w.position}` : ""}
                  </Text>
                  <Text style={{ fontSize: 7, color: "#555" }}>
                    {eraYear(w.entryYear, w.entryMonth)}年{w.entryMonth}月 〜{" "}
                    {w.isCurrent ? "現在" : w.exitYear ? `${eraYear(w.exitYear, w.exitMonth ?? 3)}年${w.exitMonth ?? 3}月` : ""}
                  </Text>
                </View>
                {/* メタ情報 */}
                {(w.industry || w.scale) ? (
                  <View style={{ flexDirection: "row", gap: 12, marginBottom: 3 }}>
                    {w.industry ? <Text style={{ fontSize: 7, color: "#555" }}>業種: {w.industry}</Text> : null}
                    {w.scale ? <Text style={{ fontSize: 7, color: "#555" }}>規模: {w.scale}</Text> : null}
                  </View>
                ) : null}
                {/* 業務内容 */}
                {w.description ? (
                  <View style={{ marginTop: 2 }}>
                    <Text style={{ fontSize: 7, color: "#444", fontWeight: 700, marginBottom: 1 }}>【業務内容】</Text>
                    <Text style={{ fontSize: 7.5, lineHeight: 1.6 }}>{w.description}</Text>
                  </View>
                ) : null}
                {/* 実績 */}
                {w.achievements ? (
                  <View style={{ marginTop: 3 }}>
                    <Text style={{ fontSize: 7, color: "#444", fontWeight: 700, marginBottom: 1 }}>【実績・成果】</Text>
                    <Text style={{ fontSize: 7.5, lineHeight: 1.6 }}>{w.achievements}</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </>
        ) : null}

        {/* 保有スキル */}
        {cv.skills.length > 0 ? (
          <>
            <View style={s.sectionTitle}><Text>保　有　ス　キ　ル</Text></View>
            <View style={{ borderLeft: B, borderRight: B, borderBottom: B }}>
              {cv.skills.map((sk) => (
                <View key={sk.id} style={[s.row, { borderBottom: "0.5 solid #ddd" }]}>
                  <View style={[s.lc, { width: 80, justifyContent: "center" }]}>
                    <Text>{sk.category}</Text>
                  </View>
                  <View style={{ flex: 1, padding: "3 6", borderLeft: B }}>
                    <Text style={{ fontSize: 7.5 }}>{sk.items}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {/* 自己PR */}
        {cv.selfPR ? (
          <>
            <View style={s.sectionTitle}><Text>自　己　Ｐ　Ｒ</Text></View>
            <View style={s.sectionBody}><Text>{cv.selfPR}</Text></View>
          </>
        ) : null}

      </Page>
    </Document>
  );
}
