"use client";

import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createCorrectionAction } from "@/server/actions/correction";
import { useToast } from "@/lib/toast";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { Dictionary } from "@/locales";

interface Props { postId: string; originalContent: string; dict: Dictionary; }

export function CorrectionForm({ postId, originalContent, dict }: Props) {
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState(false);
  const { addToast } = useToast();

  const toneOptions = useMemo(() => [
    { value: "", label: dict.correction.notSpecified },
    { value: "natural", label: dict.toneLabels.natural }, { value: "casual", label: dict.toneLabels.casual },
    { value: "polite", label: dict.toneLabels.polite }, { value: "formal", label: dict.toneLabels.formal },
    { value: "business", label: dict.toneLabels.business },
  ], [dict]);

  const schema = useMemo(() => z.object({
    correctedText: z.string().min(1, dict.auth.passwordMin).max(5000),
    explanation: z.string().max(1000).optional(),
    toneNote: z.string().optional(),
  }), [dict]);

  type FV = z.input<typeof schema>;

  const { control, handleSubmit, formState: { isSubmitting }, setError, reset } = useForm<FV>({
    resolver: zodResolver(schema),
    defaultValues: { correctedText: "", explanation: "", toneNote: "" },
  });

  const onSubmit = async (data: FV) => {
    setServerErrors({});
    const fd = new FormData(); fd.append("postId", postId); fd.append("correctedText", data.correctedText);
    if (data.explanation) fd.append("explanation", data.explanation);
    if (data.toneNote) fd.append("toneNote", data.toneNote);
    const result = await createCorrectionAction({}, fd);
    if (result?.errors) {
      setServerErrors(result.errors);
      for (const [f, ms] of Object.entries(result.errors)) { if (f !== "_form" && ms?.length) setError(f as keyof FV, { type: "server", message: ms[0] }); }
    } else if (result?.success) { setSuccess(true); reset(); addToast(dict.correction.successMessage); }
  };

  if (success) return <Alert variant="success" className="mt-4">{dict.correction.successMessage}</Alert>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
      <h3 className="font-semibold text-base">{dict.correction.submitTitle}</h3>
      {serverErrors?._form && <Alert variant="error">{serverErrors._form[0]}</Alert>}
      <div className="text-sm text-base-content/50">
        <p className="mb-2">{dict.correction.original}：</p>
        <div className="bg-base-200 rounded-box p-3 text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">{originalContent}</div>
      </div>
      <Controller name="correctedText" control={control} render={({ field, fieldState }) => (
        <Textarea label={dict.correction.correctedText} placeholder={dict.correction.correctedPlaceholder} rows={5} error={fieldState.error?.message} {...field} />
      )} />
      <Controller name="explanation" control={control} render={({ field, fieldState }) => (
        <Textarea label={dict.correction.explanation} placeholder={dict.correction.explanationPlaceholder} rows={2} error={fieldState.error?.message} {...field} />
      )} />
      <Controller name="toneNote" control={control} render={({ field, fieldState }) => (
        <Select label={dict.correction.toneNote} options={toneOptions} error={fieldState.error?.message} {...field} />
      )} />
      <Button type="submit" variant="primary" loading={isSubmitting}>{dict.correction.submitButton}</Button>
    </form>
  );
}
