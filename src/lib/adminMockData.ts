// Admin dashboard mock data
// Counts in AdminUser represent all-time totals; action logs show recorded activity.

export type EducationLevel =
  | "grad"
  | "uni_national"
  | "uni_private"
  | "junior_college"
  | "vocational"
  | "high_school";

export interface AdminUser {
  id: string;
  email: string;
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  birthDate: string;
  gender: "male" | "female" | "other";
  phone: string;
  postalCode: string;
  prefecture: string;
  city: string;
  streetAddress: string;
  registeredAt: string;
  pdfDownloadCount: number;
  pdfEmailCount: number;
  interviewButtonCount: number;
  resumeCount: number;
  educationLevel: EducationLevel;
}

export interface AdminEducation {
  school: string;
  department?: string;
  entryYear: number;
  entryMonth: number;
  exitYear?: number;
  exitMonth?: number;
  exitType?: string;
}

export interface AdminWorkHistory {
  company: string;
  position: string;
  entryYear: number;
  entryMonth: number;
  exitYear?: number;
  exitMonth?: number;
  isCurrent: boolean;
  description: string;
}

export interface AdminLicense {
  name: string;
  year: number;
  month: number;
}

export interface AdminResume {
  id: string;
  userId: string;
  title: string;
  format: "jis" | "career_change" | "new_graduate" | "part_time";
  createdAt: string;
  updatedAt: string;
  education: AdminEducation[];
  workHistory: AdminWorkHistory[];
  licenses: AdminLicense[];
  motivation: string;
  selfPR: string;
}

export type ActionType =
  | "pdf_download"
  | "pdf_email"
  | "interview_request"
  | "resume_created"
  | "resume_updated"
  | "login"
  | "register";

export interface ActionLog {
  id: string;
  userId: string;
  action: ActionType;
  label: string;
  detail?: string;
  createdAt: string;
}

// ── Mock Users ────────────────────────────────────────────────────────────────

export const MOCK_USERS: AdminUser[] = [
  {
    id: "u-001",
    email: "yamada.taro@example.com",
    lastName: "山田",
    firstName: "太郎",
    lastNameKana: "ヤマダ",
    firstNameKana: "タロウ",
    birthDate: "1990-04-15",
    gender: "male",
    phone: "090-1234-5678",
    postalCode: "150-0001",
    prefecture: "東京都",
    city: "渋谷区",
    streetAddress: "神宮前1-2-3",
    registeredAt: "2024-10-05T09:00:00Z",
    pdfDownloadCount: 12,
    pdfEmailCount: 5,
    interviewButtonCount: 3,
    resumeCount: 2,
    educationLevel: "uni_national",
  },
  {
    id: "u-002",
    email: "suzuki.hanako@example.com",
    lastName: "鈴木",
    firstName: "花子",
    lastNameKana: "スズキ",
    firstNameKana: "ハナコ",
    birthDate: "1995-08-22",
    gender: "female",
    phone: "080-9876-5432",
    postalCode: "220-0012",
    prefecture: "神奈川県",
    city: "横浜市西区",
    streetAddress: "みなとみらい2-1-1",
    registeredAt: "2024-10-12T14:30:00Z",
    pdfDownloadCount: 8,
    pdfEmailCount: 2,
    interviewButtonCount: 7,
    resumeCount: 1,
    educationLevel: "uni_private",
  },
  {
    id: "u-003",
    email: "tanaka.kenji@example.com",
    lastName: "田中",
    firstName: "健二",
    lastNameKana: "タナカ",
    firstNameKana: "ケンジ",
    birthDate: "1988-01-30",
    gender: "male",
    phone: "070-3456-7890",
    postalCode: "530-0001",
    prefecture: "大阪府",
    city: "大阪市北区",
    streetAddress: "梅田1-1-1",
    registeredAt: "2024-11-01T10:00:00Z",
    pdfDownloadCount: 20,
    pdfEmailCount: 10,
    interviewButtonCount: 2,
    resumeCount: 3,
    educationLevel: "uni_national",
  },
  {
    id: "u-004",
    email: "watanabe.yuki@example.com",
    lastName: "渡辺",
    firstName: "由紀",
    lastNameKana: "ワタナベ",
    firstNameKana: "ユキ",
    birthDate: "2000-03-10",
    gender: "female",
    phone: "090-2222-3333",
    postalCode: "460-0001",
    prefecture: "愛知県",
    city: "名古屋市中区",
    streetAddress: "栄1-2-3",
    registeredAt: "2024-11-15T08:00:00Z",
    pdfDownloadCount: 3,
    pdfEmailCount: 1,
    interviewButtonCount: 5,
    resumeCount: 1,
    educationLevel: "uni_national",
  },
  {
    id: "u-005",
    email: "ito.masahiro@example.com",
    lastName: "伊藤",
    firstName: "雅裕",
    lastNameKana: "イトウ",
    firstNameKana: "マサヒロ",
    birthDate: "1985-11-25",
    gender: "male",
    phone: "080-4444-5555",
    postalCode: "060-0001",
    prefecture: "北海道",
    city: "札幌市中央区",
    streetAddress: "北1条西2丁目",
    registeredAt: "2024-12-01T12:00:00Z",
    pdfDownloadCount: 15,
    pdfEmailCount: 8,
    interviewButtonCount: 4,
    resumeCount: 2,
    educationLevel: "uni_national",
  },
  {
    id: "u-006",
    email: "kobayashi.ai@example.com",
    lastName: "小林",
    firstName: "愛",
    lastNameKana: "コバヤシ",
    firstNameKana: "アイ",
    birthDate: "1998-06-18",
    gender: "female",
    phone: "090-6666-7777",
    postalCode: "812-0011",
    prefecture: "福岡県",
    city: "福岡市博多区",
    streetAddress: "博多駅前1-1",
    registeredAt: "2025-01-10T09:30:00Z",
    pdfDownloadCount: 6,
    pdfEmailCount: 3,
    interviewButtonCount: 1,
    resumeCount: 1,
    educationLevel: "grad",
  },
  {
    id: "u-007",
    email: "nakamura.ryota@example.com",
    lastName: "中村",
    firstName: "涼太",
    lastNameKana: "ナカムラ",
    firstNameKana: "リョウタ",
    birthDate: "1993-09-07",
    gender: "male",
    phone: "070-8888-9999",
    postalCode: "980-0001",
    prefecture: "宮城県",
    city: "仙台市青葉区",
    streetAddress: "一番町1-1",
    registeredAt: "2025-01-20T11:00:00Z",
    pdfDownloadCount: 4,
    pdfEmailCount: 0,
    interviewButtonCount: 9,
    resumeCount: 2,
    educationLevel: "uni_national",
  },
  {
    id: "u-008",
    email: "hayashi.maki@example.com",
    lastName: "林",
    firstName: "真希",
    lastNameKana: "ハヤシ",
    firstNameKana: "マキ",
    birthDate: "2001-12-03",
    gender: "female",
    phone: "090-1111-0000",
    postalCode: "600-8001",
    prefecture: "京都府",
    city: "京都市下京区",
    streetAddress: "四条烏丸1-1",
    registeredAt: "2025-02-05T15:00:00Z",
    pdfDownloadCount: 2,
    pdfEmailCount: 1,
    interviewButtonCount: 0,
    resumeCount: 1,
    educationLevel: "uni_private",
  },
];

