"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface Props {
  file: File;
  onConfirm: (blob: File) => void;
  onCancel: () => void;
  dict: Record<string, any>;
}

const CROP_WIDTH = 1200;
const CROP_HEIGHT = 500; // matches feed card preview (w-full h-40)

export function ImageCropper({ file, onConfirm, onCancel, dict }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        const s = Math.max(CROP_WIDTH / img.width, CROP_HEIGHT / img.height);
        setScale(s);
        setOffset({ x: (CROP_WIDTH - img.width * s) / 2, y: (CROP_HEIGHT - img.height * s) / 2 });
        setLoaded(true);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [file]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, CROP_WIDTH, CROP_HEIGHT);
    ctx.drawImage(img, offset.x, offset.y, img.width * scale, img.height * scale);
  }, [scale, offset]);

  useEffect(() => {
    if (loaded) draw();
  }, [loaded, draw]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    const img = imageRef.current;
    if (!img) return;
    const w = img.width * scale, h = img.height * scale;
    setOffset({
      x: Math.min(0, Math.max(CROP_WIDTH - w, newX)),
      y: Math.min(0, Math.max(CROP_HEIGHT - h, newY)),
    });
  };
  const handleMouseUp = () => setDragging(false);

  const handleZoom = (dir: number) => {
    setScale((s) => {
      const ns = Math.max(0.3, Math.min(5, s + dir * 0.2));
      const img = imageRef.current;
      if (!img) return ns;
      const centerX = CROP_WIDTH / 2, centerY = CROP_HEIGHT / 2;
      const ratio = ns / s;
      setOffset((prev) => ({
        x: centerX - (centerX - prev.x) * ratio,
        y: centerY - (centerY - prev.y) * ratio,
      }));
      return ns;
    });
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const cropped = new File([blob], file.name.replace(/\.\w+$/, "_cropped$&"), {
        type: file.type || "image/jpeg",
      });
      onConfirm(cropped);
    }, file.type || "image/jpeg", 0.9);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div className="bg-base-100 rounded-2xl overflow-hidden w-[560px] max-w-[95vw]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-base-200">
          <h3 className="font-semibold text-sm">{dict.cropTitle || "裁剪封面"}</h3>
          <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm btn-circle">✕</button>
        </div>
        <div className="p-4">
          <p className="text-xs text-ink-muted mb-3">{dict.cropHint || "拖动调整位置，滚轮缩放"}</p>
          <div
            className="relative w-full overflow-hidden rounded-lg cursor-move select-none"
            style={{ height: 300 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={(e) => { e.preventDefault(); handleZoom(e.deltaY > 0 ? -1 : 1); }}
          >
            <canvas
              ref={canvasRef}
              width={CROP_WIDTH}
              height={CROP_HEIGHT}
              className="w-full h-full object-contain"
            />
            {/* Grid overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 border-2 border-white/60 rounded" />
              <div className="absolute top-1/2 left-0 right-0 border-t border-white/20" />
              <div className="absolute left-1/2 top-0 bottom-0 border-l border-white/20" />
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center px-3 py-2 bg-base-200/50">
          <div className="flex gap-1">
            <button type="button" onClick={() => handleZoom(1)} className="btn btn-ghost btn-xs text-lg">+</button>
            <button type="button" onClick={() => handleZoom(-1)} className="btn btn-ghost btn-xs text-lg">−</button>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onCancel}>{dict.common?.cancel || "取消"}</Button>
            <Button variant="primary" size="sm" onClick={handleConfirm}>{dict.confirm || "确认"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
