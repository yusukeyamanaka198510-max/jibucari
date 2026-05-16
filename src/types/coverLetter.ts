// ─── 送付状・退職届 ───────────────────────────────────────────────────────────

export type CoverLetterType = "cover_letter" | "resignation";

export interface EnclosureItem {
  id: string;
  name: string;
  count: number;
}

export interface CoverLetter {
  id: string;
  title: string;
  type: CoverLetterType;
  date: string;
  // 差出人
  yourLastName: string;
  yourFirstName: string;
  yourAddress: string;
  yourPhone: string;
  yourEmail: string;
  // 送付状
  recipientCompany: string;
  recipientDepartment: string;
  recipientName: string;
  enclosures: EnclosureItem[];
  message: string;
  // 退職届
  companyName: string;
  yourCompanyDepartment: string;
  resignationDate: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
}