// ── Mock Resumes ──────────────────────────────────────────────────────────────

export const MOCK_RESUMES: AdminResume[] = [
  // 山田太郎 (u-001)
  {
    id: "r-001",
    userId: "u-001",
    title: "山田太郎の履歴書（転職用）",
    format: "career_change",
    createdAt: "2024-10-05T10:00:00Z",
    updatedAt: "2024-10-20T14:00:00Z",
    education: [
      { school: "東京大学", department: "工学部情報工学科", entryYear: 2009, entryMonth: 4, exitYear: 2013, exitMonth: 3, exitType: "graduated" },
    ],
    workHistory: [
      { company: "株式会社テックソリューション", position: "システムエンジニア", entryYear: 2013, entryMonth: 4, exitYear: 2018, exitMonth: 3, isCurrent: false, description: "Webシステムの設計・開発・保守。主にJava/Spring BootでのバックエンドAPI開発を担当。チームリーダーとして5名を指揮。" },
      { company: "株式会社デジタルイノベーション", position: "上級エンジニア", entryYear: 2018, entryMonth: 4, isCurrent: true, description: "クラウドインフラの設計・構築。AWSを活用したマイクロサービスアーキテクチャの導入を主導。" },
    ],
    licenses: [
      { name: "基本情報技術者", year: 2013, month: 6 },
      { name: "AWS認定ソリューションアーキテクト", year: 2019, month: 3 },
    ],
    motivation: "より大きな技術的チャレンジに挑戦し、組織のデジタル変革に貢献したいと考えています。貴社の先進的な取り組みに強く惹かれています。",
    selfPR: "エンジニアとして10年以上の経験を持ち、バックエンドからインフラまで幅広い技術スタックに対応できます。チームリードの経験もあり、技術的な指導と組織の成長を両立できます。",
  },
  {
    id: "r-002",
    userId: "u-001",
    title: "山田太郎の履歴書（JIS規格）",
    format: "jis",
    createdAt: "2024-10-25T10:00:00Z",
    updatedAt: "2024-11-01T10:00:00Z",
    education: [
      { school: "東京大学", department: "工学部情報工学科", entryYear: 2009, entryMonth: 4, exitYear: 2013, exitMonth: 3, exitType: "graduated" },
    ],
    workHistory: [
      { company: "株式会社テックソリューション", position: "システムエンジニア", entryYear: 2013, entryMonth: 4, exitYear: 2018, exitMonth: 3, isCurrent: false, description: "Webシステム開発・保守" },
      { company: "株式会社デジタルイノベーション", position: "上級エンジニア", entryYear: 2018, entryMonth: 4, isCurrent: true, description: "クラウドインフラ設計・構築" },
    ],
    licenses: [],
    motivation: "さらなる成長のため、新たな環境での挑戦を希望します。",
    selfPR: "技術力と対人能力を活かし、チームと共に目標を達成できます。",
  },
  // 鈴木花子 (u-002)
  {
    id: "r-003",
    userId: "u-002",
    title: "鈴木花子の履歴書（新卒用）",
    format: "new_graduate",
    createdAt: "2024-10-12T15:00:00Z",
    updatedAt: "2024-10-30T10:00:00Z",
    education: [
      { school: "慶應義塾大学", department: "商学部", entryYear: 2020, entryMonth: 4, exitYear: 2024, exitMonth: 3, exitType: "graduated" },
    ],
    workHistory: [],
    licenses: [
      { name: "日商簿記2級", year: 2022, month: 11 },
      { name: "TOEIC 780点", year: 2023, month: 6 },
    ],
    motivation: "大学での学びを活かし、財務・経理の分野でキャリアをスタートさせたいと思っています。",
    selfPR: "大学では会計学・経営学を専攻し、ゼミでは中小企業の財務分析を研究しました。細部への注意力と分析力を武器に、即戦力として貢献できます。",
  },
  // 田中健二 (u-003)
  {
    id: "r-004",
    userId: "u-003",
    title: "田中健二の履歴書（転職用）",
    format: "career_change",
    createdAt: "2024-11-01T11:00:00Z",
    updatedAt: "2024-11-20T09:00:00Z",
    education: [
      { school: "大阪大学", department: "法学部", entryYear: 2007, entryMonth: 4, exitYear: 2011, exitMonth: 3, exitType: "graduated" },
    ],
    workHistory: [
      { company: "大手商社株式会社", position: "海外営業", entryYear: 2011, entryMonth: 4, exitYear: 2016, exitMonth: 9, isCurrent: false, description: "海外向け製造機器の営業。年間売上目標120%を3年連続達成。東南アジア担当として現地法人設立に参画。" },
      { company: "株式会社ベンチャーキャピタル", position: "投資担当", entryYear: 2016, entryMonth: 10, isCurrent: true, description: "スタートアップへの投資評価・支援業務。15社以上の投資を実行、うち2社がIPO達成。" },
    ],
    licenses: [
      { name: "宅地建物取引士", year: 2015, month: 10 },
    ],
    motivation: "スタートアップ支援の経験を活かし、より大きな社会インパクトを与えられる環境に転職したいと考えています。",
    selfPR: "営業から投資業務まで幅広いビジネス経験を持ちます。数値を意識した思考力と、幅広い人脈が強みです。",
  },
  {
    id: "r-005",
    userId: "u-003",
    title: "田中健二の履歴書（JIS規格）",
    format: "jis",
    createdAt: "2024-11-22T10:00:00Z",
    updatedAt: "2024-12-01T10:00:00Z",
    education: [
      { school: "大阪大学", department: "法学部", entryYear: 2007, entryMonth: 4, exitYear: 2011, exitMonth: 3, exitType: "graduated" },
    ],
    workHistory: [
      { company: "大手商社株式会社", position: "海外営業", entryYear: 2011, entryMonth: 4, exitYear: 2016, exitMonth: 9, isCurrent: false, description: "海外営業" },
    ],
    licenses: [],
    motivation: "これまでの経験を活かし次のステージへ。",
    selfPR: "強い実行力と数字への意識が強みです。",
  },
  {
    id: "r-006",
    userId: "u-003",
    title: "田中健二のアルバイト用履歴書",
    format: "part_time",
    createdAt: "2024-12-05T10:00:00Z",
    updatedAt: "2024-12-10T10:00:00Z",
    education: [],
    workHistory: [],
    licenses: [],
    motivation: "週3日から勤務可能で、接客経験を活かしたいと思います。",
    selfPR: "コミュニケーション能力が高く、チームワークを大切にします。",
  },
  // 渡辺由紀 (u-004)
  {
    id: "r-007",
    userId: "u-004",
    title: "渡辺由紀の履歴書（新卒用）",
    format: "new_graduate",
    createdAt: "2024-11-15T09:00:00Z",
    updatedAt: "2024-11-28T10:00:00Z",
    education: [
      { school: "名古屋大学", department: "文学部日本文学科", entryYear: 2019, entryMonth: 4, exitYear: 2023, exitMonth: 3, exitType: "graduated" },
    ],
    workHistory: [],
    licenses: [
      { name: "普通自動車第一種運転免許", year: 2021, month: 3 },
    ],
    motivation: "出版・メディア業界に強い関心があり、コンテンツ制作に携わりたいと思っています。",
    selfPR: "文章を書くことが得意で、大学では文芸部に所属し小説・エッセイを発表。SNSでの情報発信も積極的に行っています。",
  },
  // 伊藤雅裕 (u-005)
  {
    id: "r-008",
    userId: "u-005",
    title: "伊藤雅裕の履歴書（転職用）",
    format: "career_change",
    createdAt: "2024-12-01T13:00:00Z",
    updatedAt: "2024-12-15T10:00:00Z",
    education: [
      { school: "北海道大学", department: "農学部応用生命科学科", entryYear: 2004, entryMonth: 4, exitYear: 2008, exitMonth: 3, exitType: "graduated" },
    ],
    workHistory: [
      { company: "食品メーカー株式会社", position: "商品開発", entryYear: 2008, entryMonth: 4, exitYear: 2015, exitMonth: 3, isCurrent: false, description: "食品の研究開発。新商品5品を市場投入。機能性食品の成分分析・配合設計を主導。" },
      { company: "コンサルティング株式会社", position: "コンサルタント", entryYear: 2015, entryMonth: 4, isCurrent: true, description: "食品・農業分野のコンサルティング。大手食品メーカー3社の新規事業立案を支援。" },
    ],
    licenses: [
      { name: "食品表示検定 中級", year: 2010, month: 8 },
    ],
    motivation: "農業テクノロジー分野で新しい価値を生み出したいと考えています。フードテックの最前線でキャリアを築きたいです。",
    selfPR: "食品業界15年以上の知見と、コンサルとして培った戦略的思考が強みです。データドリブンな意思決定を得意とします。",
  },
  {
    id: "r-009",
    userId: "u-005",
    title: "伊藤雅裕の履歴書（JIS規格）",
    format: "jis",
    createdAt: "2024-12-18T10:00:00Z",
    updatedAt: "2025-01-05T10:00:00Z",
    education: [
      { school: "北海道大学", department: "農学部", entryYear: 2004, entryMonth: 4, exitYear: 2008, exitMonth: 3, exitType: "graduated" },
    ],
    workHistory: [
      { company: "食品メーカー株式会社", position: "商品開発", entryYear: 2008, entryMonth: 4, exitYear: 2015, exitMonth: 3, isCurrent: false, description: "商品開発" },
    ],
    licenses: [],
    motivation: "新しいキャリアへの挑戦",
    selfPR: "専門知識と実行力",
  },
  // 小林愛 (u-006)
  {
    id: "r-010",
    userId: "u-006",
    title: "小林愛の履歴書（新卒用）",
    format: "new_graduate",
    createdAt: "2025-01-10T10:00:00Z",
    updatedAt: "2025-01-25T10:00:00Z",
    education: [
      { school: "九州大学", department: "理学部物理学科", entryYear: 2017, entryMonth: 4, exitYear: 2021, exitMonth: 3, exitType: "graduated" },
      { school: "九州大学大学院", department: "理学府物理学専攻", entryYear: 2021, entryMonth: 4, exitYear: 2023, exitMonth: 3, exitType: "graduated" },
    ],
    workHistory: [],
    licenses: [
      { name: "第一種放射線取扱主任者", year: 2022, month: 11 },
    ],
    motivation: "物理学の知識を活かし、半導体・素材研究の分野で貢献したいと考えています。",
    selfPR: "大学院では光物性の研究に取り組み、学術論文2本を共同執筆。問題の本質を見抜く分析力と、実験計画立案力が強みです。",
  },
  // 中村涼太 (u-007)
  {
    id: "r-011",
    userId: "u-007",
    title: "中村涼太の履歴書（転職用）",
    format: "career_change",
    createdAt: "2025-01-20T12:00:00Z",
    updatedAt: "2025-02-01T10:00:00Z",
    education: [
      { school: "東北大学", department: "経済学部経済学科", entryYear: 2012, entryMonth: 4, exitYear: 2016, exitMonth: 3, exitType: "graduated" },
    ],
    workHistory: [
      { company: "地方銀行", position: "営業・融資担当", entryYear: 2016, entryMonth: 4, exitYear: 2021, exitMonth: 9, isCurrent: false, description: "法人向け融資営業。年間融資実績トップ3を4年連続達成。中小企業の財務改善コンサルティングも担当。" },
      { company: "フィンテック株式会社", position: "事業開発マネージャー", entryYear: 2021, entryMonth: 10, isCurrent: true, description: "新規サービス開発・パートナーシップ構築。決済サービス立ち上げを主導し、1年で10万ユーザー獲得。" },
    ],
    licenses: [
      { name: "ファイナンシャルプランナー2級", year: 2018, month: 5 },
    ],
    motivation: "金融とテクノロジーの融合領域で、より多くの人の資産形成を支援したいと考えています。",
    selfPR: "銀行員として培った信頼構築力とフィンテックでの事業開発経験を組み合わせ、新規ビジネスを推進できます。",
  },
  {
    id: "r-012",
    userId: "u-007",
    title: "中村涼太の履歴書（JIS規格）",
    format: "jis",
    createdAt: "2025-02-03T10:00:00Z",
    updatedAt: "2025-02-10T10:00:00Z",
    education: [
      { school: "東北大学", department: "経済学部", entryYear: 2012, entryMonth: 4, exitYear: 2016, exitMonth: 3, exitType: "graduated" },
    ],
    workHistory: [
      { company: "地方銀行", position: "営業", entryYear: 2016, entryMonth: 4, exitYear: 2021, exitMonth: 9, isCurrent: false, description: "融資営業" },
    ],
    licenses: [],
    motivation: "新しいステージでの挑戦",
    selfPR: "信頼関係の構築が得意です",
  },
  // 林真希 (u-008)
  {
    id: "r-013",
    userId: "u-008",
    title: "林真希の履歴書（新卒用）",
    format: "new_graduate",
    createdAt: "2025-02-05T16:00:00Z",
    updatedAt: "2025-02-18T10:00:00Z",
    education: [
      { school: "同志社大学", department: "社会学部メディア学科", entryYear: 2020, entryMonth: 4, exitYear: 2024, exitMonth: 3, exitType: "graduated" },
    ],
    workHistory: [],
    licenses: [
      { name: "TOEIC 850点", year: 2023, month: 9 },
      { name: "普通自動車第一種運転免許", year: 2022, month: 8 },
    ],
    motivation: "SNSマーケティングに強い関心があり、デジタルプロモーション分野でキャリアをスタートしたいと考えています。",
    selfPR: "大学ではメディア論を専攻し、ゼミでSNS消費者行動の研究を行いました。Instagramで1万フォロワーを獲得した実績もあります。",
  },
];

