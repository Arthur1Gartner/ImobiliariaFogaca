export function formatCurrency(value?: number) {
  if (!value) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatArea(value?: number) {
  if (!value) return "-";
  return `${new Intl.NumberFormat("pt-BR").format(value)} m2`;
}

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function maskPhone(value: string) {
  const digits = normalizePhone(value);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function sanitizeText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .trim();
}

export function isValidEmail(value?: string) {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidBrazilPhone(value: string) {
  return /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(value);
}
