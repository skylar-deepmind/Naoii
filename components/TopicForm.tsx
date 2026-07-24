"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { Dictionary } from "@/locales";

interface TopicFormData {
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  isPermanent: boolean;
  startTime: string;
  endTime: string;
  eventDescription: string;
}

interface Props {
  action: (prev: unknown, formData: FormData) => Promise<any>;
  initialData?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    coverImage: string | null;
    isPermanent: boolean;
    startTime: string | null;
    endTime: string | null;
    eventDescription: string | null;
  };
  dict: Dictionary;
}

export function TopicForm({ action, initialData, dict }: Props) {
  const adminT = dict.admin?.topics || {};

  const [form, setForm] = useState<TopicFormData>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    coverImage: initialData?.coverImage || "",
    isPermanent: initialData?.isPermanent ?? true,
    startTime: initialData?.startTime || "",
    endTime: initialData?.endTime || "",
    eventDescription: initialData?.eventDescription || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof TopicFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSlugFromName = (name: string) => {
    if (!initialData && !form.slug) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 50);
      setForm((prev) => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "请输入话题名称";
    if (!form.slug.trim()) errs.slug = "请输入 URL 标识";
    if (!form.description.trim()) errs.description = "请输入简介";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    const fd = new FormData();
    if (initialData) fd.append("topicId", initialData.id);
    fd.append("name", form.name);
    fd.append("slug", form.slug);
    fd.append("description", form.description);
    if (form.coverImage) fd.append("coverImage", form.coverImage);
    fd.append("isPermanent", String(form.isPermanent));
    if (!form.isPermanent && form.startTime) fd.append("startTime", form.startTime);
    if (!form.isPermanent && form.endTime) fd.append("endTime", form.endTime);
    if (form.eventDescription) fd.append("eventDescription", form.eventDescription);

    const result = await action({}, fd);
    if (result?.errors) {
      setErrors(Object.fromEntries(Object.entries(result.errors).map(([k, v]) => [k, v?.[0] || ""])));
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <label className="label text-sm font-medium">{adminT.name || "话题名称"}</label>
        <Input
          value={form.name}
          onChange={(e) => {
            update("name", e.target.value);
            handleSlugFromName(e.target.value);
          }}
          placeholder={adminT.namePlaceholder || "输入话题名称"}
        />
        {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="label text-sm font-medium">{adminT.slug || "URL 标识"}</label>
        <Input
          value={form.slug}
          onChange={(e) => update("slug", e.target.value)}
          placeholder={adminT.slugPlaceholder || "如: summer-2024"}
        />
        <p className="text-xs text-ink-faint mt-1">仅限小写字母、数字和连字符</p>
        {errors.slug && <p className="text-error text-xs mt-1">{errors.slug}</p>}
      </div>

      <div>
        <label className="label text-sm font-medium">{adminT.description || "简介"}</label>
        <Textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder={adminT.descriptionPlaceholder || "简要介绍话题内容"}
          rows={3}
        />
        {errors.description && <p className="text-error text-xs mt-1">{errors.description}</p>}
      </div>

      <div>
        <label className="label text-sm font-medium">{adminT.coverImage || "封面图"}</label>
        <Input
          value={form.coverImage}
          onChange={(e) => update("coverImage", e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="form-control">
        <label className="label cursor-pointer justify-start gap-3">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={form.isPermanent}
            onChange={(e) => update("isPermanent", e.target.checked)}
          />
          <span className="label-text">{adminT.isPermanent || "常驻话题"}</span>
        </label>
        <p className="text-xs text-ink-faint ml-7 -mt-1">
          {adminT.isPermanentHint || "开启后话题不会过期，关闭则为限时活动"}
        </p>
      </div>

      {!form.isPermanent && (
        <div className="space-y-3 bg-base-200 rounded-box p-3">
          <p className="text-sm font-semibold">{adminT.eventInfo || "活动信息"}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-sm">{adminT.startTime || "开始时间"}</label>
              <Input type="datetime-local" value={form.startTime} onChange={(e) => update("startTime", e.target.value)} />
            </div>
            <div>
              <label className="label text-sm">{adminT.endTime || "结束时间"}</label>
              <Input type="datetime-local" value={form.endTime} onChange={(e) => update("endTime", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label text-sm">{adminT.eventDescription || "活动说明"}</label>
            <Textarea
              value={form.eventDescription}
              onChange={(e) => update("eventDescription", e.target.value)}
              placeholder={adminT.eventDescriptionPlaceholder || "补充活动详情、规则等信息"}
              rows={3}
            />
          </div>
        </div>
      )}

      {errors._form && <p className="text-error text-sm">{errors._form}</p>}

      <Button variant="primary" onClick={handleSubmit} disabled={submitting} className="w-full">
        {submitting ? (dict.common?.loading || "提交中...") : (initialData ? (adminT.edit || "保存修改") : (adminT.create || "创建话题"))}
      </Button>
    </div>
  );
}
