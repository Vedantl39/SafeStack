// EU AI Act rules engine for the AI Use & Governance Report.
// Based on Regulation (EU) 2024/1689 as amended by the Digital Omnibus on AI,
// Regulation (EU) 2026/1744 (in force 27 July 2026).
// This is a self-assessment aid, not legal advice.

export const RULES_VERSION = "EU AI Act as amended by Regulation (EU) 2026/1744 · rules updated 14 Oct 2026";

export type Role = "deployer" | "provider";

export type UseArea =
  | "none"
  | "employment"
  | "education"
  | "credit"
  | "insurance"
  | "public_services"
  | "biometrics"
  | "critical_infrastructure"
  | "law_enforcement"
  | "migration"
  | "justice"
  | "product_safety";

export const USE_AREAS: { value: UseArea; label: string; hint: string }[] = [
  { value: "none", label: "None of these (general business use)", hint: "Drafting, analytics, marketing, customer service, coding help" },
  { value: "employment", label: "Hiring, managing or monitoring workers", hint: "CV screening, interview scoring, promotion or termination decisions, task allocation, performance monitoring" },
  { value: "education", label: "Education and training", hint: "Admissions, grading, assessing students, detecting cheating" },
  { value: "credit", label: "Creditworthiness or credit scoring", hint: "Deciding who gets a loan or credit (fraud detection is excluded)" },
  { value: "insurance", label: "Life or health insurance pricing", hint: "Risk assessment and pricing for life or health insurance" },
  { value: "public_services", label: "Access to public benefits or emergency services", hint: "Eligibility for benefits, prioritising emergency calls" },
  { value: "biometrics", label: "Biometric identification or categorisation", hint: "Recognising people from face, voice or other biometrics; emotion recognition" },
  { value: "critical_infrastructure", label: "Safety of critical infrastructure", hint: "Energy, water, gas, heating, road traffic, critical digital infrastructure" },
  { value: "law_enforcement", label: "Law enforcement", hint: "Used by or for police and similar authorities" },
  { value: "migration", label: "Migration, asylum or border control", hint: "" },
  { value: "justice", label: "Justice or elections", hint: "Assisting courts, influencing election outcomes" },
  { value: "product_safety", label: "Safety component of a regulated product", hint: "AI inside medical devices, machinery, toys, vehicles, lifts and other products that need third-party conformity assessment" },
];

export type ProhibitedFlag =
  | "manipulation"
  | "exploit_vulnerability"
  | "social_scoring"
  | "crime_prediction_profiling"
  | "face_scraping"
  | "emotion_work_school"
  | "sensitive_biometric_categorisation"
  | "realtime_public_biometric_id"
  | "intimate_imagery"
  | "csam";

export const PROHIBITED_PRACTICES: { value: ProhibitedFlag; label: string; from: string }[] = [
  { value: "manipulation", label: "Uses subliminal or manipulative techniques that distort behaviour and cause significant harm", from: "2 Feb 2025" },
  { value: "exploit_vulnerability", label: "Exploits people's age, disability or social/economic situation to distort their behaviour", from: "2 Feb 2025" },
  { value: "social_scoring", label: "Scores people on social behaviour or personal traits, leading to unfair treatment", from: "2 Feb 2025" },
  { value: "crime_prediction_profiling", label: "Predicts whether someone will commit a crime based only on profiling or personality", from: "2 Feb 2025" },
  { value: "face_scraping", label: "Builds facial recognition databases by scraping images from the internet or CCTV", from: "2 Feb 2025" },
  { value: "emotion_work_school", label: "Infers emotions of people at work or in education (except for medical or safety reasons)", from: "2 Feb 2025" },
  { value: "sensitive_biometric_categorisation", label: "Uses biometrics to infer race, political views, religion, sexual orientation or similar", from: "2 Feb 2025" },
  { value: "realtime_public_biometric_id", label: "Real-time remote biometric identification in public spaces for law enforcement", from: "2 Feb 2025" },
  { value: "intimate_imagery", label: "Generates non-consensual intimate or sexual images of identifiable people ('nudify')", from: "2 Dec 2026" },
  { value: "csam", label: "Generates child sexual abuse material", from: "2 Dec 2026" },
];

