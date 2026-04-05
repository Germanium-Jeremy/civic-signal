export type ResetMethod = "email" | "phone";

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string): string {
  return value.trim().replace(/[\s()\-]/g, "");
}

export function getResetMethod(identifier: string): ResetMethod {
  return identifier.includes("@") ? "email" : "phone";
}

export function normalizeIdentifier(value: string): { identifier: string; method: ResetMethod } {
  const method = getResetMethod(value.trim());
  return {
    method,
    identifier: method === "email" ? normalizeEmail(value) : normalizePhone(value),
  };
}

export function validatePassword(password: string): string[] {
  const errors: string[] = [];

  if (password.length < 8) errors.push("Password must be at least 8 characters long");
  if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter");
  if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter");
  if (!/\d/.test(password)) errors.push("Password must contain at least one number");
  if (!/[@$!%*?&]/.test(password)) errors.push("Password must contain at least one special character (@$!%*?&)");

  return errors;
}

export function isSixDigitCode(value: string): boolean {
  return /^\d{6}$/.test(value.trim());
}
