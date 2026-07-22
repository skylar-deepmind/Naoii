"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { createEntryAction, updateEntryAction } from "@/server/actions/entry";
import { useToast } from "@/lib/toast";
import type { Dictionary } from "@/locales";

interface FormState {
  title: string;
  content: string;
  coverImage: string;
  tags: string;
  visibility: string;
  status: string;
}

const DRAFT_KEY = "naoii_article_draft";

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
  title: "",
  content: "",
  coverImage: "",
  tags: "",
  visibility: "PUBLIC",
  status: "PUBLISHED",
};

interface Props {
  dict: Dictionary;
  editEntry?: {
    id: string;
    title: string | null;
    content: string;
    coverImage: string | null;
    tags: string[];
    visibility: string;
  };
}

export function ArticleEditor({ dict, editEntry }: Props) {
  const { addToast } = useToast();
  const initialised = useRef(false);

  const [form, setForm] = useState<FormState>(() => {
    if (editEntry) {
      return {
        title: editEntry.title || "",
        content: editEntry.content,
        coverImage: editEntry.coverImage || "",
        tags: editEntry.tags.join("、"),
        visibility: editEntry.visibility,
        status: "PUBLISHED",
      };
    }
    const saved = loadDraft();
    return saved || { ...DEFAULT_STATE };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!editEntry) {
      if (initialised.current) saveDraft(form);
      else initialised.current = true;
    }
  }, [form, editEntry]);

  const update = useCallback((patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => ({ ...prev, [Object.keys(patch)[0]]: "" }));
  }, []);

  const visOptions = [
    { value: "PUBLIC", label: dict.post.visibilityPublic },
    { value: "UNLISTED", label: dict.post.visibilityUnlisted },
    { value: "PRIVATE", label: dict.post.visibilityPrivate },
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, coverImage: dict.article?.uploadSizeError || "图片大小不能超过 5MB" }));
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setErrors((prev) => ({ ...prev, coverImage: dict.article?.uploadTypeError || "仅支持 JPG、PNG、WebP、GIF 格式" }));
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        update({ coverImage: data.url });
        addToast(dict.article?.uploadSuccess || "封面上传成功", "success");
      } else {
        setErrors((prev) => ({ ...prev, coverImage: dict.article?.uploadFailed || "上传失败" }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, coverImage: dict.article?.uploadFailed || "上传失败，请稍后再试" }));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveCover = () => {
    update({ coverImage: "" });
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = dict.article?.titleRequired || "请输入标题";
    if (!form.content.trim()) e.content = dict.article?.contentRequired || "请输入正文内容";
    if (form.content.length > 30000) e.content = dict.article?.contentTooLong || "正文不能超过 30000 字";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!isDraft && !validate()) return;
    setSubmitting(true);

    const fd = new FormData();
    fd.append("type", "ARTICLE");
    fd.append("title", form.title || dict.common.placeholder);
    fd.append("content", form.content);
    if (form.coverImage) fd.append("coverImage", form.coverImage);
    if (form.tags) fd.append("tags", form.tags);
    fd.append("visibility", form.visibility);
    fd.append("status", isDraft ? "DRAFT" : "PUBLISHED");

    try {
      const action = editEntry ? updateEntryAction : createEntryAction;
      if (editEntry) fd.append("entryId", editEntry.id);

      const result = await action({}, fd);
      if (result?.errors) {
        setErrors((prev) => ({
          ...prev,
          ...Object.fromEntries(
            Object.entries(result.errors!).map(([k, v]) => [k, v?.[0] || ""])
          ),
        }));
        setSubmitting(false);
      } else if (editEntry && result?.success) {
        clearDraft();
        addToast(dict.article?.saved || "保存成功", "success");
        setSubmitting(false);
      }
      // createEntryAction redirects on success
    } catch (e: any) {
      if (e?.digest?.startsWith?.("NEXT_REDIRECT")) {
        clearDraft();
        return;
      }
      setErrors({ _form: editEntry ? dict.article?.saveFailed || "保存失败" : dict.article?.publishFailed || "发布失败" });
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setForm({ ...DEFAULT_STATE });
    clearDraft();
    addToast(dict.post.draftCleared, "info");
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex flex-col gap-4">
          {editEntry ? null : (
            <p className="text-sm text-base-content/50">{dict.article?.newDesc || "写一篇长文章、日记或博客"}</p>
          )}

          <Input
            label={dict.post.title}
            placeholder={dict.article?.titlePlaceholder || "给你的文章起个标题"}
            value={form.title}
            onChange={(e) => update({ title: e.target.value })}
            error={errors.title}
          />

          {/* Cover image */}
          <div>
            <label className="label py-1.5">
              <span className="label-text text-sm font-medium">{dict.article?.coverImage || "封面图"}</span>
            </label>
            {form.coverImage ? (
              <div className="relative inline-block">
                <img src={form.coverImage} alt={dict.article?.coverAlt || "封面"} className="w-48 h-32 object-cover rounded-box" />
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="btn btn-xs btn-error absolute top-1 right-1"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <label className="btn btn-sm btn-outline">
                  {uploading ? dict.common.loading : dict.article?.uploadCover || "上传封面"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
                <span className="text-xs text-base-content/40">{dict.article?.uploadHint || "支持 JPG/PNG/WebP，最大 5MB"}</span>
              </div>
            )}
            {errors.coverImage && <p className="text-xs text-error mt-1">{errors.coverImage}</p>}
          </div>

          {/* Content */}
          <Textarea
            label={dict.post.content}
            placeholder={dict.article?.contentPlaceholder || "开始写你的文章..."}
            rows={14}
            value={form.content}
            onChange={(e) => update({ content: e.target.value })}
            error={errors.content}
          />
          <p className="text-xs text-base-content/40 -mt-3 text-right">
            {form.content.length} / 30000
          </p>

          {/* Tags */}
          <Input
            label={dict.article?.tags || "标签"}
            placeholder={dict.article?.tagsPlaceholder || "用逗号或顿号分隔，如：日记、学习、生活"}
            value={form.tags}
            onChange={(e) => update({ tags: e.target.value })}
          />
          {form.tags && (
            <div className="flex flex-wrap gap-1 -mt-3">
              {form.tags
                .split(/[,，、]/)
                .map((t) => t.trim())
                .filter((t) => t.length > 0)
                .map((tag, i) => (
                  <Badge key={i} variant="default" size="sm">{tag}</Badge>
                ))}
            </div>
          )}

          {/* Visibility */}
          <Select
            label={dict.post.visibility}
            options={visOptions}
            value={form.visibility}
            onChange={(e) => update({ visibility: e.target.value })}
          />

          {errors._form && <Alert variant="error">{errors._form}</Alert>}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="primary"
              className="flex-1"
              loading={submitting}
              onClick={() => handleSubmit(false)}
            >
              {editEntry ? dict.common.save : dict.article?.publish || "发布篇章"}
            </Button>
            {!editEntry && (
              <>
                <Button
                  variant="outline"
                  loading={submitting}
                  onClick={() => handleSubmit(true)}
                >
                  {dict.article?.saveDraft || "保存草稿"}
                </Button>
                <Button variant="ghost" onClick={handleClear}>
                  {dict.post.clearDraft}
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