export interface SystemAnswers {
  role: Role;
  useArea: UseArea;
  narrowTaskOnly: boolean; // Art. 6(3): narrow procedural/preparatory task, no material influence on decisions
  profilesPeople: boolean; // profiling of natural persons removes the Art. 6(3) exception
  interactsWithPeople: boolean; // chatbots, voice agents
  generatesContent: boolean; // synthetic text, images, audio, video
  createsDeepfakes: boolean; // realistic content of real people, places or events
  publishesPublicInterestText: boolean; // AI-written text published to inform the public, without editorial review
  emotionOrBiometricCategorisation: boolean; // permitted emotion recognition / biometric categorisation
  onMarketBeforeAug2026: boolean; // for the Art. 50(2) marking grace period (providers)
  isGeneralPurposeModel: boolean; // provider of a general-purpose AI model
  prohibited: ProhibitedFlag[];
}

export const DEFAULT_ANSWERS: SystemAnswers = {
  role: "deployer",
  useArea: "none",
  narrowTaskOnly: false,
  profilesPeople: false,
  interactsWithPeople: false,
  generatesContent: false,
  createsDeepfakes: false,
  publishesPublicInterestText: false,
  emotionOrBiometricCategorisation: false,
  onMarketBeforeAug2026: false,
  isGeneralPurposeModel: false,
  prohibited: [],
};

export type Category =
  | "prohibited"
  | "high_risk_annex_iii"
  | "high_risk_annex_i"
  | "transparency"
  | "minimal";

export const CATEGORY_META: Record<Category, { label: string; short: string; tone: "red" | "orange" | "amber" | "green" }> = {
  prohibited: { label: "Prohibited practice", short: "Prohibited", tone: "red" },
  high_risk_annex_iii: { label: "High-risk (Annex III use case)", short: "High-risk", tone: "orange" },
  high_risk_annex_i: { label: "High-risk (Annex I regulated product)", short: "High-risk", tone: "orange" },
  transparency: { label: "Transparency obligations (Article 50)", short: "Transparency", tone: "amber" },
  minimal: { label: "Minimal risk", short: "Minimal", tone: "green" },
};

export interface Obligation {
  id: string;
  text: string;
  article: string;
  appliesFrom: string; // human-readable date
  live: boolean; // already applies today
}

export interface Assessment {
  category: Category;
  reasons: string[];
  appliesFrom: string;
  obligations: Obligation[];
  notes: string[];
}

const HIGH_RISK_LABEL: Partial<Record<UseArea, string>> = {
  employment: "employment and management of workers (Annex III, point 4)",
  education: "education and vocational training (Annex III, point 3)",
  credit: "creditworthiness assessment (Annex III, point 5(b))",
  insurance: "life and health insurance pricing (Annex III, point 5(c))",
  public_services: "access to essential public services (Annex III, point 5)",
  biometrics: "biometrics (Annex III, point 1)",
  critical_infrastructure: "critical infrastructure (Annex III, point 2)",
  law_enforcement: "law enforcement (Annex III, point 6)",
  migration: "migration, asylum and border control (Annex III, point 7)",
  justice: "administration of justice and democratic processes (Annex III, point 8)",
};

const ANNEX_III_DATE = "2 Dec 2027";
const ANNEX_I_DATE = "2 Aug 2028";