// ── Mock Action Logs ──────────────────────────────────────────────────────────

export const MOCK_ACTION_LOGS: ActionLog[] = [
  // u-001 山田太郎
  { id: "al-001", userId: "u-001", action: "register", label: "新規登録", createdAt: "2024-10-05T09:00:00Z" },
  { id: "al-002", userId: "u-001", action: "resume_created", label: "履歴書を新規作成", detail: "山田太郎の履歴書（転職用）", createdAt: "2024-10-05T10:00:00Z" },
  { id: "al-003", userId: "u-001", action: "pdf_download", label: "PDFをダウンロード", detail: "山田太郎の履歴書（転職用）", createdAt: "2024-10-08T11:00:00Z" },
  { id: "al-004", userId: "u-001", action: "pdf_download", label: "PDFをダウンロード", detail: "山田太郎の履歴書（転職用）", createdAt: "2024-10-10T14:30:00Z" },
  { id: "al-005", userId: "u-001", action: "resume_updated", label: "履歴書を更新", detail: "山田太郎の履歴書（転職用）", createdAt: "2024-10-20T14:00:00Z" },
  { id: "al-006", userId: "u-001", action: "pdf_email", label: "PDFをメール転送", detail: "山田太郎の履歴書（転職用）", createdAt: "2024-10-15T09:00:00Z" },
  { id: "al-007", userId: "u-001", action: "interview_request", label: "面談リクエスト送信", createdAt: "2024-10-18T10:00:00Z" },
  { id: "al-008", userId: "u-001", action: "resume_created", label: "履歴書を新規作成", detail: "山田太郎の履歴書（JIS規格）", createdAt: "2024-10-25T10:00:00Z" },
  { id: "al-009", userId: "u-001", action: "pdf_download", label: "PDFをダウンロード", detail: "山田太郎の履歴書（JIS規格）", createdAt: "2024-11-01T11:00:00Z" },
  { id: "al-010", userId: "u-001", action: "pdf_email", label: "PDFをメール転送", detail: "山田太郎の履歴書（JIS規格）", createdAt: "2024-11-05T10:00:00Z" },
  { id: "al-011", userId: "u-001", action: "interview_request", label: "面談リクエスト送信", createdAt: "2024-11-10T14:00:00Z" },
  { id: "al-012", userId: "u-001", action: "interview_request", label: "面談リクエスト送信", createdAt: "2024-11-20T09:00:00Z" },

  // u-002 鈴木花子
  { id: "al-020", userId: "u-002", action: "register", label: "新規登録", createdAt: "2024-10-12T14:30:00Z" },
  { id: "al-021", userId: "u-002", action: "resume_created", label: "履歴書を新規作成", detail: "鈴木花子の履歴書（新卒用）", createdAt: "2024-10-12T15:00:00Z" },
  { id: "al-022", userId: "u-002", action: "pdf_download", label: "PDFをダウンロード", detail: "鈴木花子の履歴書（新卒用）", createdAt: "2024-10-15T10:00:00Z" },
  { id: "al-023", userId: "u-002", action: "interview_request", label: "面談リクエスト送信", createdAt: "2024-10-18T11:00:00Z" },
  { id: "al-024", userId: "u-002", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2024-10-22T14:00:00Z" },
  { id: "al-025", userId: "u-002", action: "interview_request", label: "面談リクエスト送信", createdAt: "2024-11-01T09:00:00Z" },
  { id: "al-026", userId: "u-002", action: "interview_request", label: "面談リクエスト送信", createdAt: "2024-11-05T10:00:00Z" },
  { id: "al-027", userId: "u-002", action: "pdf_email", label: "PDFをメール転送", createdAt: "2024-11-10T14:00:00Z" },
  { id: "al-028", userId: "u-002", action: "interview_request", label: "面談リクエスト送信", createdAt: "2024-11-15T11:00:00Z" },
  { id: "al-029", userId: "u-002", action: "interview_request", label: "面談リクエスト送信", createdAt: "2024-11-20T10:00:00Z" },
  { id: "al-030", userId: "u-002", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2024-11-28T09:00:00Z" },
  { id: "al-031", userId: "u-002", action: "interview_request", label: "面談リクエスト送信", createdAt: "2024-12-01T11:00:00Z" },
  { id: "al-032", userId: "u-002", action: "pdf_email", label: "PDFをメール転送", createdAt: "2024-12-05T10:00:00Z" },
  { id: "al-033", userId: "u-002", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2024-12-10T11:00:00Z" },
  { id: "al-034", userId: "u-002", action: "interview_request", label: "面談リクエスト送信", createdAt: "2024-12-15T10:00:00Z" },

  // u-003 田中健二
  { id: "al-040", userId: "u-003", action: "register", label: "新規登録", createdAt: "2024-11-01T10:00:00Z" },
  { id: "al-041", userId: "u-003", action: "resume_created", label: "履歴書を新規作成", detail: "田中健二の履歴書（転職用）", createdAt: "2024-11-01T11:00:00Z" },
  { id: "al-042", userId: "u-003", action: "pdf_download", label: "PDFをダウンロード", detail: "田中健二の履歴書（転職用）", createdAt: "2024-11-05T10:00:00Z" },
  { id: "al-043", userId: "u-003", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2024-11-08T11:00:00Z" },
  { id: "al-044", userId: "u-003", action: "pdf_email", label: "PDFをメール転送", createdAt: "2024-11-10T09:00:00Z" },
  { id: "al-045", userId: "u-003", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2024-11-12T14:00:00Z" },
  { id: "al-046", userId: "u-003", action: "interview_request", label: "面談リクエスト送信", createdAt: "2024-11-15T10:00:00Z" },
  { id: "al-047", userId: "u-003", action: "pdf_email", label: "PDFをメール転送", createdAt: "2024-11-18T11:00:00Z" },
  { id: "al-048", userId: "u-003", action: "resume_updated", label: "履歴書を更新", detail: "田中健二の履歴書（転職用）", createdAt: "2024-11-20T09:00:00Z" },
  { id: "al-049", userId: "u-003", action: "resume_created", label: "履歴書を新規作成", detail: "田中健二の履歴書（JIS規格）", createdAt: "2024-11-22T10:00:00Z" },
  { id: "al-050", userId: "u-003", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2024-11-25T11:00:00Z" },
  { id: "al-051", userId: "u-003", action: "pdf_email", label: "PDFをメール転送", createdAt: "2024-11-28T10:00:00Z" },
  { id: "al-052", userId: "u-003", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2024-12-01T09:00:00Z" },
  { id: "al-053", userId: "u-003", action: "resume_created", label: "履歴書を新規作成", detail: "アルバイト用履歴書", createdAt: "2024-12-05T10:00:00Z" },
  { id: "al-054", userId: "u-003", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2024-12-08T11:00:00Z" },
  { id: "al-055", userId: "u-003", action: "pdf_email", label: "PDFをメール転送", createdAt: "2024-12-10T10:00:00Z" },
  { id: "al-056", userId: "u-003", action: "interview_request", label: "面談リクエスト送信", createdAt: "2024-12-15T09:00:00Z" },
  { id: "al-057", userId: "u-003", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2024-12-20T11:00:00Z" },
  { id: "al-058", userId: "u-003", action: "pdf_email", label: "PDFをメール転送", createdAt: "2024-12-25T10:00:00Z" },
  { id: "al-059", userId: "u-003", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2025-01-05T11:00:00Z" },
  { id: "al-060", userId: "u-003", action: "pdf_email", label: "PDFをメール転送", createdAt: "2025-01-10T10:00:00Z" },
  { id: "al-061", userId: "u-003", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2025-01-15T11:00:00Z" },
  { id: "al-062", userId: "u-003", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2025-01-20T10:00:00Z" },
  { id: "al-063", userId: "u-003", action: "pdf_email", label: "PDFをメール転送", createdAt: "2025-01-25T11:00:00Z" },
  { id: "al-064", userId: "u-003", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2025-02-01T10:00:00Z" },
  { id: "al-065", userId: "u-003", action: "pdf_email", label: "PDFをメール転送", createdAt: "2025-02-05T11:00:00Z" },
  { id: "al-066", userId: "u-003", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2025-02-10T10:00:00Z" },

  // u-004 渡辺由紀
  { id: "al-070", userId: "u-004", action: "register", label: "新規登録", createdAt: "2024-11-15T08:00:00Z" },
  { id: "al-071", userId: "u-004", action: "resume_created", label: "履歴書を新規作成", detail: "渡辺由紀の履歴書（新卒用）", createdAt: "2024-11-15T09:00:00Z" },
  { id: "al-072", userId: "u-004", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2024-11-18T10:00:00Z" },
  { id: "al-073", userId: "u-004", action: "interview_request", label: "面談リクエスト送信", createdAt: "2024-11-20T11:00:00Z" },
  { id: "al-074", userId: "u-004", action: "interview_request", label: "面談リクエスト送信", createdAt: "2024-11-25T10:00:00Z" },
  { id: "al-075", userId: "u-004", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2024-12-01T11:00:00Z" },
  { id: "al-076", userId: "u-004", action: "pdf_email", label: "PDFをメール転送", createdAt: "2024-12-05T10:00:00Z" },
  { id: "al-077", userId: "u-004", action: "interview_request", label: "面談リクエスト送信", createdAt: "2024-12-10T11:00:00Z" },
  { id: "al-078", userId: "u-004", action: "interview_request", label: "面談リクエスト送信", createdAt: "2024-12-15T10:00:00Z" },
  { id: "al-079", userId: "u-004", action: "interview_request", label: "面談リクエスト送信", createdAt: "2024-12-20T11:00:00Z" },

  // u-005 伊藤雅裕
  { id: "al-090", userId: "u-005", action: "register", label: "新規登録", createdAt: "2024-12-01T12:00:00Z" },
  { id: "al-091", userId: "u-005", action: "resume_created", label: "履歴書を新規作成", detail: "伊藤雅裕の履歴書（転職用）", createdAt: "2024-12-01T13:00:00Z" },
  { id: "al-092", userId: "u-005", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2024-12-05T10:00:00Z" },
  { id: "al-093", userId: "u-005", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2024-12-08T11:00:00Z" },
  { id: "al-094", userId: "u-005", action: "pdf_email", label: "PDFをメール転送", createdAt: "2024-12-10T10:00:00Z" },
  { id: "al-095", userId: "u-005", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2024-12-12T11:00:00Z" },
  { id: "al-096", userId: "u-005", action: "resume_updated", label: "履歴書を更新", detail: "伊藤雅裕の履歴書（転職用）", createdAt: "2024-12-15T10:00:00Z" },
  { id: "al-097", userId: "u-005", action: "interview_request", label: "面談リクエスト送信", createdAt: "2024-12-22T11:00:00Z" },
  { id: "al-098", userId: "u-005", action: "resume_created", label: "履歴書を新規作成", detail: "伊藤雅裕の履歴書（JIS規格）", createdAt: "2024-12-18T10:00:00Z" },
  { id: "al-099", userId: "u-005", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2024-12-25T11:00:00Z" },
  { id: "al-100", userId: "u-005", action: "pdf_email", label: "PDFをメール転送", createdAt: "2024-12-28T10:00:00Z" },
  { id: "al-101", userId: "u-005", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2025-01-05T11:00:00Z" },
  { id: "al-102", userId: "u-005", action: "pdf_email", label: "PDFをメール転送", createdAt: "2025-01-10T10:00:00Z" },
  { id: "al-103", userId: "u-005", action: "interview_request", label: "面談リクエスト送信", createdAt: "2025-01-15T11:00:00Z" },
  { id: "al-104", userId: "u-005", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2025-01-18T10:00:00Z" },
  { id: "al-105", userId: "u-005", action: "pdf_email", label: "PDFをメール転送", createdAt: "2025-01-22T11:00:00Z" },
  { id: "al-106", userId: "u-005", action: "interview_request", label: "面談リクエスト送信", createdAt: "2025-01-28T10:00:00Z" },
  { id: "al-107", userId: "u-005", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2025-02-01T11:00:00Z" },
  { id: "al-108", userId: "u-005", action: "pdf_email", label: "PDFをメール転送", createdAt: "2025-02-05T10:00:00Z" },
  { id: "al-109", userId: "u-005", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2025-02-10T11:00:00Z" },
  { id: "al-110", userId: "u-005", action: "interview_request", label: "面談リクエスト送信", createdAt: "2025-02-15T10:00:00Z" },

  // u-006 小林愛
  { id: "al-120", userId: "u-006", action: "register", label: "新規登録", createdAt: "2025-01-10T09:30:00Z" },
  { id: "al-121", userId: "u-006", action: "resume_created", label: "履歴書を新規作成", detail: "小林愛の履歴書（新卒用）", createdAt: "2025-01-10T10:00:00Z" },
  { id: "al-122", userId: "u-006", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2025-01-15T11:00:00Z" },
  { id: "al-123", userId: "u-006", action: "pdf_email", label: "PDFをメール転送", createdAt: "2025-01-18T10:00:00Z" },
  { id: "al-124", userId: "u-006", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2025-01-20T11:00:00Z" },
  { id: "al-125", userId: "u-006", action: "interview_request", label: "面談リクエスト送信", createdAt: "2025-01-22T10:00:00Z" },
  { id: "al-126", userId: "u-006", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2025-01-25T11:00:00Z" },
  { id: "al-127", userId: "u-006", action: "pdf_email", label: "PDFをメール転送", createdAt: "2025-01-28T10:00:00Z" },
  { id: "al-128", userId: "u-006", action: "resume_updated", label: "履歴書を更新", detail: "小林愛の履歴書（新卒用）", createdAt: "2025-01-25T10:00:00Z" },
  { id: "al-129", userId: "u-006", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2025-02-01T11:00:00Z" },
  { id: "al-130", userId: "u-006", action: "pdf_email", label: "PDFをメール転送", createdAt: "2025-02-05T10:00:00Z" },

  // u-007 中村涼太
  { id: "al-140", userId: "u-007", action: "register", label: "新規登録", createdAt: "2025-01-20T11:00:00Z" },
  { id: "al-141", userId: "u-007", action: "resume_created", label: "履歴書を新規作成", detail: "中村涼太の履歴書（転職用）", createdAt: "2025-01-20T12:00:00Z" },
  { id: "al-142", userId: "u-007", action: "interview_request", label: "面談リクエスト送信", createdAt: "2025-01-22T10:00:00Z" },
  { id: "al-143", userId: "u-007", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2025-01-25T11:00:00Z" },
  { id: "al-144", userId: "u-007", action: "interview_request", label: "面談リクエスト送信", createdAt: "2025-01-28T10:00:00Z" },
  { id: "al-145", userId: "u-007", action: "interview_request", label: "面談リクエスト送信", createdAt: "2025-02-01T11:00:00Z" },
  { id: "al-146", userId: "u-007", action: "resume_created", label: "履歴書を新規作成", detail: "中村涼太の履歴書（JIS規格）", createdAt: "2025-02-03T10:00:00Z" },
  { id: "al-147", userId: "u-007", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2025-02-05T11:00:00Z" },
  { id: "al-148", userId: "u-007", action: "interview_request", label: "面談リクエスト送信", createdAt: "2025-02-08T10:00:00Z" },
  { id: "al-149", userId: "u-007", action: "interview_request", label: "面談リクエスト送信", createdAt: "2025-02-10T11:00:00Z" },
  { id: "al-150", userId: "u-007", action: "interview_request", label: "面談リクエスト送信", createdAt: "2025-02-12T10:00:00Z" },
  { id: "al-151", userId: "u-007", action: "interview_request", label: "面談リクエスト送信", createdAt: "2025-02-15T11:00:00Z" },
  { id: "al-152", userId: "u-007", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2025-02-18T10:00:00Z" },
  { id: "al-153", userId: "u-007", action: "interview_request", label: "面談リクエスト送信", createdAt: "2025-02-20T11:00:00Z" },

  // u-008 林真希
  { id: "al-160", userId: "u-008", action: "register", label: "新規登録", createdAt: "2025-02-05T15:00:00Z" },
  { id: "al-161", userId: "u-008", action: "resume_created", label: "履歴書を新規作成", detail: "林真希の履歴書（新卒用）", createdAt: "2025-02-05T16:00:00Z" },
  { id: "al-162", userId: "u-008", action: "resume_updated", label: "履歴書を更新", detail: "林真希の履歴書（新卒用）", createdAt: "2025-02-18T10:00:00Z" },
  { id: "al-163", userId: "u-008", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2025-02-20T11:00:00Z" },
  { id: "al-164", userId: "u-008", action: "pdf_email", label: "PDFをメール転送", createdAt: "2025-02-22T10:00:00Z" },
  { id: "al-165", userId: "u-008", action: "pdf_download", label: "PDFをダウンロード", createdAt: "2025-02-25T11:00:00Z" },
];

// ── Helper functions ──────────────────────────────────────────────────────────

export function getAdminStats() {
  return {
    totalUsers: MOCK_USERS.length,
    totalResumes: MOCK_RESUMES.length,
    totalPdfDownloads: MOCK_USERS.reduce((s, u) => s + u.pdfDownloadCount, 0),
    totalPdfEmails: MOCK_USERS.reduce((s, u) => s + u.pdfEmailCount, 0),
    totalInterviewRequests: MOCK_USERS.reduce((s, u) => s + u.interviewButtonCount, 0),
  };
}

export function getRecentLogs(limit = 10): ActionLog[] {
  return [...MOCK_ACTION_LOGS]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function getUserById(id: string): AdminUser | undefined {
  return MOCK_USERS.find((u) => u.id === id);
}

export function getResumesByUserId(userId: string): AdminResume[] {
  return MOCK_RESUMES.filter((r) => r.userId === userId);
}

export function getActionLogsByUserId(userId: string): ActionLog[] {
  return MOCK_ACTION_LOGS
    .filter((l) => l.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ── Chart Data Helpers ────────────────────────────────────────────────────────

export interface MonthlyUserPoint {
  month: string; // "YYYY-MM"
  new: number;
  cumulative: number;
}

export interface MonthlyAccessPoint {
  month: string;
  total: number;
  pdf: number;
  interview: number;
  resume: number;
}

export interface EduSegment {
  key: string;
  label: string;
  count: number;
  percent: number;
  color: string;
}

const CHART_MONTHS = ["2024-10", "2024-11", "2024-12", "2025-01", "2025-02"];

export function getUserRegistrationTrend(): MonthlyUserPoint[] {
  let cumulative = 0;
  return CHART_MONTHS.map((m) => {
    const newCount = MOCK_USERS.filter((u) => u.registeredAt.startsWith(m)).length;
    cumulative += newCount;
    return { month: m, new: newCount, cumulative };
  });
}

export function getAccessTrend(): MonthlyAccessPoint[] {
  return CHART_MONTHS.map((m) => {
    const logs = MOCK_ACTION_LOGS.filter((l) => l.createdAt.startsWith(m));
    return {
      month: m,
      total: logs.length,
      pdf: logs.filter((l) => l.action === "pdf_download" || l.action === "pdf_email").length,
      interview: logs.filter((l) => l.action === "interview_request").length,
      resume: logs.filter((l) => l.action === "resume_created" || l.action === "resume_updated").length,
    };
  });
}

const EDU_LABELS: Record<string, string> = {
  grad: "大学院",
  uni_national: "大学（国公立）",
  uni_private: "大学（私立）",
  junior_college: "短大",
  vocational: "専門学校",
  high_school: "高校・その他",
};

const EDU_COLORS: Record<string, string> = {
  grad: "#6366f1",
  uni_national: "#8b5cf6",
  uni_private: "#06b6d4",
  junior_college: "#10b981",
  vocational: "#f59e0b",
  high_school: "#f43f5e",
};

export function getEducationSegments(): EduSegment[] {
  const counts: Record<string, number> = {};
  for (const u of MOCK_USERS) {
    counts[u.educationLevel] = (counts[u.educationLevel] || 0) + 1;
  }
  const total = MOCK_USERS.length;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({
      key,
      label: EDU_LABELS[key] ?? key,
      count,
      percent: Math.round((count / total) * 100),
      color: EDU_COLORS[key] ?? "#94a3b8",
    }));
}
