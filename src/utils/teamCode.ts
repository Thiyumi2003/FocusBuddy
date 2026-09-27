export const CODE_PATTERN = /^[A-Z]{2,5}-\d{4}$/;

export function normaliseCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 10);
}