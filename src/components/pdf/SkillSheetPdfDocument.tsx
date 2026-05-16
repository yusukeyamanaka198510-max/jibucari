import {
  Document, Page, Text, View, StyleSheet, Font,
} from "@react-pdf/renderer";
import type { SkillSheet } from "@/types/skillSheet";

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

const LEVEL_LABEL: Record<string, string> = {
  beginner:     "初級",
  intermediate: "中級",
  advanced:     "上級",
  expert:       "エキスパート",
};

const CATEGORY_LABEL: Record<string, string> = {
  language:  "言語",
  framework: "FW/ライブラリ",
  database:  "DB",
  cloud:     "クラウド",
  tool:      "ツール",
  other:     "その他",
};

const B   = "0.5 solid #444";
const LBG = "#F0F0F0";
const SBG = "#E8E8E8";

const s = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    fontSize: 8,
    padding: "10mm 12mm 10mm",
    color: "#111",
    lineHeight: 1.5,
  },
  title: {
    fontSize: 15,
    fontWeight: 700,
    textAlign: "center",
    letterSpacing: 8,
    marginBottom: 2,
  },
  dateRow: {
    fontSize: 7,
    textAlign: "right",
    color: "#555",
    marginBottom: 4,
  },
  sectionTitle: {
    backgroundColor: SBG,
    borderTop: B, borderLeft: B, borderRight: B, borderBottom: B,
    padding: "2 6",
    fontWeight: 700,
    fontSize: 8,
    letterSpacing: 2,
    marginTop: 5,
  },
  sectionBody: {
    borderLeft: B, borderRight: B, borderBottom: B,
    padding: "4 6",
    minHeight: 20,
  },
  row: { flexDirection: "row" },
  th: {
    backgroundColor: LBG,
    borderRight: B, borderBottom: B,
    padding: "2 4",
    fontWeight: 700,
    fontSize: 7,
    color: "#333",
    textAlign: "center",
  },
  td: {
    borderRight: B, borderBottom: B,
    padding: "2 4",
    fontSize: 7.5,
  },
});