function highRiskObligations(role: Role, area: UseArea, date: string): Obligation[] {
  const o = (id: string, text: string, article: string): Obligation => ({ id, text, article, appliesFrom: date, live: false });
  if (role === "provider") {
    return [
      o("hr-p-risk", "Run a risk management system across the system's lifecycle", "Art. 9"),
      o("hr-p-data", "Apply data governance to training, validation and test data", "Art. 10"),
      o("hr-p-docs", "Prepare technical documentation", "Art. 11"),
      o("hr-p-logs", "Build in automatic event logging", "Art. 12"),
      o("hr-p-instr", "Provide clear instructions for use to deployers", "Art. 13"),
      o("hr-p-oversight", "Design for effective human oversight", "Art. 14"),
      o("hr-p-robust", "Ensure accuracy, robustness and cybersecurity", "Art. 15"),
      o("hr-p-qms", "Operate a quality management system", "Art. 17"),
      o("hr-p-ca", "Complete conformity assessment, EU declaration and CE marking", "Art. 43, 47, 48"),
      o("hr-p-reg", "Register the system in the EU database", "Art. 49"),
      o("hr-p-pmm", "Run post-market monitoring and report serious incidents", "Art. 72, 73"),
    ];
  }
  const list = [
    o("hr-d-instr", "Use the system in line with the provider's instructions", "Art. 26(1)"),
    o("hr-d-oversight", "Assign trained, competent people to oversee it", "Art. 26(2)"),
    o("hr-d-data", "Make sure input data you control is relevant and representative", "Art. 26(4)"),
    o("hr-d-monitor", "Monitor operation and report risks or serious incidents to the provider", "Art. 26(5)"),
    o("hr-d-logs", "Keep the system's logs for at least six months", "Art. 26(6)"),
    o("hr-d-inform", "Tell people when a high-risk system makes or assists decisions about them", "Art. 26(11)"),
  ];
  if (area === "employment") {
    list.push(o("hr-d-workers", "Inform workers and their representatives before using it at work", "Art. 26(7)"));
  }
  if (area === "credit" || area === "insurance") {
    list.push(o("hr-d-fria", "Carry out a fundamental rights impact assessment before first use", "Art. 27"));
  }
  list.push(o("hr-d-explain", "Be ready to explain decisions to affected people on request", "Art. 86"));
  return list;
}

