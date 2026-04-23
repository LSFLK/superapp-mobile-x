import { clsx, type ClassValue } from "clsx";

export function className(...inputs: ClassValue[]) {
  return clsx(inputs);
}
