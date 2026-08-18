-- Allow moderation to hide rendered Entry records while retaining their content.
ALTER TYPE "EntryStatus" ADD VALUE 'HIDDEN';
