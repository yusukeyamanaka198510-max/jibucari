import {
  Document, Page, Text, View, StyleSheet, Font,
} from "@react-pdf/renderer";
import type { CoverLetter } from "@/types/coverLetter";

Font.register({
  family: "NotoSansJP",
  fonts: [
    { src: "/fonts/NotoSansJP-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/NotoSansJP-Bold.ttf",    fontWeight: 700 },
  ],
});

function formatDateJa(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const dd = d.getDate();
  const era = y >= 2019 ? `令和${y - 2018}` : y >= 1989 ? `平成${y - 1988}` : `昭和${y - 1925}`;
  return `${era}年${m}月${dd}日`;
}

const s = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    fontSize: 9,
    padding: "20mm 20mm 18mm",
    color: "#111",
    lineHeight: 1.7,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    textAlign: "center",
    letterSpacing: 6,
    marginBottom: 14,
  },
  right: { textAlign: "right" },
  bold: { fontWeight: 700 },
  section: { marginTop: 10 },
  enclosureRow: { flexDirection: "row", gap: 8 },
  rule: {
    borderTop: "0.5 solid #999",
    marginTop: 6,
    marginBottom: 6,
  },
});

function CoverLetterPage({ cl }: { cl: CoverLetter }) {
  return (
    <Page size="A4" style={s.page}>
      {/* 日付 */}
      <Text style={s.right}>{formatDateJa(cl.date)}</Text>

      {/* 送付先 */}
      <View style={{ marginTop: 8, marginBottom: 8 }}>
        {cl.recipientCompany ? <Text style={s.bold}>{cl.recipientCompany}</Text> : null}
        {cl.recipientDepartment ? <Text>{cl.recipientDepartment}</Text> : null}
        {cl.recipientName ? (
          <Text style={s.bold}>{cl.recipientName}　御中</Text>
        ) : (
          <Text style={s.bold}>ご担当者　御中</Text>
        )}
      </View>

      {/* 差出人 */}
      <View style={{ textAlign: "right", marginBottom: 12 }}>
        {cl.yourAddress ? <Text style={{ fontSize: 8 }}>{cl.yourAddress}</Text> : null}
        {cl.yourPhone ? <Text style={{ fontSize: 8 }}>{cl.yourPhone}</Text> : null}
        {cl.yourEmail ? <Text style={{ fontSize: 8 }}>{cl.yourEmail}</Text> : null}
        <Text style={[s.bold, { fontSize: 11 }]}>{cl.yourLastName}　{cl.yourFirstName}　㊞</Text>
      </View>

      {/* タイトル */}
      <Text style={s.title}>応募書類送付のご案内</Text>

      {/* 本文 */}
      {cl.message ? <Text style={{ marginBottom: 10 }}>{cl.message}</Text> : null}

      {/* 記 */}
      <View style={s.rule} />
      <Text style={[s.bold, { textAlign: "center", marginBottom: 6 }]}>記</Text>

      {/* 同封書類 */}
      {cl.enclosures.map((enc) => (
        <View key={enc.id} style={s.enclosureRow}>
          <Text>・</Text>
          <Text>{enc.name}</Text>
          <Text>{enc.count}部</Text>
        </View>
      ))}

      <View style={s.rule} />
      <Text style={s.right}>以　上</Text>
    </Page>
  );
}

function ResignationPage({ cl }: { cl: CoverLetter }) {
  return (
    <Page size="A4" style={s.page}>
      <Text style={[s.title, { marginBottom: 20 }]}>退　　職　　届</Text>

      <Text style={[s.right, { marginBottom: 16 }]}>{formatDateJa(cl.date)}</Text>

      {/* 宛先 */}
      <View style={{ marginBottom: 16 }}>
        {cl.companyName ? <Text style={s.bold}>{cl.companyName}</Text> : null}
        <Text style={s.bold}>代表取締役社長　殿</Text>
      </View>

      {/* 差出人 */}
      <View style={[{ textAlign: "right", marginBottom: 20 }]}>
        {cl.yourCompanyDepartment ? <Text>{cl.yourCompanyDepartment}</Text> : null}
        <Text style={[s.bold, { fontSize: 11 }]}>{cl.yourLastName}　{cl.yourFirstName}　㊞</Text>
      </View>

      {/* 本文 */}
      <Text style={{ marginBottom: 8 }}>
        私儀、{cl.reason ? cl.reason + "、" : "一身上の都合により、"}
        {cl.resignationDate ? `${formatDateJa(cl.resignationDate)}をもって` : ""}退職いたしたく、ここにお届け申し上げます。
      </Text>

      <View style={[s.rule, { marginTop: 20 }]} />
      <Text style={s.right}>以　上</Text>
    </Page>
  );
}

export function CoverLetterPdfDocument({ cl }: { cl: CoverLetter }) {
  return (
    <Document title={cl.title} author={`${cl.yourLastName} ${cl.yourFirstName}`}>
      {cl.type === "resignation" ? (
        <ResignationPage cl={cl} />
      ) : (
        <CoverLetterPage cl={cl} />
      )}
    </Document>
  );
}
