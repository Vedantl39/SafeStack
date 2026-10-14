import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { LESSONS, QUIZ, PASS_MARK, fillTemplate } from "@shared/ai-training";
import { Shield, CheckCircle2, XCircle, Loader2, GraduationCap } from "lucide-react";

type Step = { kind: "intro" } | { kind: "lesson"; index: number } | { kind: "quiz" } | { kind: "result"; correct: number; total: number; passed: boolean };

export default function Training() {
  const [, params] = useRoute("/training/:code");
  const code = params?.code ?? "";
  const [step, setStep] = useState<Step>({ kind: "intro" });
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { data: info, isLoading, isError } = useQuery({
    queryKey: ["/api/training", code],
    queryFn: async () => {
      const res = await fetch(`/api/training/${encodeURIComponent(code)}`);
      if (!res.ok) throw new Error("not found");
      return res.json() as Promise<{ companyName: string; aiOwner: string; approvedTools: string }>;
    },
    enabled: !!code,
    retry: false,
  });

  const fill = (t: string) => fillTemplate(t, info?.aiOwner ?? "", info?.approvedTools ?? "");
  const totalSteps = LESSONS.length + 1;
  const progress = step.kind === "intro" ? 0 : step.kind === "lesson" ? (step.index / totalSteps) * 100 : step.kind === "quiz" ? (LESSONS.length / totalSteps) * 100 : 100;

  const submit = async () => {
    if (Object.keys(answers).length < QUIZ.length) {
      setError("Please answer every question.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/training/${encodeURIComponent(code)}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, answers }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message);
      setStep({ kind: "result", ...body });
      window.scrollTo({ top: 0 });
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-semibold">SafeStack</span>
          <span className="text-slate-400">·</span>
          <span className="text-sm text-slate-600 dark:text-slate-300 truncate">{info?.companyName ? `${info.companyName} AI training` : "AI training"}</span>
        </div>
        {step.kind !== "intro" && <Progress value={progress} className="h-1 rounded-none" />}
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {isLoading && <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>}
        {(isError || !code) && (
          <Card><CardContent className="py-10 text-center">
            <p className="font-medium mb-1">This training link isn't valid</p>
            <p className="text-sm text-slate-500">Ask the person who sent it for a new link.</p>
          </CardContent></Card>
        )}

        {info && step.kind === "intro" && (
          <Card>
            <CardHeader>
              <GraduationCap className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-2xl">Using AI safely at work</CardTitle>
              <CardDescription>
                {info.companyName || "Your company"} asks everyone who uses AI tools to complete this short course. It takes about 10 minutes: {LESSONS.length} short lessons and an {QUIZ.length}-question quiz. You need {Math.round(PASS_MARK * 100)}% to pass.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Your full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role">Your role (optional)</Label>
                <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Recruiter" />
              </div>
              <Button className="w-full" disabled={name.trim().length < 2} onClick={() => setStep({ kind: "lesson", index: 0 })}>Start</Button>
            </CardContent>
          </Card>
        )}

        {info && step.kind === "lesson" && (() => {
          const lesson = LESSONS[step.index];
          return (
            <Card>
              <CardHeader>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Lesson {step.index + 1} of {LESSONS.length} · {lesson.minutes} min</p>
                <CardTitle className="text-2xl">{lesson.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <ul className="space-y-3">
                  {lesson.points.map((p) => (
                    <li key={p} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" /><span>{fill(p)}</span></li>
                  ))}
                </ul>
                {lesson.example && (
                  <div className="rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 p-4 text-sm">
                    <strong>Example: </strong>{fill(lesson.example)}
                  </div>
                )}
                <div className="flex justify-between gap-3 pt-2">
                  <Button variant="ghost" onClick={() => setStep(step.index === 0 ? { kind: "intro" } : { kind: "lesson", index: step.index - 1 })}>Back</Button>
                  <Button onClick={() => { setStep(step.index + 1 < LESSONS.length ? { kind: "lesson", index: step.index + 1 } : { kind: "quiz" }); window.scrollTo({ top: 0 }); }}>
                    {step.index + 1 < LESSONS.length ? "Next lesson" : "Go to quiz"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {info && step.kind === "quiz" && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Quiz</h1>
            {QUIZ.map((q, qi) => (
              <Card key={q.id}>
                <CardContent className="pt-6">
                  <fieldset>
                    <legend className="font-medium mb-3">{qi + 1}. {q.question}</legend>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => (
                        <label key={oi} className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer ${answers[q.id] === oi ? "border-primary bg-primary/5" : "hover:bg-slate-50 dark:hover:bg-gray-800"}`}>
                          <input type="radio" name={q.id} className="mt-1" checked={answers[q.id] === oi} onChange={() => setAnswers({ ...answers, [q.id]: oi })} />
                          <span className="text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </CardContent>
              </Card>
            ))}
            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
            <div className="flex justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep({ kind: "lesson", index: LESSONS.length - 1 })}>Back to lessons</Button>
              <Button onClick={submit} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Submit answers</Button>
            </div>
          </div>
        )}

        {info && step.kind === "result" && (
          <Card>
            <CardContent className="py-10 text-center space-y-3">
              {step.passed ? <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" /> : <XCircle className="h-12 w-12 text-red-600 mx-auto" />}
              <h1 className="text-2xl font-bold">{step.passed ? "You passed" : "Not quite there"}</h1>
              <p className="text-slate-600 dark:text-slate-300">You scored {step.correct} out of {step.total}.</p>
              {step.passed ? (
                <p className="text-sm text-slate-500">Your completion has been recorded for {info.companyName || "your company"}. You can close this page.</p>
              ) : (
                <>
                  <div className="text-left space-y-3 pt-4">
                    {QUIZ.filter((q) => answers[q.id] !== q.correct).map((q) => (
                      <div key={q.id} className="rounded-md border p-3 text-sm">
                        <p className="font-medium">{q.question}</p>
                        <p className="text-slate-600 dark:text-slate-300 mt-1">{q.explanation}</p>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => { setAnswers({}); setStep({ kind: "lesson", index: 0 }); }}>Review lessons and try again</Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
