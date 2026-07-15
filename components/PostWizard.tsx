"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { TemplateSelector } from "@/components/TemplateSelector";
import { createPostAction } from "@/server/actions/post";
import { useToast } from "@/lib/toast";
import type { Dictionary, Locale } from "@/locales";

// ── Types ───────────────────────────────────────

interface Language { id: string; name: string; nativeName: string; }

interface FormState {
  completeness: string;
  sourceLanguage: string;
  targetLanguage: string;
  expressionType: string;
  tone: string;
  title: string;
  content: string;
  visibility: string;
}

const DRAFT_KEY = "naoii_post_draft";

// ── Helpers ─────────────────────────────────────

function loadDraft(): FormState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveDraft(state: FormState) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(state)); } catch {}
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch {}
}

const DEFAULT_STATE: FormState = {
  completeness: "COMPLETE",
  sourceLanguage: "",
  targetLanguage: "",
  expressionType: "",
  tone: "",
  title: "",
  content: "",
  visibility: "PUBLIC",
};

// ── Props ───────────────────────────────────────

interface Props {
  languages: Language[];
  dict: Dictionary;
  locale: Locale;
  intent: string | null;
}

// ── Main Component ──────────────────────────────

export function PostWizard({ languages, dict, locale, intent }: Props) {
  const router = useRouter();
  const { addToast } = useToast();
  const initialised = useRef(false);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(() => {
    const saved = loadDraft();
    const base = saved || { ...DEFAULT_STATE, completeness: intent === "ask" ? "PARTIAL" : "COMPLETE" };
    return base;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Auto-save
  useEffect(() => {
    if (initialised.current) saveDraft(form);
    else initialised.current = true;
  }, [form]);

  // ── Helpers ─────────────────────────────────
  const update = useCallback((patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => ({ ...prev, [Object.keys(patch)[0]]: "" }));
  }, []);

  const langOptions = languages.map((l) => ({ value: l.id, label: `${l.nativeName} (${l.name})` }));

  const expressionTypeOptions = [
    { value: "daily", label: dict.typeLabels.daily }, { value: "work", label: dict.typeLabels.work },
    { value: "school", label: dict.typeLabels.school }, { value: "travel", label: dict.typeLabels.travel },
    { value: "social_media", label: dict.typeLabels.social_media }, { value: "chat", label: dict.typeLabels.chat },
    { value: "relationships", label: dict.typeLabels.relationships }, { value: "study", label: dict.typeLabels.study },
  ];

  const toneOptions = [
    { value: "request", label: dict.toneLabels.request }, { value: "gratitude", label: dict.toneLabels.gratitude },
    { value: "apology", label: dict.toneLabels.apology }, { value: "refusal", label: dict.toneLabels.refusal },
    { value: "invitation", label: dict.toneLabels.invitation }, { value: "explanation", label: dict.toneLabels.explanation },
    { value: "suggestion", label: dict.toneLabels.suggestion }, { value: "inquiry", label: dict.toneLabels.inquiry },
    { value: "self_intro", label: dict.toneLabels.self_intro },
  ];

  const completenessOptions = [
    { value: "COMPLETE", label: `${dict.completeness.complete} — ${dict.completeness.completeDesc}` },
    { value: "PARTIAL", label: `${dict.completeness.partial} — ${dict.completeness.partialDesc}` },
    { value: "IDEA_ONLY", label: `${dict.completeness.ideaOnly} — ${dict.completeness.ideaOnlyDesc}` },
  ];

  const visOptions = [
    { value: "PUBLIC", label: dict.post.visibilityPublic },
    { value: "UNLISTED", label: dict.post.visibilityUnlisted },
    { value: "PRIVATE", label: dict.post.visibilityPrivate },
  ];

  // ── Validation ──────────────────────────────
  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s >= 0) {
      if (!form.expressionType) e.expressionType = dict.post.selectType;
      if (!form.sourceLanguage) e.sourceLanguage = dict.auth.selectNative;
      if (!form.targetLanguage) e.targetLanguage = dict.auth.selectLearning;
      if (form.sourceLanguage && form.sourceLanguage === form.targetLanguage) {
        e.targetLanguage = "源语言和目标语言不能相同";
      }
      if (!form.tone) e.tone = dict.post.selectTone;
    }
    if (s >= 1) {
      if (form.completeness === "COMPLETE" && !form.content.trim()) {
        e.content = dict.auth.passwordMin;
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Navigation ──────────────────────────────
  const goNext = () => {
    if (!validateStep(step)) return;
    if (step < 2) setStep(step + 1);
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const goStep = (s: number) => {
    if (s < step) { setStep(s); return; }
    if (validateStep(step)) setStep(s);
  };

  // ── Submit ──────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep(2)) return;
    setSubmitting(true);
    const fd = new FormData();
    if (form.title) fd.append("title", form.title);
    fd.append("content", form.content);
    fd.append("sourceLanguage", form.sourceLanguage);
    fd.append("targetLanguage", form.targetLanguage);
    fd.append("expressionType", form.expressionType);
    fd.append("tone", form.tone);
    fd.append("visibility", form.visibility);
    fd.append("completeness", form.completeness);
    try {
      const result = await createPostAction({}, fd);
      if (result?.errors) {
        setErrors((prev) => ({ ...prev, ...Object.fromEntries(Object.entries(result.errors!).map(([k, v]) => [k, v?.[0] || ""])) }));
        setSubmitting(false);
      } else {
        clearDraft();
      }
    } catch (e: any) {
      // redirect() throws NEXT_REDIRECT — let Next.js handle it
      if (e?.digest?.startsWith?.("NEXT_REDIRECT")) return;
      setErrors({ _form: "发布失败" });
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setForm({ ...DEFAULT_STATE, completeness: intent === "ask" ? "PARTIAL" : "COMPLETE" });
    clearDraft();
    setStep(0);
    addToast("草稿已清空", "info");
  };

  // ── Visibility label ─────────────────────────
  const visLabel = form.visibility === "PUBLIC" ? dict.post.visibilityPublic
    : form.visibility === "UNLISTED" ? dict.post.visibilityUnlisted
    : dict.post.visibilityPrivate;

  // ── Render ──────────────────────────────────

  return (
    <div className="flex flex-col gap-4">
      {/* Step Progress */}
      <div className="flex items-center justify-center gap-0 mb-2">
        {[dict.entry.correctOthers || "方向", dict.post.content, dict.post.submit].map((label, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goStep(i)}
            disabled={i > step}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-full transition-colors ${
              i < step ? "text-success cursor-pointer" : i === step ? "bg-primary text-primary-content font-semibold" : "text-base-content/30"
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
              i < step ? "bg-success text-success-content" : i === step ? "bg-primary-content text-primary" : "bg-base-300 text-base-content/40"
            }`}>
              {i < step ? "✓" : i + 1}
            </span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Step 0: Direction ─────────────────── */}
      {step === 0 && (
        <Card>
          <h2 className="text-lg font-bold mb-4">{dict.entry.correctOthers || "表达方向"}</h2>
          <div className="flex flex-col gap-4">
            <Select label={dict.post.expressionType} options={expressionTypeOptions} placeholder={dict.post.selectType} value={form.expressionType} onChange={(e) => update({ expressionType: e.target.value })} error={errors.expressionType} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select label={dict.post.sourceLanguage} options={langOptions} placeholder={dict.post.selectSource} value={form.sourceLanguage} onChange={(e) => update({ sourceLanguage: e.target.value })} error={errors.sourceLanguage} />
              <Select label={dict.post.targetLanguage} options={langOptions} placeholder={dict.post.selectTarget} value={form.targetLanguage} onChange={(e) => update({ targetLanguage: e.target.value })} error={errors.targetLanguage} />
            </div>
            <Select label={dict.post.tone} options={toneOptions} placeholder={dict.post.selectTone} value={form.tone} onChange={(e) => update({ tone: e.target.value })} error={errors.tone} />
            <div className="flex justify-end"><Button variant="primary" onClick={goNext}>下一步 →</Button></div>
          </div>
        </Card>
      )}

      {/* ── Step 1: Content ──────────────────── */}
      {step === 1 && (
        <Card>
          <h2 className="text-lg font-bold mb-4">{dict.post.content}</h2>
          <div className="flex flex-col gap-4">
            <Input label={dict.post.title} placeholder={dict.post.titlePlaceholder} value={form.title} onChange={(e) => update({ title: e.target.value })} />
            <div>
              <label className="label py-1.5"><span className="label-text text-sm font-medium">{dict.post.content}</span></label>
              <TemplateSelector dict={dict} locale={locale} currentContent={form.content} onInsert={(t) => update({ content: t })} />
            </div>
            <div>
              <Textarea label="" placeholder={dict.post.contentPlaceholder} rows={6} value={form.content} onChange={(e) => update({ content: e.target.value })} error={errors.content} />
              <p className="text-xs text-base-content/40 mt-1 text-right">{form.content.length} / 5000</p>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={goBack}>← 上一步</Button>
              <Button variant="primary" onClick={goNext}>下一步 →</Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── Step 2: Confirm ──────────────────── */}
      {step === 2 && (
        <Card>
          <h2 className="text-lg font-bold mb-4">{dict.post.submit}</h2>
          <div className="flex flex-col gap-4">
            {/* Completeness */}
            <Select label={dict.completeness.label} options={completenessOptions} value={form.completeness} onChange={(e) => update({ completeness: e.target.value })} />

            {/* Visibility */}
            <Select label={dict.post.visibility} options={visOptions} value={form.visibility} onChange={(e) => update({ visibility: e.target.value })} />

            {/* Preview */}
            <div className="border border-base-200 rounded-box p-4 bg-base-100">
              <p className="text-xs text-base-content/40 mb-2">预览</p>
              <div className="space-y-2 text-sm">
                <div className="flex flex-wrap gap-1">
                  {form.expressionType && <Badge variant="default" size="sm">{dict.typeLabels[form.expressionType] || form.expressionType}</Badge>}
                  {form.tone && <Badge variant="default" size="sm">{dict.toneLabels[form.tone] || form.tone}</Badge>}
                  <Badge variant={form.completeness === "PARTIAL" ? "warning" : form.completeness === "IDEA_ONLY" ? "error" : "default"} size="sm">{dict.completeness[form.completeness as keyof typeof dict.completeness] || form.completeness}</Badge>
                  <Badge variant="default" size="sm">{visLabel}</Badge>
                </div>
                {form.title && <p className="font-semibold">{form.title}</p>}
                <p className="whitespace-pre-wrap text-base-content/70">{form.content || "(无内容)"}</p>
              </div>
            </div>

            {errors.content && <Alert variant="error">{errors.content}</Alert>}

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <Button variant="primary" className="w-full" loading={submitting} onClick={handleSubmit}>
                {form.visibility === "PUBLIC" ? dict.post.submit : form.visibility === "UNLISTED" ? "发布（仅链接可见）" : "发布（仅自己可见）"}
              </Button>
              <div className="flex justify-between">
                <Button variant="ghost" size="sm" onClick={goBack}>← 上一步</Button>
                <Button variant="ghost" size="sm" onClick={handleClear}>清空草稿</Button>
              </div>
              <p className="text-xs text-base-content/40 text-center">
                {form.visibility === "PUBLIC" ? "发布后所有人可见" : form.visibility === "UNLISTED" ? "仅通过链接访问" : "仅自己可见"}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
