"use client";

import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerAction } from "@/server/actions/auth";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { Dictionary } from "@/locales";

interface Language { id: string; name: string; nativeName: string; }

interface Props { languages: Language[]; dict: Dictionary; }

export function RegisterForm({ languages, dict }: Props) {
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const schema = useMemo(() => z.object({
    username: z.string().min(2, dict.auth.userMin).max(20, dict.auth.userMax).regex(/^[a-zA-Z0-9_]+$/, dict.auth.userRegex),
    email: z.string().email(dict.auth.emailInvalid),
    password: z.string().min(6, dict.auth.passwordMin),
    confirmPassword: z.string(),
    nativeLanguage: z.string().min(1, dict.auth.selectNative),
    learningLanguage: z.string().min(1, dict.auth.selectLearning),
    level: z.string().min(1, dict.auth.selectLevelError),
  }).refine((d) => d.password === d.confirmPassword, { message: dict.auth.passwordMismatch, path: ["confirmPassword"] }), [dict]);

  type FormValues = z.infer<typeof schema>;

  const { control, handleSubmit, formState: { isSubmitting }, setError } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", email: "", password: "", confirmPassword: "", nativeLanguage: "", learningLanguage: "", level: "" },
  });

  const levelOptions = useMemo(() => [
    { value: "BEGINNER", label: dict.level.BEGINNER },
    { value: "ELEMENTARY", label: dict.level.ELEMENTARY },
    { value: "INTERMEDIATE", label: dict.level.INTERMEDIATE },
    { value: "UPPER_INTERMEDIATE", label: dict.level.UPPER_INTERMEDIATE },
    { value: "ADVANCED", label: dict.level.ADVANCED },
    { value: "MASTERY", label: dict.level.MASTERY },
  ], [dict]);

  const languageOptions = languages.map(l => ({ value: l.id, label: `${l.nativeName} (${l.name})` }));

  const onSubmit = async (data: FormValues) => {
    setServerErrors({});
    const fd = new FormData();
    fd.append("username", data.username); fd.append("email", data.email);
    fd.append("password", data.password); fd.append("confirmPassword", data.confirmPassword);
    fd.append("nativeLanguage", data.nativeLanguage); fd.append("learningLanguage", data.learningLanguage);
    fd.append("level", data.level);
    const result = await registerAction({}, fd);
    if (result?.errors) {
      setServerErrors(result.errors);
      for (const [field, messages] of Object.entries(result.errors)) {
        if (field !== "_form" && messages?.length) setError(field as keyof FormValues, { type: "server", message: messages[0] });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {serverErrors?._form && <Alert variant="error">{serverErrors._form[0]}</Alert>}
      <Controller name="username" control={control} render={({ field, fieldState }) => (
        <Input label={dict.auth.username} placeholder={dict.auth.usernamePlaceholder} error={fieldState.error?.message} {...field} />
      )} />
      <Controller name="email" control={control} render={({ field, fieldState }) => (
        <Input label={dict.auth.email} type="email" placeholder={dict.auth.emailPlaceholder} error={fieldState.error?.message} {...field} />
      )} />
      <Controller name="password" control={control} render={({ field, fieldState }) => (
        <Input label={dict.auth.password} type="password" placeholder={dict.auth.passwordPlaceholder} error={fieldState.error?.message} {...field} />
      )} />
      <Controller name="confirmPassword" control={control} render={({ field, fieldState }) => (
        <Input label={dict.auth.confirmPassword} type="password" placeholder={dict.auth.confirmPasswordPlaceholder} error={fieldState.error?.message} {...field} />
      )} />
      <Controller name="nativeLanguage" control={control} render={({ field, fieldState }) => (
        <Select label={dict.auth.nativeLanguage} options={languageOptions} placeholder={dict.auth.selectNativeLanguage} error={fieldState.error?.message} {...field} />
      )} />
      <Controller name="learningLanguage" control={control} render={({ field, fieldState }) => (
        <Select label={dict.auth.learningLanguage} options={languageOptions} placeholder={dict.auth.selectLearningLanguage} error={fieldState.error?.message} {...field} />
      )} />
      <Controller name="level" control={control} render={({ field, fieldState }) => (
        <Select label={dict.auth.level} options={levelOptions} placeholder={dict.auth.selectLevel} error={fieldState.error?.message} {...field} />
      )} />
      <Button type="submit" variant="primary" className="w-full mt-2" loading={isSubmitting}>{dict.auth.registerButton}</Button>
    </form>
  );
}
