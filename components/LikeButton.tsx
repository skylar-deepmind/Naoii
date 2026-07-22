"use client";

import { useState, useTransition } from "react";
import { toggleLikeAction } from "@/server/actions/like";

interface Props {
  entryId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeButton({ entryId, initialLiked, initialCount }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, start] = useTransition();

  const handleToggle = () => {
    start(async () => {
      const fd = new FormData();
      fd.append("entryId", entryId);
      const result = await toggleLikeAction({}, fd);
      if (result.liked !== undefined) {
        setLiked(result.liked);
        setCount((c) => c + (result.liked ? 1 : -1));
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      className={`btn btn-sm gap-1 ${liked ? "btn-primary" : "btn-ghost"}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill={liked ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <span>{count}</span>
    </button>
  );
}
