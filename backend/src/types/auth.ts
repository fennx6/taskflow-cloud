/**
 * Bentuk user yang boleh diketahui oleh request yang sedang terautentikasi.
 * Password tidak pernah termasuk di sini.
 */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
}
