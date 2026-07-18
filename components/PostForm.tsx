"use client";

import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createPostAction } from "@/server/actions/post";
import { TemplateSelector } from "@/components/TemplateSelector";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { Dictionary } from "@/locales";

interface Language { id: string; name: string; nativeName: string; }
interface Props { languages: Language[]; dict: Dictionary; locale: string; intent?: string | null; }

export function PostForm({ languages, dict, locale, intent }: Props) {
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const completenessOptions = useMemo(() => [
    { value: "COMPLETE", label: dict.completeness.complete },
    { value: "PARTIAL", label: dict.completeness.partial },
    { value: "IDEA_ONLY", label: dict.completeness.ideaOnly },
  ], [dict]);

  const expressionTypes = useMemo(() => [
    { value: "diary", label: dict.typeLabels.diary }, { value: "thought", label: dict.typeLabels.thought },
    { value: "daily_expression", label: dict.typeLabels.daily_expression }, { value: "study_note", label: dict.typeLabels.study_note },
    { value: "work_message", label: dict.typeLabels.work_message }, { value: "free", label: dict.typeLabels.free },
  ], [dict]);

  const tones = useMemo(() => [
    { value: "natural", label: dict.toneLabels.natural }, { value: "casual", label: dict.toneLabels.casual },
    { value: "polite", label: dict.toneLabels.polite }, { value: "formal", label: dict.toneLabels.formal },
    { value: "business", label: dict.toneLabels.business },
  ], [dict]);

  const visOptions = useMemo(() => [
    { value: "PUBLIC", label: dict.post.visibilityPublic }, { value: "UNLISTED", label: dict.post.visibilityUnlisted },
    { value: "PRIVATE", label: dict.post.visibilityPrivate },
  ], [dict]);

  const defaultCompleteness = intent === "ask" ? "PARTIAL" : "COMPLETE";

  const schema = useMemo(() => z.object({
    title: z.string().max(200).optional(),
    content: z.string().min(1, dict.auth.passwordMin).max(5000),
    sourceLanguage: z.string().min(1, dict.auth.selectNative),
    targetLanguage: z.string().min(1, dict.auth.selectLearning),
    expressionType: z.string().min(1, dict.post.selectType),
    tone: z.string().min(1, dict.post.selectTone),
    visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]),
    completeness: z.enum(["COMPLETE", "PARTIAL", "IDEA_ONLY"]),
  }), [dict]);

  type FV = z.infer<typeof schema>;

  const { control, handleSubmit, formState: { isSubmitting }, setError } = useForm<FV>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", content: "", sourceLanguage: "", targetLanguage: "", expressionType: intent === "ask" ? "daily_expression" : "", tone: "", visibility: "PUBLIC", completeness: defaultCompleteness },
  });

  const langOptions = languages.map(l => ({ value: l.id, label: `${l.nativeName} (${l.name})` }));

  const onSubmit = async (data: FV) => {
    setServerErrors({});
    const fd = new FormData();
    if (data.title) fd.append("title", data.title);
    fd.append("content", data.content); fd.append("sourceLanguage", data.sourceLanguage);
    fd.append("targetLanguage", data.targetLanguage); fd.append("expressionType", data.expressionType);
    fd.append("tone", data.tone); fd.append("visibility", data.visibility);
    fd.append("completeness", data.completeness);
    const result = await createPostAction({}, fd);
    if (result?.errors) {
      setServerErrors(result.errors);
      for (const [f, ms] of Object.entries(result.errors)) { if (f !== "_form" && ms?.length) setError(f as keyof FV, { type: "server", message: ms[0] }); }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {serverErrors?._form && <Alert variant="error">{serverErrors._form[0]}</Alert>}

      <Controller name="completeness" control={control} render={({ field, fieldState }) => (
        <Select label={dict.completeness.label} options={completenessOptions} error={fieldState.error?.message} {...field} />
      )} />

      <TemplateSelector
        dict={dict}
        locale={locale as "zh" | "en" | "ja"}
        currentContent={control._formValues?.content || ""}
        onInsert={(text) => {
          const input = document.querySelector("[name='content']") as HTMLTextAreaElement;
          if (input) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLTextAreaElement.prototype, "value"
            )?.set;
            nativeInputValueSetter?.call(input, text);
            input.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }}
      />

      <Controller name="title" control={control} render={({ field, fieldState }) => (
        <Input label={dict.post.title} placeholder={dict.post.titlePlaceholder} error={fieldState.error?.message} {...field} />
      )} />
      <Controller name="content" control={control} render={({ field, fieldState }) => (
        <Textarea label={dict.post.content} placeholder={dict.post.contentPlaceholder} rows={6} error={fieldState.error?.message} {...field} />
      )} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller name="sourceLanguage" control={control} render={({ field, fieldState }) => (
          <Select label={dict.post.sourceLanguage} options={langOptions} placeholder={dict.post.selectSource} error={fieldState.error?.message} {...field} />
        )} />
        <Controller name="targetLanguage" control={control} render={({ field, fieldState }) => (
          <Select label={dict.post.targetLanguage} options={langOptions} placeholder={dict.post.selectTarget} error={fieldState.error?.message} {...field} />
        )} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Controller name="expressionType" control={control} render={({ field, fieldState }) => (
          <Select label={dict.post.expressionType} options={expressionTypes} placeholder={dict.post.selectType} error={fieldState.error?.message} {...field} />
        )} />
        <Controller name="tone" control={control} render={({ field, fieldState }) => (
          <Select label={dict.post.tone} options={tones} placeholder={dict.post.selectTone} error={fieldState.error?.message} {...field} />
        )} />
        <Controller name="visibility" control={control} render={({ field, fieldState }) => (
          <Select label={dict.post.visibility} options={visOptions} error={fieldState.error?.message} {...field} />
        )} />
      </div>
      <div className="mt-2"><Button type="submit" variant="primary" loading={isSubmitting}>{dict.post.submit}</Button></div>
    </form>
  );
}
