import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCPF(cpf: string) {
  // Remove non-digits and format as xxx.xxx.xxx-xx
  const cleaned = cpf.replace(/\D/g, "").slice(0, 11);
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatPhoneNumber(phone: string) {
  // Remove non-digits and format as (DDD) x xxxx-xxxx
  const cleaned = phone.replace(/\D/g, "").slice(0, 11);
  if (cleaned.length <= 10) {
    // Format as (XX) XXXX-XXXX
    return cleaned
      .replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
      .replace(/-$/, "");
  } else {
    // Format as (XX) X XXXX-XXXX
    return cleaned
      .replace(/(\d{2})(\d{1})(\d{4})(\d{0,4})/, "($1) $2 $3-$4")
      .replace(/-$/, "");
  }
}

export function formatName(name: string) {
  // Split the name into words and capitalize each one
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim();
}

export function formatDate(date: string) {
  // Remove non-digits and format as DD/MM/YYYY
  const cleaned = date.replace(/\D/g, "").slice(0, 8);
  if (cleaned.length <= 2) {
    return cleaned;
  } else if (cleaned.length <= 4) {
    return cleaned.replace(/(\d{2})(\d{0,2})/, "$1/$2");
  } else {
    return cleaned.replace(/(\d{2})(\d{2})(\d{0,4})/, "$1/$2/$3");
  }
}

export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Se ainda não fez aniversário este ano, subtrai 1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}