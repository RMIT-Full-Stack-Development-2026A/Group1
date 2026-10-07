import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Standard shadcn/componentry.dev helper: merges conditional class names
 * and resolves conflicting Tailwind utility classes. Used by ported
 * componentry.dev components (MagneticDock, HoverTransition, PixelCanvas).
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
