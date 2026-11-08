/**
 * Email selalu disimpan dan dibandingkan dalam bentuk ternormalisasi,
 * supaya "Budi@Mail.com" dan "budi@mail.com" tidak menjadi dua akun berbeda.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
