import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseBadgeName(badgeName: string | null) {
  if (!badgeName) return { name: "Unknown Badge", color: "#8E51FF" };

  const parts = badgeName.split('|').map(p => p.trim());
  const name = parts[0] || "Unknown Badge";
  const color = parts[1] || "#8E51FF";

  return { name, color };
}