export function assessSystem(a: SystemAnswers): Assessment {
  const reasons: string[] = [];
  const notes: string[] = [];
  const obligations: Obligation[] = [];

  // 1. Prohibited practices
  if (a.prohibited.length > 0) {
    const items = PROHIBITED_PRACTICES.filter((p) => a.prohibited.includes(p.value));
    for (const p of items) reasons.push(`${p.label} (Art. 5, banned from ${p.from})`);
    const earliest = items.some((p) => p.from === "2 Feb 2025") ? "2 Feb 2025" : "2 Dec 2026";
    obligations.push({
      id: "prohibited-stop",
      text: "Stop using or supplying this system in the EU, or remove the prohibited function",
      article: "Art. 5",
      appliesFrom: earliest,
      live: earliest === "2 Feb 2025",
    });
    return { category: "prohibited", reasons, appliesFrom: earliest, obligations, notes };
  }

  let category: Category = "minimal";
  let appliesFrom = "No specific obligations";

  // 2. High-risk
  if (a.useArea === "product_safety") {
    category = "high_risk_annex_i";
    appliesFrom = ANNEX_I_DATE;
    reasons.push("Safety component of a product covered by EU product legislation (Art. 6(1), Annex I)");
    obligations.push(...highRiskObligations(a.role, a.useArea, ANNEX_I_DATE));
  } else if (a.useArea !== "none") {
    const area = HIGH_RISK_LABEL[a.useArea]!;
    const exception = a.narrowTaskOnly && !a.profilesPeople;
    if (exception) {
      reasons.push(`Used in ${area}, but only for a narrow procedural or preparatory task that does not materially influence decisions`);
      notes.push("Likely not high-risk under the Art. 6(3) exception. Document this assessment and keep it on file; providers must also register it (Art. 49(2)).");
    } else {
      category = "high_risk_annex_iii";
      appliesFrom = ANNEX_III_DATE;
      reasons.push(`Used in ${area}`);
      if (a.narrowTaskOnly && a.profilesPeople) {
        notes.push("The Art. 6(3) exception does not apply because the system profiles individuals.");
      }
      obligations.push(...highRiskObligations(a.role, a.useArea, ANNEX_III_DATE));
      notes.push("Public authorities using high-risk systems already on the market have until 2 Aug 2030.");
    }
  }

  // 3. Transparency (can apply on top of high-risk)
  const transparency: Obligation[] = [];
  const LIVE = "2 Aug 2026";
  if (a.interactsWithPeople) {
    transparency.push(
      a.role === "provider"
        ? { id: "t-chat", text: "Design it so people know they are interacting with AI, at the latest at first interaction", article: "Art. 50(1)", appliesFrom: LIVE, live: true }
        : { id: "t-chat", text: "Make sure users are told they are talking to AI (check the supplier's disclosure is switched on)", article: "Art. 50(1)", appliesFrom: LIVE, live: true },
    );
    reasons.push("Interacts directly with people");
  }
  if (a.generatesContent && a.role === "provider") {
    const date = a.onMarketBeforeAug2026 ? "2 Dec 2026" : LIVE;
    transparency.push({ id: "t-mark", text: "Mark generated content in a machine-readable, detectable way", article: "Art. 50(2)", appliesFrom: date, live: date === LIVE });
    reasons.push("Generates synthetic content");
  }
  if (a.createsDeepfakes) {
    transparency.push({ id: "t-deepfake", text: "Clearly disclose that realistic images, audio or video were AI-generated or altered", article: "Art. 50(4)", appliesFrom: LIVE, live: true });
    reasons.push("Produces realistic content that could pass as real (deepfakes)");
  }
  if (a.publishesPublicInterestText) {
    transparency.push({ id: "t-text", text: "Disclose AI-generated text published to inform the public, unless a person reviews and takes editorial responsibility", article: "Art. 50(4)", appliesFrom: LIVE, live: true });
    reasons.push("Publishes AI-written text on matters of public interest");
  }
  if (a.emotionOrBiometricCategorisation) {
    transparency.push({ id: "t-emotion", text: "Inform people exposed to emotion recognition or biometric categorisation", article: "Art. 50(3)", appliesFrom: LIVE, live: true });
    reasons.push("Uses emotion recognition or biometric categorisation");
  }
  if (transparency.length > 0) {
    obligations.push(...transparency);
    if (category === "minimal") {
      category = "transparency";
      appliesFrom = transparency.some((t) => t.live) ? `${LIVE} (in force)` : transparency[0].appliesFrom;
    }
  }

  // 4. General-purpose AI models
  if (a.isGeneralPurposeModel && a.role === "provider") {
    obligations.push(
      { id: "g-docs", text: "Keep technical documentation and share information with downstream providers", article: "Art. 53(1)(a)-(b)", appliesFrom: "2 Aug 2025", live: true },
      { id: "g-copyright", text: "Put in place a copyright policy", article: "Art. 53(1)(c)", appliesFrom: "2 Aug 2025", live: true },
      { id: "g-summary", text: "Publish a summary of training content using the Commission template", article: "Art. 53(1)(d)", appliesFrom: "2 Aug 2025", live: true },
    );
    reasons.push("General-purpose AI model placed on the EU market");
    notes.push("Models placed on the market before 2 Aug 2025 have until 2 Aug 2027. Signing the GPAI Code of Practice can help demonstrate compliance.");
  }

  if (category === "minimal" && reasons.length === 0) {
    reasons.push("Not a prohibited practice, not in a high-risk area, and no transparency triggers");
    notes.push("No system-specific obligations. Company-wide AI literacy still applies.");
  }

  return { category, reasons, appliesFrom, obligations, notes };
}

// Company-wide controls that apply regardless of individual systems.
export interface CompanyControls {
  aiPolicy: boolean;
  aiPolicyDate: string;
  literacyTraining: boolean;
  literacyLastDate: string;
  literacyCoverage: string; // e.g. "All staff" / "Managers only"
  incidentProcess: boolean;
  supplierChecks: boolean;
}

