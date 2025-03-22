import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function dn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
