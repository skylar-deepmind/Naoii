import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
} as const;

type AvatarSize = keyof typeof sizeClasses;

interface UserAvatarProps {
  src?: string | null;
  username: string;
  size?: AvatarSize;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(/[\s_@]+/)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const avatarColors = [
  "#0075de", "#213183", "#d6b6f6", "#ff64c8",
  "#dd5b00", "#2a9d99", "#1aae39", "#62aef0",
];

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function UserAvatar({
  src,
  username,
  size = "md",
  className,
}: UserAvatarProps) {
  if (src) {
    return (
      <div className={cn("avatar", className)}>
        <div className={cn("rounded-full", sizeClasses[size])}>
          <img src={src} alt={username} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-medium text-white shrink-0",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: stringToColor(username) }}
      title={username}
    >
      {getInitials(username)}
    </div>
  );
}
