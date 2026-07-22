"use client";

import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateProfileAction } from "@/server/actions/profile";
import { useToast } from "@/lib/toast";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { AvatarUpload } from "@/components/AvatarUpload";
import type { SessionUser } from "@/lib/auth";
import type { Dictionary } from "@/locales";

interface Language { id: string; name: string; nativeName: string; }
interface Props { user: SessionUser; profile: { displayName: string | null; bio: string | null; nativeLanguageId: string | null; learningLanguageId: string | null; level: string | null; avatarUrl: string | null; }; languages: Language[]; dict: Dictionary; }

export function ProfileForm({ user, profile, languages, dict }: Props) {
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState(false);
  const { addToast } = useToast();

  const levelOptions = useMemo(() => [
    { value: "BEGINNER", label: dict.level.BEGINNER }, { value: "ELEMENTARY", label: dict.level.ELEMENTARY },
    { value: "INTERMEDIATE", label: dict.level.INTERMEDIATE }, { value: "UPPER_INTERMEDIATE", label: dict.level.UPPER_INTERMEDIATE },
    { value: "ADVANCED", label: dict.level.ADVANCED }, { value: "MASTERY", label: dict.level.MASTERY },
  ], [dict]);

  const schema = useMemo(() => z.object({
    displayName: z.string().max(50).optional(), bio: z.string().max(500).optional(),
    nativeLanguage: z.string().optional(), learningLanguage: z.string().optional(), level: z.string().optional(),
  }), []);

  type FV = z.input<typeof schema>;

  const { control, handleSubmit, formState: { isSubmitting }, setError } = useForm<FV>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: profile.displayName ?? "", bio: profile.bio ?? "", nativeLanguage: profile.nativeLanguageId ?? "", learningLanguage: profile.learningLanguageId ?? "", level: profile.level ?? "" },
  });

  const languageOptions = languages.map(l => ({ value: l.id, label: `${l.nativeName} (${l.name})` }));

  const onSubmit = async (data: FV) => {
    setServerErrors({}); setSuccess(false);
    const fd = new FormData();
    if (data.displayName) fd.append("displayName", data.displayName);
    if (data.bio) fd.append("bio", data.bio);
    if (data.nativeLanguage) fd.append("nativeLanguage", data.nativeLanguage);
    if (data.learningLanguage) fd.append("learningLanguage", data.learningLanguage);
    if (data.level) fd.append("level", data.level);
    const result = await updateProfileAction({}, fd);
    if (result?.errors) {
      setServerErrors(result.errors);
      for (const [f, ms] of Object.entries(result.errors)) { if (f !== "_form" && ms?.length) setError(f as keyof FV, { type: "server", message: ms[0] }); }
    } else if (result?.success) { setSuccess(true); addToast(dict.settings.saved); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {serverErrors?._form && <Alert variant="error">{serverErrors._form[0]}</Alert>}
      {success && <Alert variant="success">{dict.settings.saved}</Alert>}

      <AvatarUpload
        username={user.username}
        currentUrl={profile.avatarUrl}
        dict={dict.settings as Record<string, string>}
        onSave={async (base64) => {
          const fd = new FormData();
          fd.append("avatarUrl", base64);
          await updateProfileAction({}, fd);
          addToast(dict.settings.saved);
        }}
      />
      <Controller name="displayName" control={control} render={({ field, fieldState }) => <Input label={dict.settings.displayName} placeholder={dict.settings.displayNamePlaceholder} hint={dict.settings.displayNameHint} error={fieldState.error?.message} {...field} />} />
      <Controller name="bio" control={control} render={({ field, fieldState }) => <Textarea label={dict.settings.bio} placeholder={dict.settings.bioPlaceholder} hint={dict.settings.bioHint} rows={3} error={fieldState.error?.message} {...field} />} />
      <Controller name="nativeLanguage" control={control} render={({ field, fieldState }) => <Select label={dict.auth.nativeLanguage} options={languageOptions} placeholder={dict.auth.selectNativeLanguage} error={fieldState.error?.message} {...field} />} />
      <Controller name="learningLanguage" control={control} render={({ field, fieldState }) => <Select label={dict.auth.learningLanguage} options={languageOptions} placeholder={dict.auth.selectLearningLanguage} error={fieldState.error?.message} {...field} />} />
      <Controller name="level" control={control} render={({ field, fieldState }) => <Select label={dict.auth.level} options={levelOptions} placeholder={dict.auth.selectLevel} error={fieldState.error?.message} {...field} />} />
      <div className="mt-2"><Button type="submit" variant="primary" loading={isSubmitting}>{dict.settings.saveButton}</Button></div>
    </form>
  );
}
