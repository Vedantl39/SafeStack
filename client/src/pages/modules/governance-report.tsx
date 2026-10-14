import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useGovernanceReport, type ReportData } from "@/hooks/use-governance-report";
import { CategoryBadge } from "@/components/governance/category-badge";
import {
  assessSystem,
  newSystem,
  buildActionPlan,
  companySizeNote,
  COMPANY_CONTROL_ITEMS,
  USE_AREAS,
  PROHIBITED_PRACTICES,
  RULES_VERSION,
  type ReportSystem,
  type SystemAnswers,
  type CompanyControls,
} from "@shared/ai-act-rules";
import { ClipboardCheck, Plus, Trash2, Sparkles, FileText, Copy, Users, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function GovernanceReportBuilder() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { data, isLoading } = useGovernanceReport(!!user);
  const [report, setReport] = useState<ReportData | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [openId, setOpenId] = useState<string | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (data && !loaded.current) {
      setReport(data);
      loaded.current = true;
    }
  }, [data]);

  // Autosave shortly after each change.
  useEffect(() => {
    if (!report || !loaded.current) return;
    setSaveState("saving");
    const t = setTimeout(async () => {
      try {
        await apiRequest("PUT", "/api/governance-report", {
          company: report.company,
          controls: report.controls,
          systems: report.systems,
        });
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 800);
    return () => clearTimeout(t);
  }, [report?.company, report?.controls, report?.systems]);

  const actions = useMemo(() => {
    if (!report) return [];
    const controls = { ...report.controls, literacyTraining: report.controls.literacyTraining || report.completions.length > 0 };
    return buildActionPlan(report.company, controls, report.systems);
  }, [report]);

  if (authLoading) return null;
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
        <Header />
        <main className="py-20 max-w-xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-3">AI Use & Governance Report</h1>
          <p className="text-slate-600 dark:text-slate-300 mb-6">Log in to build your company's report.</p>
          <Button asChild><Link href="/login">Log in</Link></Button>
        </main>
      </div>
    );
  }
  if (isLoading || !report) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
        <Header />
        <div className="py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
      </div>
    );
  }

  const setCompany = (k: keyof ReportData["company"], v: string) => setReport({ ...report, company: { ...report.company, [k]: v } });
  const setControl = (k: keyof CompanyControls, v: boolean | string) => setReport({ ...report, controls: { ...report.controls, [k]: v } });
  const updateSystem = (id: string, patch: Partial<ReportSystem>) =>
    setReport({ ...report, systems: report.systems.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  const addSystem = () => {
    const s = newSystem();
    setReport({ ...report, systems: [...report.systems, s] });
    setOpenId(s.id);
  };
  const removeSystem = (id: string) => setReport({ ...report, systems: report.systems.filter((s) => s.id !== id) });

  const trainingUrl = report.trainingCode ? `${window.location.origin}/training/${report.trainingCode}` : "";
  const sizeNote = companySizeNote(parseInt(report.company.employees, 10) || null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <Header />
      <main className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <ClipboardCheck className="h-6 w-6" />
                <span className="text-sm font-semibold uppercase tracking-wide">AI Use & Governance Report</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Build your report</h1>
              <p className="text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
                List the AI your company uses, answer a few questions about each system, and SafeStack works out what the EU AI Act requires and by when.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500" aria-live="polite">
                {saveState === "saving" ? "Saving..." : saveState === "saved" ? "All changes saved" : saveState === "error" ? "Couldn't save" : ""}
              </span>
              <Button asChild>
                <Link href="/modules/governance-report/view"><FileText className="h-4 w-4 mr-2" />View report</Link>
              </Button>
            </div>
          </div>

          <Tabs defaultValue="company">
            <TabsList className="grid grid-cols-3 w-full sm:w-auto sm:inline-grid mb-6">
              <TabsTrigger value="company">1. Company</TabsTrigger>
              <TabsTrigger value="systems">2. AI systems ({report.systems.length})</TabsTrigger>
              <TabsTrigger value="training">3. Team training ({report.completions.length})</TabsTrigger>
            </TabsList>

            {/* ---------- Company ---------- */}
            <TabsContent value="company" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company details</CardTitle>
                  <CardDescription>These appear on the cover of the report.</CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                  <Field label="Company name" value={report.company.name} onChange={(v) => setCompany("name", v)} placeholder="Brightpath Recruitment Ltd" />
                  <Field label="Sector" value={report.company.sector} onChange={(v) => setCompany("sector", v)} placeholder="Recruitment" />
                  <Field label="Number of employees" value={report.company.employees} onChange={(v) => setCompany("employees", v.replace(/[^0-9]/g, ""))} placeholder="40" />
                  <Field label="Location" value={report.company.location} onChange={(v) => setCompany("location", v)} placeholder="Dublin, Ireland" />
                  <Field label="AI owner (accountable person)" value={report.company.aiOwner} onChange={(v) => setCompany("aiOwner", v)} placeholder="Jane Murphy, Head of Operations" />
                  <Field label="Prepared by" value={report.company.preparedBy} onChange={(v) => setCompany("preparedBy", v)} placeholder="Your name" />
                  <div className="sm:col-span-2">
                    <Field label="Approved AI tools (used in staff training)" value={report.company.approvedTools} onChange={(v) => setCompany("approvedTools", v)} placeholder="Microsoft Copilot (company account), ChatGPT Team" />
                  </div>
                  {sizeNote && <p className="sm:col-span-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-gray-800 rounded-md p-3">{sizeNote}</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Company-wide controls</CardTitle>
                  <CardDescription>Tick what is already in place. Anything unticked goes into the action plan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {COMPANY_CONTROL_ITEMS.map((c) => {
                    const fromTraining = c.key === "literacyTraining" && report.completions.length > 0;
                    return (
                      <label key={c.key} className="flex items-start gap-3 cursor-pointer">
                        <Checkbox
                          checked={!!report.controls[c.key] || fromTraining}
                          disabled={fromTraining}
                          onCheckedChange={(v) => setControl(c.key, v === true)}
                          className="mt-0.5"
                        />
                        <span>
                          <span className="font-medium">{c.label}</span>
                          <span className="block text-xs text-slate-500">
                            {c.article}{c.required ? " · required since " + c.appliesFrom : ""}
                            {fromTraining ? ` · ${report.completions.length} staff completed SafeStack training` : ""}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                  <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <Field label="AI policy approved on" type="date" value={report.controls.aiPolicyDate} onChange={(v) => setControl("aiPolicyDate", v)} />
                    <Field label="Other AI training (if any)" value={report.controls.literacyCoverage} onChange={(v) => setControl("literacyCoverage", v)} placeholder="e.g. Vendor training for recruiters, Mar 2026" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ---------- Systems ---------- */}
            <TabsContent value="systems" className="space-y-4">
              {report.systems.length === 0 && (
                <Card>
                  <CardContent className="py-10 text-center">
                    <p className="font-medium mb-1">No AI systems yet</p>
                    <p className="text-sm text-slate-500 mb-4">Start with the obvious ones: chat assistants, chatbots, hiring tools, AI features inside software you already pay for.</p>
                  </CardContent>
                </Card>
              )}
              {report.systems.map((s) => (
                <SystemCard
                  key={s.id}
                  system={s}
                  open={openId === s.id}
                  onToggle={() => setOpenId(openId === s.id ? null : s.id)}
                  onChange={(patch) => updateSystem(s.id, patch)}
                  onRemove={() => removeSystem(s.id)}
                  toast={toast}
                />
              ))}
              <Button variant="outline" onClick={addSystem} className="w-full"><Plus className="h-4 w-4 mr-2" />Add an AI system</Button>
            </TabsContent>

            {/* ---------- Training ---------- */}
            <TabsContent value="training" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Train your team</CardTitle>
                  <CardDescription>
                    A 10-minute AI literacy course with a short quiz, covering safe use of AI tools with client data, checking AI output, transparency and red lines.
                    Share the link with staff. No account needed. Everyone who passes is added to the training log in your report.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input readOnly value={trainingUrl} className="font-mono text-sm" aria-label="Training link" />
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(trainingUrl);
                        toast({ title: "Link copied", description: "Send it to your team by email or chat." });
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />Copy link
                    </Button>
                    <Button variant="ghost" asChild><a href={trainingUrl} target="_blank" rel="noreferrer">Preview</a></Button>
                  </div>
                  {!report.company.aiOwner || !report.company.approvedTools ? (
                    <p className="text-sm text-amber-700 dark:text-amber-300">Tip: add your AI owner and approved tools on the Company tab so the training names them.</p>
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Training log</CardTitle>
                  <CardDescription>{report.completions.length} people have completed and passed the training.</CardDescription>
                </CardHeader>
                <CardContent>
                  {report.completions.length === 0 ? (
                    <p className="text-sm text-slate-500">No completions yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-slate-500 border-b"><th className="py-2 pr-4">Name</th><th className="py-2 pr-4">Role</th><th className="py-2 pr-4">Score</th><th className="py-2">Completed</th></tr>
                        </thead>
                        <tbody>
                          {report.completions.map((c) => (
                            <tr key={c.id} className="border-b last:border-0">
                              <td className="py-2 pr-4 font-medium">{c.name}</td>
                              <td className="py-2 pr-4">{c.role || "-"}</td>
                              <td className="py-2 pr-4">{c.score}/{c.total}</td>
                              <td className="py-2">{new Date(c.completedAt).toLocaleDateString("en-IE")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="mt-8">
            <CardContent className="py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-semibold">{actions.length} open action{actions.length === 1 ? "" : "s"}, {actions.filter((a) => a.live).length} already in force</p>
                <p className="text-xs text-slate-500">{RULES_VERSION}. Self-assessment aid, not legal advice.</p>
              </div>
              <Button asChild><Link href="/modules/governance-report/view"><FileText className="h-4 w-4 mr-2" />View report</Link></Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  const id = label.toLowerCase().replace(/[^a-z]+/g, "-");
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function YesNo({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
      <div className="flex rounded-md border overflow-hidden shrink-0" role="group" aria-label={label}>
        {[true, false].map((v) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => onChange(v)}
            aria-pressed={value === v}
            className={`px-3 py-1 text-sm ${value === v ? "bg-primary text-primary-foreground" : "bg-transparent hover:bg-slate-100 dark:hover:bg-gray-800"}`}
          >
            {v ? "Yes" : "No"}
          </button>
        ))}
      </div>
    </div>
  );
}

function SystemCard({
  system,
  open,
  onToggle,
  onChange,
  onRemove,
  toast,
}: {
  system: ReportSystem;
  open: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<ReportSystem>) => void;
  onRemove: () => void;
  toast: ReturnType<typeof useToast>["toast"];
}) {
  const [suggesting, setSuggesting] = useState(false);
  const result = assessSystem(system.answers);
  const a = system.answers;
  const setA = (patch: Partial<SystemAnswers>) => onChange({ answers: { ...a, ...patch } });

  const suggest = async () => {
    if (system.purpose.trim().length < 5) {
      toast({ title: "Add a description first", description: "Describe what the system does and who uses it.", variant: "destructive" });
      return;
    }
    setSuggesting(true);
    try {
      const res = await apiRequest("POST", "/api/governance-report/suggest", { name: system.name, supplier: system.supplier, description: system.purpose });
      const body = await res.json();
      onChange({ answers: body.answers, rationale: body.rationale });
      toast({ title: "Answers suggested", description: "Check each answer below. You can change any of them." });
    } catch {
      toast({ title: "Couldn't suggest answers", description: "Please answer the questions manually.", variant: "destructive" });
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <Card>
      <button type="button" onClick={onToggle} className="w-full text-left" aria-expanded={open}>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <div className="min-w-0">
            <CardTitle className="text-lg truncate">{system.name || "Unnamed AI system"}</CardTitle>
            <CardDescription className="truncate">{[system.supplier, system.status === "planned" ? "Planned" : "In use"].filter(Boolean).join(" · ")}</CardDescription>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <CategoryBadge category={result.category} />
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>
      </button>

      {open && (
        <CardContent className="space-y-6 border-t pt-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="System name" value={system.name} onChange={(v) => onChange({ name: v })} placeholder="CV screening tool" />
            <Field label="Supplier" value={system.supplier} onChange={(v) => onChange({ supplier: v })} placeholder="HireCo (or 'Built in-house')" />
            <Field label="Business owner" value={system.owner} onChange={(v) => onChange({ owner: v })} placeholder="Head of Talent" />
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={system.status} onValueChange={(v) => onChange({ status: v as ReportSystem["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_use">In use</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor={`purpose-${system.id}`}>What does it do, and who uses it?</Label>
              <Textarea id={`purpose-${system.id}`} value={system.purpose} rows={3} onChange={(e) => onChange({ purpose: e.target.value })}
                placeholder="Recruiters upload CVs and the tool ranks candidates for each role. Recruiters review the shortlist before contacting anyone." />
              <Button type="button" variant="secondary" size="sm" onClick={suggest} disabled={suggesting}>
                {suggesting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Suggest answers from description
              </Button>
              {system.rationale && <p className="text-xs text-slate-500">Suggestion: {system.rationale}</p>}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-1">About this system</h4>
            <div className="divide-y">
              <div className="flex items-start justify-between gap-4 py-2">
                <div>
                  <p className="text-sm font-medium">Did your company build it?</p>
                  <p className="text-xs text-slate-500">Provider: you built it and offer it under your name. Deployer: you use something someone else built.</p>
                </div>
                <Select value={a.role} onValueChange={(v) => setA({ role: v as SystemAnswers["role"] })}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deployer">No, we use it</SelectItem>
                    <SelectItem value="provider">Yes, we built it</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="py-2 space-y-1.5">
                <p className="text-sm font-medium">Is it used for any of these?</p>
                <Select value={a.useArea} onValueChange={(v) => setA({ useArea: v as SystemAnswers["useArea"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {USE_AREAS.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">{USE_AREAS.find((u) => u.value === a.useArea)?.hint}</p>
              </div>
              {a.useArea !== "none" && a.useArea !== "product_safety" && (
                <>
                  <YesNo label="Does it only do a narrow preparatory task?" hint="E.g. sorting files or spotting duplicates, without materially influencing decisions about people." value={a.narrowTaskOnly} onChange={(v) => setA({ narrowTaskOnly: v })} />
                  <YesNo label="Does it evaluate or predict things about individual people?" hint="E.g. performance, reliability, behaviour or suitability (profiling)." value={a.profilesPeople} onChange={(v) => setA({ profilesPeople: v })} />
                </>
              )}
              <YesNo label="Do people chat or talk with it directly?" hint="Chatbots, voice assistants, AI agents that message customers." value={a.interactsWithPeople} onChange={(v) => setA({ interactsWithPeople: v })} />
              <YesNo label="Does it generate text, images, audio or video?" value={a.generatesContent} onChange={(v) => setA({ generatesContent: v })} />
              {a.generatesContent && a.role === "provider" && (
                <YesNo label="Was it on the market before 2 August 2026?" value={a.onMarketBeforeAug2026} onChange={(v) => setA({ onMarketBeforeAug2026: v })} />
              )}
              <YesNo label="Do you use it to create realistic images, audio or video of real people, places or events?" value={a.createsDeepfakes} onChange={(v) => setA({ createsDeepfakes: v })} />
              <YesNo label="Do you publish AI-written text to inform the public without a person editing it?" value={a.publishesPublicInterestText} onChange={(v) => setA({ publishesPublicInterestText: v })} />
              <YesNo label="Does it detect emotions or categorise people from biometric data?" value={a.emotionOrBiometricCategorisation} onChange={(v) => setA({ emotionOrBiometricCategorisation: v })} />
              {a.role === "provider" && (
                <YesNo label="Is it a general-purpose AI model you trained and supply to others?" value={a.isGeneralPurposeModel} onChange={(v) => setA({ isGeneralPurposeModel: v })} />
              )}
            </div>
          </div>

          <details className="rounded-md border p-3">
            <summary className="text-sm font-medium cursor-pointer">Check against banned practices ({a.prohibited.length} flagged)</summary>
            <div className="space-y-2 mt-3">
              {PROHIBITED_PRACTICES.map((p) => (
                <label key={p.value} className="flex items-start gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={a.prohibited.includes(p.value)}
                    onCheckedChange={(v) => setA({ prohibited: v === true ? [...a.prohibited, p.value] : a.prohibited.filter((x) => x !== p.value) })}
                    className="mt-0.5"
                  />
                  <span>{p.label} <span className="text-xs text-slate-500">(banned from {p.from})</span></span>
                </label>
              ))}
            </div>
          </details>

          <div className="rounded-lg bg-slate-50 dark:bg-gray-800 p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={result.category} long />
              {result.obligations.length > 0 && <span className="text-sm text-slate-600 dark:text-slate-300">Applies from {result.appliesFrom}</span>}
            </div>
            <ul className="text-sm list-disc pl-5 text-slate-700 dark:text-slate-200">
              {result.reasons.map((r) => <li key={r}>{r}</li>)}
            </ul>
            {result.notes.map((n) => <p key={n} className="text-xs text-slate-500">{n}</p>)}
            {result.obligations.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">What's required. Tick what's already in place:</p>
                <div className="space-y-2">
                  {result.obligations.map((o) => (
                    <label key={o.id} className="flex items-start gap-2 text-sm cursor-pointer">
                      <Checkbox checked={!!system.done[o.id]} onCheckedChange={(v) => onChange({ done: { ...system.done, [o.id]: v === true } })} className="mt-0.5" />
                      <span>{o.text} <span className="text-xs text-slate-500">({o.article} · {o.live ? "in force" : "from " + o.appliesFrom})</span></span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`evidence-${system.id}`}>Controls and evidence already in place</Label>
            <Textarea id={`evidence-${system.id}`} rows={2} value={system.evidence} onChange={(e) => onChange({ evidence: e.target.value })}
              placeholder="A recruiter reviews every shortlist. Candidates are told about AI use in the privacy notice (link)." />
          </div>

          <div className="flex justify-end">
            <Button variant="ghost" size="sm" className="text-red-600" onClick={onRemove}><Trash2 className="h-4 w-4 mr-2" />Remove system</Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
