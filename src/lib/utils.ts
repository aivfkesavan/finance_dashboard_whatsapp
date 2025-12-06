import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return formatDate(date);
}

export function calculateWaitingTime(createdAt: string): number {
  const now = new Date();
  const created = new Date(createdAt);
  return Math.floor((now.getTime() - created.getTime()) / 60000); // minutes
}

export function getWaitingTimeBadgeColor(minutes: number): "default" | "success" | "warning" | "destructive" | "info" | "secondary" | "outline" {
  if (minutes > 30) return 'destructive';
  if (minutes > 15) return 'warning';
  return 'secondary';
}
