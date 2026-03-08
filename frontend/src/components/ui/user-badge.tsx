import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn, parseBadgeName } from "@/lib/utils";

interface UserBadgeProps {
  badgeName: string;
  className?: string;
}

export const UserBadge = ({ badgeName, className }: UserBadgeProps) => {
  const { name, color } = parseBadgeName(badgeName);

  return (
    <Badge
      className={cn(
        "text-[8px] px-2 py-0.5 h-auto font-black items-center gap-1 border shadow-sm uppercase tracking-wider whitespace-nowrap",
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        borderColor: `${color}40`,
      }}
    >
      {name}
    </Badge>
  );
};

export const UserBadgesList = ({
  badges,
  className,
  itemClassName,
}: {
  badges?: string[];
  className?: string;
  itemClassName?: string;
}) => {
  if (!badges || badges.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {badges.map((badge, index) => (
        <UserBadge key={index} badgeName={badge} className={itemClassName} />
      ))}
    </div>
  );
};
