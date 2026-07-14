"use client";

import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginAction } from "@/server/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { Dictionary } from "@/locales";

export function LoginForm({ dict }: { dict: Dictionary }) {
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const schema = useMemo(() => z.object({
    email: z.string().email(dict.auth.emailInvalid),
    password: z.string().min(1, dict.auth.passwordMin),
  }), [dict]);

  type FormValues = z.infer<typeof schema>;

  const { control, handleSubmit, formState: { isSubmitting }, setError } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: FormValues) => {
    setServerErrors({});
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    const result = await loginAction({}, formData);
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
      <Controller name="email" control={control} render={({ field, fieldState }) => (
        <Input label={dict.auth.email} type="email" placeholder={dict.auth.emailPlaceholder} error={fieldState.error?.message} {...field} />
      )} />
      <Controller name="password" control={control} render={({ field, fieldState }) => (
        <Input label={dict.auth.password} type="password" placeholder={dict.auth.passwordPlaceholder} error={fieldState.error?.message} {...field} />
      )} />
      <Button type="submit" variant="primary" className="w-full mt-2" loading={isSubmitting}>{dict.auth.loginButton}</Button>
    </form>
  );
}
