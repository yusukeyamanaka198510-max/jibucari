import type { CoverLetter, EnclosureItem } from "@/types/coverLetter";

const uid = () => crypto.randomUUID();

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function createCoverLetter(): CoverLetter {
  const now = new Date().toISOString();
  return {
    id: uid(),
    title: "送付状",
    type: "cover_letter",
    date: todayStr(),
    yourLastName: "",
    yourFirstName: "",
    yourAddress: "",
    yourPhone: "",
    yourEmail: "",
    recipientCompany: "",
    recipientDepartment: "",
    recipientName: "",
    enclosures: [
      createEnclosureItem("履歴書"),
      createEnclosureItem("職務経歴書"),
    ],
    message:
      "拝啓\n\nこの度は貴社の求人にご応募させていただきたく、ご連絡申し上げます。\nつきましては、下記の書類をお送りいたしますので、ご査収のほど何卒よろしくお願い申し上げます。\n\n敬具",
    companyName: "",
    yourCompanyDepartment: "",
    resignationDate: todayStr(),
    reason: "一身上の都合により",
    createdAt: now,
    updatedAt: now,
  };
}

export function createEnclosureItem(name = ""): EnclosureItem {
  return { id: uid(), name, count: 1 };
}