export function SkillSheetPdfDocument({ ss }: { ss: SkillSheet }) {
  return (
    <Document title={ss.title} author={`${ss.lastName} ${ss.firstName}`}>
      <Page size="A4" style={s.page}>

        <Text style={s.title}>ス　キ　ル　シ　ー　ト</Text>
        <Text style={s.dateRow}>{todayJa()}</Text>

        {/* 基本情報 */}
        <View style={{ borderTop: B, borderLeft: B }}>
          <View style={s.row}>
            <View style={[{ backgroundColor: LBG, borderRight: B, borderBottom: B, width: 52, padding: "2 4", justifyContent: "center", alignItems: "center", fontSize: 7, color: "#333" }]}>
              <Text>氏名</Text>
            </View>
            <View style={[{ borderRight: B, borderBottom: B, flex: 1, padding: "2 5" }]}>
              <Text style={{ fontSize: 10, fontWeight: 700 }}>{ss.lastName}　{ss.firstName}</Text>
              <Text style={{ fontSize: 6.5, color: "#666" }}>{ss.lastNameKana}　{ss.firstNameKana}</Text>
            </View>
            <View style={[{ backgroundColor: LBG, borderRight: B, borderBottom: B, width: 40, padding: "2 4", justifyContent: "center", alignItems: "center", fontSize: 7, color: "#333" }]}>
              <Text>メール</Text>
            </View>
            <View style={[{ borderRight: B, borderBottom: B, flex: 1, padding: "2 5", fontSize: 7 }]}>
              <Text>{ss.email}</Text>
            </View>
          </View>
          {ss.nearestStation ? (
            <View style={s.row}>
              <View style={[{ backgroundColor: LBG, borderRight: B, borderBottom: B, width: 52, padding: "2 4", justifyContent: "center", alignItems: "center", fontSize: 7, color: "#333" }]}>
                <Text>最寄駅</Text>
              </View>
              <View style={[{ borderRight: B, borderBottom: B, flex: 1, padding: "2 5" }]}>
                <Text>{ss.nearestStation}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* 職務概要 */}
        {ss.summary ? (
          <>
            <View style={s.sectionTitle}><Text>職　務　概　要</Text></View>
            <View style={s.sectionBody}><Text>{ss.summary}</Text></View>
          </>
        ) : null}

        {/* スキルマップ */}
        {ss.skills.length > 0 ? (
          <>
            <View style={s.sectionTitle}><Text>ス　キ　ル　マ　ッ　プ</Text></View>
            <View style={{ borderLeft: B, borderRight: B, borderBottom: B }}>
              {/* ヘッダー */}
              <View style={s.row}>
                <View style={[s.th, { width: 70 }]}><Text>カテゴリ</Text></View>
                <View style={[s.th, { flex: 1 }]}><Text>スキル名</Text></View>
                <View style={[s.th, { width: 44 }]}><Text>経験年数</Text></View>
                <View style={[s.th, { width: 54 }]}><Text>レベル</Text></View>
              </View>
              {ss.skills.map((sk) => (
                <View key={sk.id} style={s.row}>
                  <View style={[s.td, { width: 70 }]}>
                    <Text>{CATEGORY_LABEL[sk.category] ?? sk.category}</Text>
                  </View>
                  <View style={[s.td, { flex: 1 }]}><Text>{sk.name}</Text></View>
                  <View style={[s.td, { width: 44, textAlign: "center" }]}>
                    <Text>{sk.years}年</Text>
                  </View>
                  <View style={[s.td, { width: 54, textAlign: "center" }]}>
                    <Text>{LEVEL_LABEL[sk.level] ?? sk.level}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {/* プロジェクト経歴 */}
        {ss.projects.length > 0 ? (
          <>
            <View style={s.sectionTitle}><Text>プ　ロ　ジ　ェ　ク　ト　経　歴</Text></View>
            {ss.projects.map((p, i) => (
              <View key={p.id} style={{
                borderLeft: B, borderRight: B, borderBottom: B,
                padding: "5 6",
                ...(i > 0 ? { borderTop: "0.5 dashed #bbb" } : {}),
              }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                  <Text style={{ fontWeight: 700, fontSize: 9 }}>{p.name}</Text>
                  <Text style={{ fontSize: 7, color: "#555" }}>
                    {eraYear(p.startYear, p.startMonth)}年{p.startMonth}月 〜{" "}
                    {p.isCurrent ? "現在" : p.endYear ? `${eraYear(p.endYear, p.endMonth ?? 3)}年${p.endMonth ?? 3}月` : ""}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: 16, marginBottom: 3 }}>
                  {p.role ? <Text style={{ fontSize: 7, color: "#555" }}>役割: {p.role}</Text> : null}
                  {p.scale ? <Text style={{ fontSize: 7, color: "#555" }}>規模: {p.scale}</Text> : null}
                  {p.client ? <Text style={{ fontSize: 7, color: "#555" }}>クライアント: {p.client}</Text> : null}
                </View>
                {p.description ? (
                  <View style={{ marginTop: 2 }}>
                    <Text style={{ fontSize: 7, fontWeight: 700, color: "#444", marginBottom: 1 }}>業務内容</Text>
                    <Text style={{ fontSize: 7.5, lineHeight: 1.6 }}>{p.description}</Text>
                  </View>
                ) : null}
                {p.techStack ? (
                  <View style={{ marginTop: 3 }}>
                    <Text style={{ fontSize: 7, fontWeight: 700, color: "#444", marginBottom: 1 }}>使用技術</Text>
                    <Text style={{ fontSize: 7.5 }}>{p.techStack}</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </>
        ) : null}

        {/* 自己PR */}
        {ss.selfPR ? (
          <>
            <View style={s.sectionTitle}><Text>自　己　Ｐ　Ｒ</Text></View>
            <View style={s.sectionBody}><Text>{ss.selfPR}</Text></View>
          </>
        ) : null}

      </Page>
    </Document>
  );
}