export const DEFAULT_CONTROLS: CompanyControls = {
  aiPolicy: false,
  aiPolicyDate: "",
  literacyTraining: false,
  literacyLastDate: "",
  literacyCoverage: "",
  incidentProcess: false,
  supplierChecks: false,
};

export const COMPANY_CONTROL_ITEMS: { key: keyof CompanyControls; label: string; article: string; appliesFrom: string; required: boolean }[] = [
  { key: "literacyTraining", label: "Staff who use or oversee AI have had AI literacy training", article: "Art. 4", appliesFrom: "2 Feb 2025", required: true },
  { key: "aiPolicy", label: "An approved AI use policy is in place", article: "Good practice (ISO/IEC 42001)", appliesFrom: "Recommended", required: false },
  { key: "incidentProcess", label: "There is a process to report and handle AI incidents and complaints", article: "Art. 26(5), 73 (high-risk)", appliesFrom: "Recommended", required: false },
  { key: "supplierChecks", label: "AI suppliers are checked for AI Act compliance before purchase", article: "Good practice", appliesFrom: "Recommended", required: false },
];

export function companySizeNote(employees: number | null): string {
  if (!employees || employees <= 0) return "";
  if (employees < 250) return "Likely an SME: fines are capped at the lower of the fixed amount or the percentage of turnover, and simplified documentation options apply.";
  if (employees < 750) return "May qualify as a 'small mid-cap' (under 750 staff, up to €150m turnover): SME simplifications were extended to this group by Regulation 2026/1744.";
  return "";
}

// ---- Report data model ----

export interface CompanyProfile {
  name: string;
  sector: string;
  employees: string;
  location: string;
  aiOwner: string;
  preparedBy: string;
  reportDate: string; // yyyy-mm-dd
  approvedTools: string;
}

export const DEFAULT_COMPANY: CompanyProfile = {
  name: "",
  sector: "",
  employees: "",
  location: "",
  aiOwner: "",
  preparedBy: "",
  reportDate: "",
  approvedTools: "",
};

export interface ReportSystem {
  id: string;
  name: string;
  supplier: string;
  purpose: string;
  owner: string;
  status: "in_use" | "planned";
  answers: SystemAnswers;
  done: Record<string, boolean>; // obligation id -> already in place
  evidence: string; // what is already in place / where the proof lives
  rationale?: string; // AI pre-fill explanation
}

export interface ActionItem {
  system: string;
  text: string;
  article: string;
  due: string;
  live: boolean;
  owner: string;
}

export function buildActionPlan(company: CompanyProfile, controls: CompanyControls, systems: ReportSystem[]): ActionItem[] {
  const items: ActionItem[] = [];
  for (const c of COMPANY_CONTROL_ITEMS) {
    if (!controls[c.key]) {
      items.push({ system: "Company-wide", text: c.label, article: c.article, due: c.required ? `${c.appliesFrom} (in force)` : "Recommended", live: c.required, owner: company.aiOwner });
    }
  }
  for (const s of systems) {
    const a = assessSystem(s.answers);
    for (const o of a.obligations) {
      if (!s.done[o.id]) {
        items.push({ system: s.name || "Unnamed system", text: o.text, article: o.article, due: o.live ? `${o.appliesFrom} (in force)` : o.appliesFrom, live: o.live, owner: s.owner || company.aiOwner });
      }
    }
  }
  // In-force items first, then by date text.
  return items.sort((x, y) => Number(y.live) - Number(x.live));
}

export function newSystem(): ReportSystem {
  return {
    id: Math.random().toString(36).slice(2, 10),
    name: "",
    supplier: "",
    purpose: "",
    owner: "",
    status: "in_use",
    answers: { ...DEFAULT_ANSWERS, prohibited: [] },
    done: {},
    evidence: "",
  };
}
