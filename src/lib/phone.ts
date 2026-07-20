export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("233") && digits.length >= 12) {
    return `0${digits.slice(3)}`;
  }
  if (digits.length === 9) return `0${digits}`;
  return digits;
}

export function isValidGhanaPhone(phone: string) {
  const n = normalizePhone(phone);
  return /^0[2-5]\d{8}$/.test(n);
}

export function formatPhoneDisplay(phone: string) {
  const n = normalizePhone(phone);
  if (n.length === 10) {
    return `${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
  }
  return phone;
}

export function detectNetwork(
  phone: string
): "MTN" | "Telecel" | "AirtelTigo" | "Other" {
  const n = normalizePhone(phone);
  const prefix = n.slice(0, 3);
  if (["024", "054", "055", "059", "025"].includes(prefix)) return "MTN";
  if (["020", "050"].includes(prefix)) return "Telecel";
  if (["027", "057", "026", "056"].includes(prefix)) return "AirtelTigo";
  return "Other";
}

export function makeReference(prefix = "AJ") {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}${stamp}${rand}`;
}
