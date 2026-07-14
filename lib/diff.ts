export type DiffSegment = {
  type: "same" | "removed" | "added";
  text: string;
};

/**
 * Word-level diff between original and corrected text.
 * Uses Intl.Segmenter for CJK text, whitespace-based for English.
 */
export function computeDiff(
  original: string,
  corrected: string
): DiffSegment[] {
  const originalTokens = tokenize(original);
  const correctedTokens = tokenize(corrected);

  // Build LCS table
  const m = originalTokens.length;
  const n = correctedTokens.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (originalTokens[i - 1] === correctedTokens[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build segments
  const reversed: DiffSegment[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && originalTokens[i - 1] === correctedTokens[j - 1]) {
      reversed.push({ type: "same", text: originalTokens[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      reversed.push({ type: "added", text: correctedTokens[j - 1] });
      j--;
    } else if (i > 0) {
      reversed.push({ type: "removed", text: originalTokens[i - 1] });
      i--;
    }
  }

  // Reverse and merge
  const segments: DiffSegment[] = [];
  for (let k = reversed.length - 1; k >= 0; k--) {
    segments.push(reversed[k]);
  }

  return mergeSegments(segments);
}

// ── Tokenizer ───────────────────────────────────────

const CJK_RE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
const JP_RE = /[\p{Script=Hiragana}\p{Script=Katakana}]/u;

function tokenize(text: string): string[] {
  // Try Intl.Segmenter when available
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    try {
      const locale = pickLocale(text);
      const segmenter = new Intl.Segmenter(locale, { granularity: "word" });
      return [...segmenter.segment(text)].map((s) => s.segment);
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback
  if (CJK_RE.test(text)) {
    return Array.from(text);
  }
  return text.match(/[\s]+|[^\s]+/g) || [text];
}

function pickLocale(text: string): string {
  if (JP_RE.test(text)) return "ja-JP";
  if (CJK_RE.test(text)) return "zh-CN";
  return "en-US";
}

// ── Merge ───────────────────────────────────────────

function mergeSegments(segments: DiffSegment[]): DiffSegment[] {
  if (segments.length === 0) return [];

  const merged: DiffSegment[] = [segments[0]];

  for (let i = 1; i < segments.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = segments[i];

    // Merge same-type neighbors
    if (prev.type === curr.type) {
      prev.text += curr.text;
    }
    // Merge adjacent removed+added into a replacement pair (keep separate but adjacent)
    // This is already handled by the output — removed then added appear consecutively.
    else {
      merged.push(curr);
    }
  }

  return merged;
}
