import { useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useGovernanceReport } from "@/hooks/use-governance-report";
import { CategoryBadge } from "@/components/governance/category-badge";
import {
  assessSystem,
  buildActionPlan,
  companySizeNote,
  COMPANY_CONTROL_ITEMS,
  CATEGORY_META,
  RULES_VERSION,
  type Category,
} from "@shared/ai-act-rules";
import { TRAINING_VERSION } from "@shared/ai-training";
import { ArrowLeft, Download, Loader2 } from "lucide-react";

const ORDER: Category[] = ["prohibited", "high_risk_annex_iii", "high_risk_annex_i", "transparency", "minimal"];

export default function GovernanceReportView() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: report, isLoading } = useGovernanceReport(!!user);

  const derived = useMemo(() => {
    if (!report) return null;
    const assessed = report.systems.map((s) => ({ system: s, result: assessSystem(s.answers) }));
    const counts = ORDER.reduce((acc, c) => ({ ...acc, [c]: assessed.filter((x) => x.result.category === c).length }), {} as Record<Category, number>);
    const controls = { ...report.controls, literacyTraining: report.controls.literacyTraining || report.completions.length > 0 };
    const actions = buildActionPlan(report.company, controls, report.systems);
    const roles = Array.from(new Set(report.systems.map((s) => s.answers.role)));
    const suppliers = Array.from(new Set(report.systems.map((s) => s.supplier.trim()).filter(Boolean)));
    return { assessed, counts, controls, actions, roles, suppliers };
  }, [report]);

  if (authLoading) return null;
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="mb-4">Log in to view your report.</p>
          <Button asChild><Link href="/login">Log in</Link></Button>
        </div>
      </div>
    );
  }
  if (isLoading || !report || !derived) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const { company } = report;
  const { assessed, counts, controls, actions, roles, suppliers } = derived;
  const date = company.reportDate || new Date().toISOString().slice(0, 10);
  const prettyDate = new Date(date).toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" });
  const significant = assessed.filter((x) => x.result.category !== "minimal");
  const minimal = assessed.filter((x) => x.result.category === "minimal");
  const sizeNote = companySizeNote(parseInt(company.employees, 10) || null);
  const roleText = roles.length === 0 ? "-" : roles.length === 2 ? "Provider for some systems, deployer for others" : roles[0] === "provider" ? "Provider (we build the AI systems listed)" : "Deployer (we use AI systems built by suppliers)";
  const empty = report.systems.length === 0;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-950 print:bg-white">
      <div className="print:hidden sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Button variant="ghost" asChild><Link href="/modules/governance-report"><ArrowLeft className="h-4 w-4 mr-2" />Edit report</Link></Button>
          <Button onClick={() => window.print()}><Download className="h-4 w-4 mr-2" />Download PDF</Button>
        </div>
      </div>

      <article className="report max-w-4xl mx-auto my-6 print:my-0 bg-white text-slate-900 shadow-sm print:shadow-none rounded-lg print:rounded-none px-6 sm:px-12 py-10 print:px-0 print:py-0">
        {/* Cover / summary */}
        <header className="border-b-4 border-slate-900 pb-6 mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">AI Use & Governance Report</p>
          <h1 className="text-3xl sm:text-4xl font-bold mt-2">{company.name || "Your company"}</h1>
          <p className="text-slate-600 mt-2">
            {[company.employees && `${company.employees} staff`, company.sector, company.location].filter(Boolean).join(" · ") || "Add company details in the builder"}
          </p>
          <dl className="grid sm:grid-cols-3 gap-4 mt-6 text-sm">
            <div><dt className="text-slate-500">Report date</dt><dd className="font-medium">{prettyDate}</dd></div>
            <div><dt className="text-slate-500">AI owner</dt><dd className="font-medium">{company.aiOwner || "Not assigned"}</dd></div>
            <div><dt className="text-slate-500">Assessed against</dt><dd className="font-medium">EU AI Act, as amended by Reg. 2026/1744</dd></div>
          </dl>
        </header>

        <Section n={1} title="Summary">
          {empty ? (
            <p className="text-slate-600">No AI systems have been added yet.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
                <Stat label="AI systems" value={report.systems.length} />
                <Stat label="Prohibited" value={counts.prohibited} alert={counts.prohibited > 0} />
                <Stat label="High-risk" value={counts.high_risk_annex_iii + counts.high_risk_annex_i} />
                <Stat label="Transparency" value={counts.transparency} />
                <Stat label="Minimal" value={counts.minimal} />
              </div>
              <ul className="space-y-1.5 text-sm">
                <li><strong>Our role:</strong> {roleText}</li>
                <li><strong>Open actions:</strong> {actions.length} ({actions.filter((a) => a.live).length} relate to obligations already in force)</li>
                <li><strong>Staff AI training:</strong> {report.completions.length > 0 ? `${report.completions.length} ${report.completions.length === 1 ? "person" : "people"} completed and passed` : controls.literacyTraining ? "In place" : "Not yet in place"}</li>
                {sizeNote && <li><strong>Company size:</strong> {sizeNote}</li>}
              </ul>
            </>
          )}
        </Section>

        <Section n={2} title="AI inventory">
          {empty ? <p className="text-slate-600">No systems listed.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left border-b-2 border-slate-300">
                    <th className="py-2 pr-3">System</th><th className="py-2 pr-3">Supplier</th><th className="py-2 pr-3">Used for</th><th className="py-2 pr-3">Category</th><th className="py-2 pr-3">Applies from</th><th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assessed.map(({ system: s, result: r }) => {
                    const open = r.obligations.filter((o) => !s.done[o.id]).length;
                    return (
                      <tr key={s.id} className="border-b border-slate-200 align-top break-inside-avoid">
                        <td className="py-2 pr-3 font-medium">{s.name || "Unnamed"}</td>
                        <td className="py-2 pr-3">{s.supplier || "-"}</td>
                        <td className="py-2 pr-3 max-w-[14rem]">{s.purpose ? truncate(s.purpose, 90) : "-"}</td>
                        <td className="py-2 pr-3"><CategoryBadge category={r.category} /></td>
                        <td className="py-2 pr-3 whitespace-nowrap">{r.obligations.length ? r.appliesFrom : "n/a"}</td>
                        <td className="py-2 whitespace-nowrap">{r.obligations.length === 0 ? "No actions" : open === 0 ? "Compliant" : `${open} open`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {significant.length > 0 && (
          <Section n={3} title="System assessments">
            <div className="space-y-6">
              {significant
                .sort((x, y) => ORDER.indexOf(x.result.category) - ORDER.indexOf(y.result.category))
                .map(({ system: s, result: r }) => (
                  <div key={s.id} className="border border-slate-200 rounded-md p-4 break-inside-avoid">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{s.name || "Unnamed"}</h3>
                      <CategoryBadge category={r.category} long />
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      {[s.supplier && `Supplier: ${s.supplier}`, `Our role: ${s.answers.role === "provider" ? "provider" : "deployer"}`, s.owner && `Owner: ${s.owner}`].filter(Boolean).join(" · ")}
                    </p>
                    {s.purpose && <p className="text-sm mb-3">{s.purpose}</p>}
                    <p className="text-sm font-semibold">Why this category</p>
                    <ul className="text-sm list-disc pl-5 mb-3">{r.reasons.map((x) => <li key={x}>{x}</li>)}</ul>
                    {r.obligations.length > 0 && (
                      <>
                        <p className="text-sm font-semibold">Requirements</p>
                        <table className="w-full text-sm mb-3">
                          <tbody>
                            {r.obligations.map((o) => (
                              <tr key={o.id} className="border-b border-slate-100 last:border-0 align-top">
                                <td className="py-1 pr-2 w-6">{s.done[o.id] ? "✓" : "○"}</td>
                                <td className="py-1 pr-3">{o.text}</td>
                                <td className="py-1 pr-3 text-slate-500 whitespace-nowrap">{o.article}</td>
                                <td className="py-1 whitespace-nowrap">{s.done[o.id] ? "In place" : o.live ? "Due now" : `By ${o.appliesFrom}`}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    )}
                    {s.evidence && <p className="text-sm"><strong>Controls in place:</strong> {s.evidence}</p>}
                    {r.notes.map((n) => <p key={n} className="text-xs text-slate-500 mt-1">{n}</p>)}
                  </div>
                ))}
            </div>
            {minimal.length > 0 && (
              <p className="text-sm text-slate-600 mt-4">
                Minimal-risk systems with no system-specific obligations: {minimal.map((m) => m.system.name || "Unnamed").join(", ")}.
              </p>
            )}
          </Section>
        )}

        <Section n={significant.length > 0 ? 4 : 3} title="Suppliers">
          {suppliers.length === 0 ? <p className="text-sm text-slate-600">No suppliers listed.</p> : (
            <>
              <ul className="text-sm space-y-1 mb-3">
                {suppliers.map((sup) => (
                  <li key={sup}><strong>{sup}:</strong> {report.systems.filter((s) => s.supplier.trim() === sup).map((s) => s.name || "Unnamed").join(", ")}</li>
                ))}
              </ul>
              <p className="text-sm text-slate-600">
                Supplier AI Act checks: {controls.supplierChecks ? "suppliers are checked for AI Act compliance before purchase." : "not yet formalised (see action plan)."}
              </p>
            </>
          )}
        </Section>

        <Section n={significant.length > 0 ? 5 : 4} title="Company-wide controls">
          <table className="w-full text-sm mb-4">
            <tbody>
              {COMPANY_CONTROL_ITEMS.map((c) => (
                <tr key={c.key} className="border-b border-slate-100 align-top">
                  <td className="py-1.5 pr-2 w-6">{controls[c.key] ? "✓" : "○"}</td>
                  <td className="py-1.5 pr-3">{c.label}{c.key === "aiPolicy" && controls.aiPolicyDate ? ` (approved ${new Date(controls.aiPolicyDate).toLocaleDateString("en-IE")})` : ""}</td>
                  <td className="py-1.5 text-slate-500 whitespace-nowrap">{c.article}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3 className="font-semibold mb-2">AI literacy training log (Article 4)</h3>
          {report.completions.length === 0 ? (
            <p className="text-sm text-slate-600">{controls.literacyCoverage || "No training completions recorded in SafeStack yet."}</p>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead><tr className="text-left border-b-2 border-slate-300"><th className="py-1.5 pr-3">Name</th><th className="py-1.5 pr-3">Role</th><th className="py-1.5 pr-3">Score</th><th className="py-1.5">Completed</th></tr></thead>
                <tbody>
                  {report.completions.map((c) => (
                    <tr key={c.id} className="border-b border-slate-100">
                      <td className="py-1.5 pr-3">{c.name}</td><td className="py-1.5 pr-3">{c.role || "-"}</td><td className="py-1.5 pr-3">{c.score}/{c.total}</td><td className="py-1.5">{new Date(c.completedAt).toLocaleDateString("en-IE")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-slate-500 mt-2">Course: {TRAINING_VERSION}. Pass mark 80%.{controls.literacyCoverage ? ` Other training: ${controls.literacyCoverage}.` : ""}</p>
            </>
          )}
        </Section>

        <Section n={significant.length > 0 ? 6 : 5} title="Action plan">
          {actions.length === 0 ? <p className="text-sm text-slate-600">No open actions.</p> : (
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b-2 border-slate-300"><th className="py-1.5 pr-3">Action</th><th className="py-1.5 pr-3">System</th><th className="py-1.5 pr-3">Owner</th><th className="py-1.5">Due</th></tr></thead>
              <tbody>
                {actions.map((a, i) => (
                  <tr key={i} className="border-b border-slate-100 align-top break-inside-avoid">
                    <td className="py-1.5 pr-3">{a.text} <span className="text-slate-500">({a.article})</span></td>
                    <td className="py-1.5 pr-3">{a.system}</td>
                    <td className="py-1.5 pr-3">{a.owner || "-"}</td>
                    <td className={`py-1.5 whitespace-nowrap ${a.live ? "font-semibold text-red-700" : ""}`}>{a.due}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        <footer className="mt-10 pt-6 border-t-2 border-slate-900 text-sm break-inside-avoid">
          <div className="grid sm:grid-cols-3 gap-6 mb-6">
            <div><p className="text-slate-500">Prepared by</p><p className="font-medium border-b border-slate-300 pb-1 min-h-[1.75rem]">{company.preparedBy}</p></div>
            <div><p className="text-slate-500">Approved by</p><p className="border-b border-slate-300 pb-1 min-h-[1.75rem]"></p></div>
            <div><p className="text-slate-500">Next review</p><p className="font-medium border-b border-slate-300 pb-1 min-h-[1.75rem]">{nextReview(date)}</p></div>
          </div>
          <p className="text-xs text-slate-500">
            This is a self-assessment produced with SafeStack. It is not legal advice and does not certify compliance. Categories are based on the answers provided.
            {" "}{RULES_VERSION}. Category definitions: {ORDER.map((c) => CATEGORY_META[c].label).join("; ")}.
          </p>
        </footer>
      </article>
    </div>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4 flex items-baseline gap-3 break-after-avoid">
        <span className="text-slate-400 tabular-nums">{n}.</span>{title}
      </h2>
      {children}
    </section>
  );
}

function Stat({ label, value, alert }: { label: string; value: number; alert?: boolean }) {
  return (
    <div className={`rounded-md border p-3 ${alert ? "border-red-300 bg-red-50" : "border-slate-200"}`}>
      <div className={`text-2xl font-bold tabular-nums ${alert ? "text-red-700" : ""}`}>{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
}

function nextReview(isoDate: string) {
  const d = new Date(isoDate);
  d.setMonth(d.getMonth() + 6);
  return d.toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" });
}
