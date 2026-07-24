"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { ImageCropper } from "@/components/ImageCropper";
import { TopicSelector } from "@/components/TopicSelector";
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
  topicId: string;
}

const DRAFT_KEY = "naoii_article_draft";

function loadDraft(): FormState | null {
  if (typeof window === "undefined") return null;
  try { const raw = localStorage.getItem(DRAFT_KEY); if (raw) return JSON.parse(raw); } catch {}
  return null;
}
function saveDraft(state: FormState) { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(state)); } catch {} }
function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch {} }

const DEFAULT_STATE: FormState = {
  title: "", content: "", coverImage: "", tags: "", visibility: "PUBLIC", status: "PUBLISHED", topicId: "",
};

interface Props {
  dict: Dictionary;
  editEntry?: { id: string; title: string | null; content: string; coverImage: string | null; tags: string[]; visibility: string; };
}

export function ArticleEditor({ dict, editEntry }: Props) {
  const { addToast } = useToast();
  const initialised = useRef(false);

  const [form, setForm] = useState<FormState>(() => {
    if (editEntry) return { title: editEntry.title || "", content: editEntry.content, coverImage: editEntry.coverImage || "", tags: editEntry.tags.join("、"), visibility: editEntry.visibility, status: "PUBLISHED", topicId: "" };
    return loadDraft() || { ...DEFAULT_STATE };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);

  useEffect(() => {
    if (!editEntry) { if (initialised.current) saveDraft(form); else initialised.current = true; }
  }, [form, editEntry]);

  const update = useCallback((patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => (patch.title !== undefined ? { ...prev, title: "" } : patch.content !== undefined ? { ...prev, content: "" } : prev));
  }, []);

  const handleCoverPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErrors((prev) => ({ ...prev, coverImage: dict.article?.uploadSizeError || "图片不能超过5MB" })); return; }
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) { setErrors((prev) => ({ ...prev, coverImage: dict.article?.uploadTypeError || "不支持此格式" })); return; }
    setCropFile(file);
  };

  const handleCropConfirm = async (cropped: File) => {
    setCropFile(null);
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", cropped);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) { update({ coverImage: data.url }); addToast(dict.article?.uploadSuccess || "上传成功", "success"); }
      else setErrors((prev) => ({ ...prev, coverImage: dict.article?.uploadFailed || "上传失败" }));
    } catch { setErrors((prev) => ({ ...prev, coverImage: dict.article?.uploadFailed || "上传失败" })); }
    finally { setUploading(false); }
  };

  const visOptions = [
    { value: "PUBLIC", label: dict.post.visibilityPublic },
    { value: "UNLISTED", label: dict.post.visibilityUnlisted },
    { value: "PRIVATE", label: dict.post.visibilityPrivate },
  ];

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = dict.article?.titleRequired || "请输入标题";
    if (!form.content.trim()) e.content = dict.article?.contentRequired || "请输入正文";
    if (form.content.length > 30000) e.content = dict.article?.contentTooLong || "正文不能超过30000字";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!isDraft && !validate()) return;
    setSubmitting(true);
    const fd = new FormData();
    fd.append("type", "ARTICLE");
    fd.append("title", form.title);
    fd.append("content", form.content);
    if (form.coverImage) fd.append("coverImage", form.coverImage);
    if (form.tags) fd.append("tags", form.tags);
    fd.append("visibility", form.visibility);
    fd.append("status", isDraft ? "DRAFT" : "PUBLISHED");
    if (form.topicId) fd.append("topicId", form.topicId);
    try {
      const action = editEntry ? updateEntryAction : createEntryAction;
      if (editEntry) fd.append("entryId", editEntry.id);
      const result = await action({}, fd);
      if (result?.errors) {
        setErrors((prev) => ({ ...prev, ...Object.fromEntries(Object.entries(result.errors!).map(([k, v]) => [k, v?.[0] || ""])) }));
        setSubmitting(false);
      } else if (editEntry && result?.success) { clearDraft(); addToast(dict.article?.saved || "保存成功", "success"); setSubmitting(false); }
    } catch (e: any) { if (e?.digest?.startsWith?.("NEXT_REDIRECT")) { clearDraft(); return; } setErrors({ _form: editEntry ? dict.article?.saveFailed || "保存失败" : dict.article?.publishFailed || "发布失败" }); setSubmitting(false); }
  };

  const excerpt = form.content.slice(0, 200) + (form.content.length > 200 ? "..." : "");
  const tagList = form.tags.split(/[,，、\s]+/).filter(Boolean);

  return (
    <div className="flex flex-col gap-4">
      {cropFile && (
        <ImageCropper file={cropFile} onConfirm={handleCropConfirm} onCancel={() => setCropFile(null)} dict={dict.article as Record<string, any>} />
      )}

      <Card>
        <div className="flex flex-col gap-4">
          {/* ── Cover ─────────────────── */}
          <div>
            <label className="label py-1.5"><span className="label-text text-sm font-medium">{dict.article?.coverImage || "封面图"}</span></label>
            {form.coverImage ? (
              <div className="relative rounded-box overflow-hidden">
                <img src={form.coverImage} alt="" className="w-full h-40 object-cover" />
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <label className="btn btn-xs bg-base-100/80 hover:bg-base-100 cursor-pointer">
                    ↻ <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleCoverPick} disabled={uploading} />
                  </label>
                  <button type="button" onClick={() => update({ coverImage: "" })} className="btn btn-xs bg-base-100/80 hover:bg-base-100 text-error">✕</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <label className={`btn btn-sm btn-outline cursor-pointer ${uploading ? "loading" : ""}`}>
                  {dict.article?.uploadCover || "上传封面"}
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleCoverPick} disabled={uploading} />
                </label>
                <span className="text-xs text-base-content/40">{dict.article?.uploadHint || "支持 JPG/PNG/WebP，最大 5MB"}</span>
              </div>
            )}
            {errors.coverImage && <p className="text-xs text-error mt-1">{errors.coverImage}</p>}
          </div>

          {/* ── Title ────────────────── */}
          <Input label={dict.post.title} placeholder={dict.article?.titlePlaceholder || "标题"} value={form.title} onChange={(e) => update({ title: e.target.value })} error={errors.title} />

          {/* ── Content ──────────────── */}
          <div>
            <label className="label py-1.5"><span className="label-text text-sm font-medium">{dict.post.content}</span></label>
            <textarea
              className="textarea textarea-bordered w-full text-sm leading-relaxed"
              style={{ minHeight: 320, resize: "vertical" }}
              placeholder={dict.article?.contentPlaceholder || "开始写你的文章..."}
              value={form.content}
              onChange={(e) => update({ content: e.target.value })}
            />
            <p className="text-xs text-base-content/40 mt-1 text-right">{form.content.length} / 30000</p>
            {errors.content && <p className="text-xs text-error mt-1">{errors.content}</p>}
          </div>

          {/* ── Tags + Visibility ─────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input label={dict.article?.tags || "标签"} placeholder={dict.article?.tagsPlaceholder || "逗号分隔"} value={form.tags} onChange={(e) => update({ tags: e.target.value })} />
              {tagList.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">{tagList.map((t, i) => <Badge key={i} variant="default" size="sm">{t}</Badge>)}</div>
              )}
            </div>
            <Select label={dict.post.visibility} options={visOptions} value={form.visibility} onChange={(e) => update({ visibility: e.target.value })} />
          </div>

          <TopicSelector value={form.topicId} onChange={(id) => update({ topicId: id })} dict={dict} />

          {/* ── Feed Card Preview ─────── */}
          {(form.title || form.content || form.coverImage) && (
            <div>
              <label className="label py-1.5"><span className="label-text text-sm font-medium">{dict.article?.feedPreview || "广场展示预览"}</span></label>
              <div className="border border-base-200 rounded-box overflow-hidden w-full max-w-sm cursor-default">
                {form.coverImage && (
                  <div className="w-full h-40 bg-base-200">
                    <img src={form.coverImage} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-base leading-snug mb-1 line-clamp-1">{form.title || dict.common.placeholder}</h3>
                  <p className="text-sm text-base-content/70 leading-relaxed line-clamp-2">{excerpt || dict.common.placeholder}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="text-xs text-base-content/40">{dict.article?.feedAuthor || "--"}</span>
                    <span className="text-xs text-base-content/20">·</span>
                    <span className="text-xs text-base-content/40">{dict.article?.feedTime || "--"}</span>
                    {tagList.length > 0 && <><span className="text-xs text-base-content/20">·</span>{tagList.slice(0, 3).map((t, i) => <Badge key={i} variant="default" size="sm">{t}</Badge>)}</>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {errors._form && <Alert variant="error">{errors._form}</Alert>}

          {/* ── Actions ────────────────── */}
          <div className="flex gap-3 pt-2">
            <Button variant="primary" className="flex-1" loading={submitting} onClick={() => handleSubmit(false)}>
              {editEntry ? dict.common.save : dict.article?.publish || "发布篇章"}
            </Button>
            {!editEntry && (
              <>
                <Button variant="outline" loading={submitting} onClick={() => handleSubmit(true)}>{dict.article?.saveDraft || "保存草稿"}</Button>
                <Button variant="ghost" onClick={() => { setForm({ ...DEFAULT_STATE }); clearDraft(); addToast(dict.post.draftCleared, "info"); }}>{dict.post.clearDraft}</Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
