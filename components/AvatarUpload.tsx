"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/Button";

interface Props {
  username: string;
  currentUrl: string | null;
  onSave: (base64: string) => Promise<void>;
  dict: Record<string, string>;
}

const MAX_SIZE = 200;

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = MAX_SIZE;
      canvas.height = MAX_SIZE;
      const ctx = canvas.getContext("2d")!;

      // Cover crop: scale to fill, center
      const scale = Math.max(MAX_SIZE / img.width, MAX_SIZE / img.height);
      const sw = MAX_SIZE / scale;
      const sh = MAX_SIZE / scale;
      const sx = (img.width - sw) / 2;
      const sy = (img.height - sh) / 2;

      ctx.fillStyle = "#e5e7eb";
      ctx.fillRect(0, 0, MAX_SIZE, MAX_SIZE);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, MAX_SIZE, MAX_SIZE);

      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function AvatarUpload({ username, currentUrl, onSave, dict }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return; // max 5MB

    setLoading(true);
    try {
      const base64 = await resizeImage(file);
      setPreview(base64);
      await onSave(base64);
      router.refresh();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative group cursor-pointer"
        title={dict.clickToChange || "点击更换头像"}
      >
        <UserAvatar username={username} src={preview} size="lg" />
        <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white text-xs font-medium">{dict.changeAvatar || "更换"}</span>
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFile}
      />
      <div className="text-xs text-ink-muted">
        <p>{dict.clickToUpload || "点击头像上传"}</p>
        <p>{dict.uploadHint || "支持 JPG、PNG、WebP，最大 5MB"}</p>
        {loading && <p className="text-primary mt-1">{dict.processing || "处理中..."}</p>}
      </div>
    </div>
  );
}
